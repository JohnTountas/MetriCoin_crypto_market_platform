import type { PortfolioTransaction } from '@/shared/types';

import { portfolioTransactionFormSchema } from './portfolioFormSchemas';
import { validateTransactionLedger } from './portfolioTransactionInsights';

type ParsedCsvImportSummary = {
  importedCount: number;
  assetCount: number;
  totalNotional: number;
};

export type PortfolioCsvImportResult =
  | {
      isValid: true;
      transactions: Omit<PortfolioTransaction, 'id'>[];
      summary: ParsedCsvImportSummary;
    }
  | {
      isValid: false;
      errors: string[];
    };

// CSV parsing looks simple until quotes and commas show up in the same row.
// This parser keeps the import dependency-light while still handling quoted cells.
const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && insideQuotes && nextCharacter === '"') {
      currentValue += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === ',' && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
      continue;
    }

    currentValue += character;
  }

  values.push(currentValue.trim());
  return values;
};

const headerAliases = {
  asset: ['asset', 'asset_id', 'assetid', 'symbol', 'ticker', 'product', 'product_id'],
  side: ['side', 'action'],
  quantity: ['quantity', 'qty', 'amount', 'size'],
  price: ['price', 'execution_price', 'fill_price'],
  fee: ['fee', 'fees', 'commission'],
  executedAt: ['executed_at', 'executedat', 'timestamp', 'time', 'date'],
  note: ['note', 'notes', 'memo', 'comment'],
} as const;

const resolveHeaderIndex = (headers: string[], aliases: readonly string[]) =>
  headers.findIndex((header) => aliases.includes(header));

const normalizeHeader = (header: string) =>
  header.toLowerCase().replace(/[^a-z0-9]/g, '');

const normalizeAssetId = (rawAsset: string) => {
  const cleanedValue = rawAsset.trim().toUpperCase().replace(/\s+/g, '');

  if (cleanedValue.includes('/')) {
    const [baseAsset, quoteAsset] = cleanedValue.split('/');
    return `${baseAsset}-${quoteAsset}`;
  }

  if (cleanedValue.includes('-')) {
    return cleanedValue;
  }

  return `${cleanedValue}-USD`;
};

export const parsePortfolioTransactionsCsv = (csvText: string): PortfolioCsvImportResult => {
  // We intentionally trim empty lines first so exports from spreadsheets and
  // exchange back offices behave the same way.
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return {
      isValid: false,
      errors: ['CSV imports need a header row and at least one trade row.'],
    };
  }

  const normalizedHeaders = parseCsvLine(lines[0]).map(normalizeHeader);
  const assetIndex = resolveHeaderIndex(normalizedHeaders, headerAliases.asset);
  const sideIndex = resolveHeaderIndex(normalizedHeaders, headerAliases.side);
  const quantityIndex = resolveHeaderIndex(normalizedHeaders, headerAliases.quantity);
  const priceIndex = resolveHeaderIndex(normalizedHeaders, headerAliases.price);
  const executedAtIndex = resolveHeaderIndex(normalizedHeaders, headerAliases.executedAt);
  const feeIndex = resolveHeaderIndex(normalizedHeaders, headerAliases.fee);
  const noteIndex = resolveHeaderIndex(normalizedHeaders, headerAliases.note);

  if ([assetIndex, sideIndex, quantityIndex, priceIndex, executedAtIndex].some((index) => index === -1)) {
    return {
      isValid: false,
      errors: [
        'CSV headers must include asset, side, quantity, price, and executedAt/date columns.',
      ],
    };
  }

  const parsedTransactions: Omit<PortfolioTransaction, 'id'>[] = [];
  const rowErrors: string[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const cells = parseCsvLine(lines[lineIndex]);
    const executedAtValue = cells[executedAtIndex] ?? '';
    const executedAtDate = new Date(executedAtValue);
    const executedAtIso = Number.isNaN(executedAtDate.getTime()) ? '' : executedAtDate.toISOString();
    const normalizedTransaction = portfolioTransactionFormSchema.safeParse({
      assetId: normalizeAssetId(cells[assetIndex] ?? ''),
      side: (cells[sideIndex] ?? '').trim().toLowerCase(),
      quantity: cells[quantityIndex] ?? '',
      price: cells[priceIndex] ?? '',
      fee: feeIndex === -1 ? 0 : cells[feeIndex] ?? 0,
      executedAt: executedAtIso,
      note: noteIndex === -1 ? '' : cells[noteIndex] ?? '',
    });

    if (!normalizedTransaction.success || Number.isNaN(executedAtDate.getTime())) {
      rowErrors.push(`Row ${lineIndex + 1} is invalid and could not be imported.`);
      continue;
    }

    parsedTransactions.push({
      ...normalizedTransaction.data,
      executedAt: executedAtDate.toISOString(),
      note: normalizedTransaction.data.note?.trim() ? normalizedTransaction.data.note.trim() : undefined,
    });
  }

  if (rowErrors.length > 0) {
    return {
      isValid: false,
      errors: rowErrors,
    };
  }

  return {
    isValid: true,
    transactions: parsedTransactions,
    summary: {
      importedCount: parsedTransactions.length,
      assetCount: new Set(parsedTransactions.map((transaction) => transaction.assetId)).size,
      totalNotional: parsedTransactions.reduce(
        (sum, transaction) => sum + transaction.quantity * transaction.price,
        0,
      ),
    },
  };
};

export const validateImportedTransactions = (
  existingTransactions: PortfolioTransaction[],
  importedTransactions: Omit<PortfolioTransaction, 'id'>[],
) => {
  // Reusing the existing ledger validator keeps CSV imports honest and avoids
  // creating a second source of truth for portfolio consistency rules.
  const candidateTransactions = [
    ...existingTransactions,
    ...importedTransactions.map((transaction, index) => ({
      ...transaction,
      id: `csv-import-${index}`,
    })),
  ];

  return validateTransactionLedger(candidateTransactions);
};
