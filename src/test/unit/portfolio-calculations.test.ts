import { describe, expect, it } from 'vitest';

import { calculatePortfolioSummary, calculateOpenPositions } from '@/entities/portfolio';
import type { CalculatorSettings, MarketSnapshot, PortfolioTransaction } from '@/shared';

const settings: CalculatorSettings = {
  estimatedFeeRate: 0.1,
  estimatedSlippageRate: 0.05,
  preferredCurrency: 'USD',
};

const snapshots: Record<string, MarketSnapshot> = {
  'BTC-USD': {
    assetId: 'BTC-USD',
    price: 90_000,
    change24h: 2_500,
    changePercent24h: 2.85,
    volume24h: 24_000_000_000,
    high24h: 91_000,
    low24h: 87_000,
    open24h: 87_500,
    marketCap: 1_780_000_000_000,
    bid: 89_998,
    ask: 90_002,
    spread: 4,
    lastUpdated: Date.now(),
    direction: 'up',
  },
};

const transactions: PortfolioTransaction[] = [
  {
    id: 'buy-1',
    assetId: 'BTC-USD',
    side: 'buy',
    quantity: 0.5,
    price: 60_000,
    fee: 12,
    executedAt: '2026-01-01T10:00:00.000Z',
  },
  {
    id: 'buy-2',
    assetId: 'BTC-USD',
    side: 'buy',
    quantity: 0.25,
    price: 70_000,
    fee: 8,
    executedAt: '2026-02-01T10:00:00.000Z',
  },
];

describe('portfolio calculations', () => {
  it('builds position metrics from transactions and live snapshots', () => {
    const positions = calculateOpenPositions(transactions, snapshots, settings);

    expect(positions).toHaveLength(1);
    expect(positions[0]).toMatchObject({
      assetId: 'BTC-USD',
      quantity: 0.75,
      currentPrice: 90_000,
      currentValue: 67_500,
      feesPaid: 20,
    });
    expect(positions[0].averageCost).toBeCloseTo(63_360, 0);
    expect(positions[0].unrealizedPnL).toBeCloseTo(19_980, 0);
    expect(positions[0].breakEvenPrice).toBeGreaterThan(positions[0].averageCost);
  });

  it('builds summary metrics from open positions', () => {
    const positions = calculateOpenPositions(transactions, snapshots, settings);
    const summary = calculatePortfolioSummary(positions, settings);

    expect(summary.currentValue).toBe(67_500);
    expect(summary.investedCapital).toBeCloseTo(47_520, 0);
    expect(summary.roiPercent).toBeGreaterThan(40);
    expect(summary.totalFeesPaid).toBeGreaterThan(20);
  });
});

