import { requestJson, runtimeConfig } from '@/api/core';
import {
  ASSET_LOOKUP,
  TRACKED_ASSETS,
  TIMEFRAME_OPTIONS,
} from '@/shared/constants';
import type { AssetMeta, AssetTimeSeries, MarketCandle, MarketSnapshot } from '@/shared/types';

import { createCoinbaseMarketStream } from './coinbaseMarketStream';
import type { MarketDataProvider, MarketStreamHandlers } from './marketDataProvider';
import {
  coinbaseCandleSchema,
  coinbaseProductStatsSchema,
  coinbaseTickerResponseSchema,
} from './coinbaseMarketSchemas';

const toNumber = (value?: string) => (value ? Number(value) : undefined);

const createMarketSnapshot = (
  assetId: string,
  ticker: {
    price: string;
    bid?: string;
    ask?: string;
    time?: string;
  },
  stats: {
    open: string;
    high: string;
    low: string;
    volume: string;
  },
): MarketSnapshot => {
  const asset = ASSET_LOOKUP[assetId];
  const price = Number(ticker.price);
  const open24h = Number(stats.open);
  const change24h = price - open24h;
  const changePercent24h = open24h === 0 ? 0 : (change24h / open24h) * 100;
  const bid = toNumber(ticker.bid);
  const ask = toNumber(ticker.ask);

  return {
    assetId,
    price,
    change24h,
    changePercent24h,
    volume24h: Number(stats.volume),
    high24h: Number(stats.high),
    low24h: Number(stats.low),
    open24h,
    marketCap: asset?.circulatingSupply ? price * asset.circulatingSupply : undefined,
    bid,
    ask,
    spread: bid && ask ? ask - bid : undefined,
    lastUpdated: ticker.time ? Date.parse(ticker.time) : Date.now(),
    direction: 'flat',
  };
};

const fetchAssetSnapshot = async (assetId: string) => {
  const [ticker, stats] = await Promise.all([
    requestJson({
      url: `${runtimeConfig.marketApiBaseUrl}/products/${assetId}/ticker`,
      schema: coinbaseTickerResponseSchema,
    }),
    requestJson({
      url: `${runtimeConfig.marketApiBaseUrl}/products/${assetId}/stats`,
      schema: coinbaseProductStatsSchema,
    }),
  ]);

  return createMarketSnapshot(assetId, ticker, stats);
};

const fetchSnapshotsWithConcurrency = async (assetIds: string[], concurrency = 8) => {
  const snapshotMap = new Map<string, MarketSnapshot>();
  let nextAssetIndex = 0;

  const workers = Array.from({ length: Math.min(concurrency, assetIds.length) }, async () => {
    while (nextAssetIndex < assetIds.length) {
      const currentIndex = nextAssetIndex;
      nextAssetIndex += 1;
      const assetId = assetIds[currentIndex];

      try {
        const snapshot = await fetchAssetSnapshot(assetId);
        snapshotMap.set(assetId, snapshot);
      } catch {
        // Skip unavailable products so the rest of the market catalog still loads.
      }
    }
  });

  await Promise.all(workers);

  return assetIds
    .map((assetId) => snapshotMap.get(assetId))
    .filter((snapshot): snapshot is MarketSnapshot => Boolean(snapshot));
};

const mapCoinbaseCandle = (candle: [number, number, number, number, number, number]): MarketCandle => {
  const [time, low, high, open, close, volume] = candle;

  return {
    time,
    low,
    high,
    open,
    close,
    volume,
  };
};

export const coinbaseMarketDataSource: MarketDataProvider = {
  async fetchAssets() {
    return TRACKED_ASSETS;
  },
  async fetchSnapshots(assetIds) {
    const fulfilled = await fetchSnapshotsWithConcurrency(assetIds);

    if (fulfilled.length === 0) {
      throw new Error('Unable to load market snapshots.');
    }

    return fulfilled.sort(
      (left, right) =>
        assetIds.indexOf(left.assetId) - assetIds.indexOf(right.assetId),
    );
  },
  async fetchCandles(assetId, timeframe) {
    const timeframeConfig = TIMEFRAME_OPTIONS.find((option) => option.label === timeframe);
    if (!timeframeConfig) {
      throw new Error(`Unsupported timeframe: ${timeframe}`);
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - timeframeConfig.seconds * 1000);
    const candles = await requestJson({
      url:
        `${runtimeConfig.marketApiBaseUrl}/products/${assetId}/candles?granularity=${timeframeConfig.granularity}` +
        `&start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
      schema: coinbaseCandleSchema,
    });

    return {
      assetId,
      timeframe,
      candles: [...candles].map(mapCoinbaseCandle).sort((left, right) => left.time - right.time),
    } satisfies AssetTimeSeries;
  },
  createStream(assetIds, handlers: MarketStreamHandlers) {
    return createCoinbaseMarketStream(assetIds, handlers);
  },
};

