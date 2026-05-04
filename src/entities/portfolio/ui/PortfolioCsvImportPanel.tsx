// PortfolioCsvImportPanel owns the user-facing CSV import flow into the validated portfolio ledger.
// It is the safest place to extend import behavior without weakening ledger guardrails.
import { FileUp } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';

import { useAppStore } from '@/app';
import {
  parsePortfolioTransactionsCsv,
  validateImportedTransactions,
} from '@/entities/portfolio/model';
import { usePortfolioStore } from '@/entities/portfolio/model';
import { trackAnalyticsEvent } from '@/hooks/app';
import { Button, Card, formatCurrency, SectionHeading } from '@/shared';

type ImportState =
  | {
      kind: 'idle';
    }
  | {
      kind: 'success';
      importedCount: number;
      assetCount: number;
      totalNotional: number;
    }
  | {
      kind: 'error';
      errors: string[];
    };

/**
 * PortfolioCsvImportPanel brings existing trade history into the local ledger with validation first.
 * The compact layout keeps the import flow readable even when it sits inside a narrower side column.
 */
export const PortfolioCsvImportPanel = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const transactions = usePortfolioStore((state) => state.transactions);
  const importTransactions = usePortfolioStore(
    (state) => state.importTransactions,
  );
  const pushToast = useAppStore((state) => state.pushToast);
  const [importState, setImportState] = useState<ImportState>({ kind: 'idle' });

  /**
   * handleCsvImport parses and validates the selected CSV before it touches the persisted ledger.
   * The extra validation step protects later analytics from malformed or chronologically invalid rows.
   */
  const handleCsvImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    try {
      const csvText = await selectedFile.text();
      const parsedImport = parsePortfolioTransactionsCsv(csvText);

      if (!parsedImport.isValid) {
        setImportState({
          kind: 'error',
          errors: parsedImport.errors,
        });
        pushToast({
          tone: 'error',
          title: 'CSV import failed',
          description:
            parsedImport.errors[0] ??
            'Metricoin could not parse the selected CSV file.',
        });
        return;
      }

      const ledgerValidation = validateImportedTransactions(
        transactions,
        parsedImport.transactions,
      );

      if (!ledgerValidation.isValid) {
        const issue = ledgerValidation.issue;

        setImportState({
          kind: 'error',
          errors: [
            `Import would make ${issue.assetId} sell activity invalid at ${issue.executedAt}.`,
          ],
        });
        pushToast({
          tone: 'error',
          title: 'CSV import rejected',
          description:
            'The imported rows would create an invalid transaction ledger.',
        });
        return;
      }

      importTransactions(parsedImport.transactions);
      setImportState({
        kind: 'success',
        importedCount: parsedImport.summary.importedCount,
        assetCount: parsedImport.summary.assetCount,
        totalNotional: parsedImport.summary.totalNotional,
      });
      pushToast({
        tone: 'success',
        title: 'CSV trades imported',
        description: `Imported ${parsedImport.summary.importedCount} trades across ${parsedImport.summary.assetCount} assets.`,
      });
      trackAnalyticsEvent('portfolio.csv_imported', {
        importedCount: parsedImport.summary.importedCount,
        assetCount: parsedImport.summary.assetCount,
      });
    } catch {
      setImportState({
        kind: 'error',
        errors: ['The selected file is not a valid UTF-8 CSV document.'],
      });
      pushToast({
        tone: 'error',
        title: 'CSV import failed',
        description: 'Metricoin could not read the selected CSV file.',
      });
    } finally {
      event.target.value = '';
    }
  };

  return (
    <Card className="surface p-4 sm:p-5">
      <SectionHeading
        eyebrow="Import"
        title="CSV trade import"
        description="Bring existing fills into the portfolio ledger using a simple CSV with asset, side, quantity, price, fee, and executedAt columns."
      />

      <input
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleCsvImport}
        ref={fileInputRef}
        type="file"
      />

      <div className="mt-6 space-y-4">
        <Button
          className="w-full xs:w-auto"
          onClick={() => fileInputRef.current?.click()}
          variant="secondary"
        >
          <FileUp className="h-4 w-4" />
          Import CSV trades
        </Button>

        <div className="surface-subtle rounded-2xl p-4 text-sm text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)]">
            Expected header example
          </p>
          <code className="mt-2 block rounded-2xl bg-[var(--panel-input)] px-3 py-3 text-xs text-[var(--text-muted)]">
            asset,side,quantity,price,fee,executedAt,note
          </code>
        </div>

        {importState.kind === 'success' ? (
          <div className="surface-subtle rounded-2xl p-4 text-sm text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text-primary)]">
              Last import summary
            </p>
            <p className="mt-2">Trades imported: {importState.importedCount}</p>
            <p className="mt-1">Assets covered: {importState.assetCount}</p>
            <p className="mt-1">
              Total notional: {formatCurrency(importState.totalNotional)}
            </p>
          </div>
        ) : null}

        {importState.kind === 'error' ? (
          <div className="surface-subtle rounded-2xl p-4 text-sm text-[var(--negative-text)]">
            <p className="font-semibold">Import issues</p>
            {importState.errors.slice(0, 4).map((errorMessage) => (
              <p className="mt-2 leading-6" key={errorMessage}>
                {errorMessage}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
};
