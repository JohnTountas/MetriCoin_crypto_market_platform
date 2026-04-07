import { describe, expect, it } from 'vitest';

import { createAssetMeta } from '@/shared/constants';
import { resolveAssetDetailsAssetId } from '@/shared/utils';
import type { MarketSnapshot, PortfolioTransaction, PriceAlert } from '@/shared/types';

const assetLookup = {
  'BTC-USD': createAssetMeta({ id: 'BTC-USD', symbol: 'BTC', name: 'Bitcoin' }),
  'ETH-USD': createAssetMeta({ id: 'ETH-USD', symbol: 'ETH', name: 'Ethereum' }),
};

const transactions: PortfolioTransaction[] = [
  {
    id: 'tx-sol-1',
    assetId: 'SOL-USD',
    side: 'buy',
    quantity: 8,
    price: 150,
    fee: 4,
    executedAt: '2026-01-10T10:00:00.000Z',
  },
];

const alerts: PriceAlert[] = [
  {
    id: 'alert-avax-1',
    assetId: 'AVAX-USD',
    direction: 'above',
    targetPrice: 42,
    triggered: false,
    createdAt: '2026-01-11T10:00:00.000Z',
  },
];

const snapshots: Record<string, MarketSnapshot> = {
  'DOGE-USD': {
    assetId: 'DOGE-USD',
    price: 0.18,
    change24h: 0.01,
    changePercent24h: 6.1,
    volume24h: 1_000_000,
    high24h: 0.19,
    low24h: 0.16,
    open24h: 0.17,
    marketCap: undefined,
    bid: 0.179,
    ask: 0.181,
    spread: 0.002,
    lastUpdated: Date.now(),
    direction: 'up',
  },
};

describe('resolveAssetDetailsAssetId', () => {
  it('accepts bare symbols for tracked assets', () => {
    expect(
      resolveAssetDetailsAssetId({
        requestedAssetId: 'eth',
        assetLookup,
        transactions: [],
        alerts: [],
        snapshots: {},
      }),
    ).toBe('ETH-USD');
  });

  it('keeps ledger-backed assets even when they are not in the live asset lookup', () => {
    expect(
      resolveAssetDetailsAssetId({
        requestedAssetId: 'sol',
        assetLookup,
        transactions,
        alerts: [],
        snapshots: {},
      }),
    ).toBe('SOL-USD');
  });

  it('keeps alert-backed and snapshot-backed assets before falling back to default', () => {
    expect(
      resolveAssetDetailsAssetId({
        requestedAssetId: 'avax',
        assetLookup,
        transactions: [],
        alerts,
        snapshots: {},
      }),
    ).toBe('AVAX-USD');

    expect(
      resolveAssetDetailsAssetId({
        requestedAssetId: 'doge',
        assetLookup,
        transactions: [],
        alerts: [],
        snapshots,
      }),
    ).toBe('DOGE-USD');
  });

  it('falls back to Bitcoin when there is no supported context for the route', () => {
    expect(
      resolveAssetDetailsAssetId({
        requestedAssetId: 'unknown-coin',
        assetLookup,
        transactions: [],
        alerts: [],
        snapshots: {},
      }),
    ).toBe('BTC-USD');
  });
});
