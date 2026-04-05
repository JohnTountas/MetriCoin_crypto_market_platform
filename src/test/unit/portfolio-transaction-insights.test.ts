import { describe, expect, it } from 'vitest';

import {
  calculateTransactionActivitySummary,
  getAvailableAssetQuantityAt,
  sortTransactionsByExecutedAt,
  validateTransactionLedger,
} from '@/entities/portfolio';
import type { PortfolioTransaction } from '@/shared';

const transactions: PortfolioTransaction[] = [
  {
    id: 'btc-buy-1',
    assetId: 'BTC-USD',
    side: 'buy',
    quantity: 1,
    price: 60_000,
    fee: 10,
    executedAt: '2026-01-01T10:00:00.000Z',
  },
  {
    id: 'eth-buy-1',
    assetId: 'ETH-USD',
    side: 'buy',
    quantity: 3,
    price: 2_500,
    fee: 6,
    executedAt: '2026-01-10T08:30:00.000Z',
  },
  {
    id: 'btc-sell-1',
    assetId: 'BTC-USD',
    side: 'sell',
    quantity: 0.4,
    price: 70_000,
    fee: 9,
    executedAt: '2026-03-01T15:45:00.000Z',
  },
];

describe('portfolio transaction insights', () => {
  it('builds transaction activity metrics', () => {
    const summary = calculateTransactionActivitySummary(transactions);

    expect(summary).toMatchObject({
      totalTransactions: 3,
      buyTransactions: 2,
      sellTransactions: 1,
      grossBuyValue: 67_500,
      grossSellValue: 28_000,
      totalFeesPaid: 25,
      netCashFlow: -39_525,
      activeAssetCount: 2,
      lastExecutedAt: '2026-03-01T15:45:00.000Z',
    });
  });

  it('tracks available quantity at a specific execution time', () => {
    expect(
      getAvailableAssetQuantityAt(
        transactions,
        'BTC-USD',
        '2026-02-10T12:00:00.000Z',
      ),
    ).toBe(1);

    expect(
      getAvailableAssetQuantityAt(
        transactions,
        'BTC-USD',
        '2026-03-02T12:00:00.000Z',
      ),
    ).toBe(0.6);
  });

  it('sorts newest transactions first for ledger display', () => {
    const sortedTransactions = sortTransactionsByExecutedAt(transactions);

    expect(sortedTransactions.map((transaction) => transaction.id)).toEqual([
      'btc-sell-1',
      'eth-buy-1',
      'btc-buy-1',
    ]);
  });

  it('rejects sell transactions that would take an asset below zero', () => {
    const invalidTransactions: PortfolioTransaction[] = [
      {
        id: 'btc-sell-too-early',
        assetId: 'BTC-USD',
        side: 'sell',
        quantity: 0.75,
        price: 68_000,
        fee: 8,
        executedAt: '2025-12-15T10:00:00.000Z',
      },
      {
        id: 'btc-buy-later',
        assetId: 'BTC-USD',
        side: 'buy',
        quantity: 1,
        price: 60_000,
        fee: 10,
        executedAt: '2026-01-01T10:00:00.000Z',
      },
    ];

    expect(validateTransactionLedger(invalidTransactions)).toEqual({
      isValid: false,
      issue: {
        transactionId: 'btc-sell-too-early',
        assetId: 'BTC-USD',
        availableQuantity: 0,
        attemptedQuantity: 0.75,
        executedAt: '2025-12-15T10:00:00.000Z',
      },
    });
  });
});
