import { describe, expect, it } from 'vitest';

import {
  calculatePriceTriggerSummary,
  getPriceTriggerMetrics,
  sortPriceAlerts,
} from '@/entities/portfolio';
import type { MarketSnapshot, PriceAlert } from '@/shared';

const snapshots: Record<string, MarketSnapshot> = {
  'BTC-USD': {
    assetId: 'BTC-USD',
    price: 88_000,
    change24h: 1_000,
    changePercent24h: 1.15,
    volume24h: 18_000_000_000,
    high24h: 89_100,
    low24h: 86_700,
    open24h: 87_000,
    marketCap: 1_740_000_000_000,
    bid: 87_999,
    ask: 88_001,
    spread: 2,
    lastUpdated: Date.now(),
    direction: 'up',
  },
  'ETH-USD': {
    assetId: 'ETH-USD',
    price: 4_000,
    change24h: 90,
    changePercent24h: 2.3,
    volume24h: 9_000_000_000,
    high24h: 4_050,
    low24h: 3_910,
    open24h: 3_910,
    marketCap: 480_000_000_000,
    bid: 3_999,
    ask: 4_001,
    spread: 2,
    lastUpdated: Date.now(),
    direction: 'up',
  },
};

const alerts: PriceAlert[] = [
  {
    id: 'btc-live-near',
    assetId: 'BTC-USD',
    direction: 'above',
    targetPrice: 88_500,
    label: 'Near breakout',
    triggered: false,
    createdAt: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 'eth-live-far',
    assetId: 'ETH-USD',
    direction: 'below',
    targetPrice: 3_500,
    label: 'Risk floor',
    triggered: false,
    createdAt: '2026-04-02T10:00:00.000Z',
  },
  {
    id: 'btc-triggered',
    assetId: 'BTC-USD',
    direction: 'above',
    targetPrice: 87_000,
    label: 'Old breakout',
    triggered: true,
    createdAt: '2026-03-28T10:00:00.000Z',
    triggeredAt: '2026-03-29T10:00:00.000Z',
  },
];

describe('price trigger insights', () => {
  it('measures trigger distance from the current price', () => {
    const metrics = getPriceTriggerMetrics(alerts[0], snapshots['BTC-USD']);

    expect(metrics.crossed).toBe(false);
    expect(metrics.distanceValue).toBe(500);
    expect(metrics.distancePercent).toBeCloseTo(0.57, 2);
  });

  it('sorts live triggers ahead of triggered ones and prioritizes nearest live levels', () => {
    const sortedAlerts = sortPriceAlerts(alerts, snapshots);

    expect(sortedAlerts.map((alert) => alert.id)).toEqual([
      'btc-live-near',
      'eth-live-far',
      'btc-triggered',
    ]);
  });

  it('summarizes trigger coverage and nearest live level', () => {
    const summary = calculatePriceTriggerSummary(alerts, snapshots);

    expect(summary).toMatchObject({
      totalTriggers: 3,
      liveTriggers: 2,
      triggeredCount: 1,
      coveredAssetCount: 2,
    });
    expect(summary.nearestLiveTrigger?.id).toBe('btc-live-near');
    expect(summary.nearestLiveTriggerDistancePercent).toBeCloseTo(0.57, 2);
  });
});
