import { describe, expect, it } from 'vitest';

import { calculatePortfolioPerformancePoints } from '@/entities/portfolio';
import type { MarketCandle, PortfolioTransaction } from '@/shared/types';

describe('portfolio performance history', () => {
  it('reconstructs portfolio value from transactions and candle closes', () => {
    const transactions: PortfolioTransaction[] = [
      {
        id: 'tx-btc-1',
        assetId: 'BTC-USD',
        side: 'buy',
        quantity: 1,
        price: 100,
        fee: 0,
        executedAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    const candlesByAssetId: Record<string, MarketCandle[]> = {
      'BTC-USD': [
        { time: 1_767_225_600, open: 100, high: 100, low: 100, close: 100, volume: 1 },
        { time: 1_767_312_000, open: 100, high: 120, low: 100, close: 120, volume: 1 },
        { time: 1_767_398_400, open: 120, high: 120, low: 90, close: 90, volume: 1 },
      ],
    };

    const points = calculatePortfolioPerformancePoints({
      transactions,
      candlesByAssetId,
    });

    expect(points).toHaveLength(3);
    expect(points[0]).toMatchObject({
      value: 100,
      investedCapital: 100,
      unrealizedPnL: 0,
    });
    expect(points[1]).toMatchObject({
      value: 120,
      investedCapital: 100,
      unrealizedPnL: 20,
    });
    expect(points[2]).toMatchObject({
      value: 90,
      investedCapital: 100,
      unrealizedPnL: -10,
    });
  });
});
