import { describe, expect, it } from 'vitest';

import { parsePortfolioTransactionsCsv, validateImportedTransactions } from '@/entities/portfolio';
import type { PortfolioTransaction } from '@/shared/types';

describe('portfolio CSV import', () => {
  it('parses CSV rows into normalized portfolio transactions', () => {
    const result = parsePortfolioTransactionsCsv(`symbol,side,quantity,price,fee,date,note
ETH,buy,2,3200,4,2026-04-10T10:00:00.000Z,Core add`);

    expect(result.isValid).toBe(true);

    if (!result.isValid) {
      return;
    }

    expect(result.transactions[0]).toMatchObject({
      assetId: 'ETH-USD',
      side: 'buy',
      quantity: 2,
      price: 3200,
      fee: 4,
      note: 'Core add',
    });
    expect(result.summary.importedCount).toBe(1);
  });

  it('rejects CSV files that are missing required headers', () => {
    const result = parsePortfolioTransactionsCsv(`symbol,price
BTC,90000`);

    expect(result).toEqual({
      isValid: false,
      errors: ['CSV headers must include asset, side, quantity, price, and executedAt/date columns.'],
    });
  });

  it('rejects imports that would create an invalid sell ledger', () => {
    const existingTransactions: PortfolioTransaction[] = [
      {
        id: 'tx-btc-1',
        assetId: 'BTC-USD',
        side: 'buy',
        quantity: 0.5,
        price: 60_000,
        fee: 10,
        executedAt: '2026-01-01T10:00:00.000Z',
      },
    ];

    const validation = validateImportedTransactions(existingTransactions, [
      {
        assetId: 'BTC-USD',
        side: 'sell',
        quantity: 1,
        price: 90_000,
        fee: 10,
        executedAt: '2026-02-01T10:00:00.000Z',
      },
    ]);

    expect(validation.isValid).toBe(false);
  });
});
