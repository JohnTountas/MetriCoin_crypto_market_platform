import { describe, expect, it } from 'vitest';

import { selectSupportedTrackedAssets } from '@/api/market/coinbaseMarketApi';

describe('selectSupportedTrackedAssets', () => {
  it('keeps only tracked USD products that are currently tradable', () => {
    const assets = selectSupportedTrackedAssets([
      {
        id: 'ETH-USD',
        base_currency: 'ETH',
        quote_currency: 'USD',
        status: 'online',
        trading_disabled: false,
      },
      {
        id: 'BTC-EUR',
        base_currency: 'BTC',
        quote_currency: 'EUR',
        status: 'online',
        trading_disabled: false,
      },
      {
        id: 'DOGE-USD',
        base_currency: 'DOGE',
        quote_currency: 'USD',
        status: 'online',
        trading_disabled: true,
      },
      {
        id: 'SOL-USD',
        base_currency: 'SOL',
        quote_currency: 'USD',
        status: 'offline',
        trading_disabled: false,
      },
      {
        id: 'BTC-USD',
        base_currency: 'BTC',
        quote_currency: 'USD',
        status: 'online',
        trading_disabled: false,
      },
      {
        id: 'XYZ-USD',
        base_currency: 'XYZ',
        quote_currency: 'USD',
        status: 'online',
        trading_disabled: false,
      },
    ]);

    expect(assets.map((asset) => asset.id)).toEqual(['BTC-USD', 'ETH-USD']);
  });
});
