import { describe, expect, it } from 'vitest';

import { createWorkspaceSnapshot, workspaceSnapshotSchema } from '@/app';

describe('workspace snapshot', () => {
  it('creates a versioned workspace snapshot for export', () => {
    const snapshot = createWorkspaceSnapshot({
      themePreference: 'dark',
      favoriteAssetIds: ['BTC-USD', 'ETH-USD', 'BTC-USD'],
      settings: {
        estimatedFeeRate: 0.1,
        estimatedSlippageRate: 0.05,
        preferredCurrency: 'USD',
      },
      transactions: [
        {
          id: 'tx-1',
          assetId: 'BTC-USD',
          side: 'buy',
          quantity: 0.5,
          price: 90_000,
          fee: 12,
          executedAt: '2026-04-16T11:00:00.000Z',
        },
      ],
      alerts: [],
    });

    expect(snapshot.version).toBe(1);
    expect(snapshot.favoriteAssetIds).toEqual(['BTC-USD', 'ETH-USD']);
    expect(snapshot.exportedAt).toContain('T');
  });

  it('normalizes legacy snapshot exports during import', () => {
    const parsed = workspaceSnapshotSchema.parse({
      exportedAt: '2026-04-16T11:00:00.000Z',
      favoriteAssetIds: ['BTC-USD'],
      settings: {
        estimatedFeeRate: 0.1,
        estimatedSlippageRate: 0.05,
        preferredCurrency: 'USD',
      },
      transactions: [],
      alerts: [],
    });

    expect(parsed.version).toBe(1);
    expect(parsed.themePreference).toBe('system');
    expect(parsed.favoriteAssetIds).toEqual(['BTC-USD']);
  });
});
