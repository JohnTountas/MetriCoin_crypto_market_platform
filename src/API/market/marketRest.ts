import { appConfig, fetchJson } from '@/API/core';
import { ASSET_LOOKUP, TIMEFRAME_OPTIONS, TRACKED_ASSETS } from '@/shared/constants';
import type { AssetTimeSeries, MarketCandle, MarketSnapshot } from '@/shared/types';

import { createCoinbaseMarketStream } from './marketSocket';
import type { MarketDataProvider, MarketStreamHandlers } from './provider';
import {
  coinbaseCandleSchema,
  coinbaseProductStatsSchema,
  coinbaseTickerResponseSchema,
} from './schemas';

const toNumber = (value?: string) => (value ? Number(value) : undefined);

const normalizeSnapshot = (
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

const fetchSingleSnapshot = async (assetId: string) => {
  const [ticker, stats] = await Promise.all([
    fetchJson({
      url: `${appConfig.marketRestUrl}/products/${assetId}/ticker`,
      schema: coinbaseTickerResponseSchema,
    }),
    fetchJson({
      url: `${appConfig.marketRestUrl}/products/${assetId}/stats`,
      schema: coinbaseProductStatsSchema,
    }),
  ]);

  return normalizeSnapshot(assetId, ticker, stats);
};

const normalizeCandle = (candle: [number, number, number, number, number, number]): MarketCandle => {
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

export const coinbaseMarketProvider: MarketDataProvider = {
  async fetchSnapshots(assetIds) {
    const snapshotResults = await Promise.allSettled(
      assetIds.map((assetId) => fetchSingleSnapshot(assetId)),
    );

    const fulfilled = snapshotResults
      .filter((result): result is PromiseFulfilledResult<MarketSnapshot> => result.status === 'fulfilled')
      .map((result) => result.value);

    if (fulfilled.length === 0) {
      throw new Error('Unable to load market snapshots.');
    }

    return fulfilled.sort(
      (left, right) =>
        TRACKED_ASSETS.findIndex((asset) => asset.id === left.assetId) -
        TRACKED_ASSETS.findIndex((asset) => asset.id === right.assetId),
    );
  },
  async fetchCandles(assetId, timeframe) {
    const timeframeConfig = TIMEFRAME_OPTIONS.find((option) => option.label === timeframe);
    if (!timeframeConfig) {
      throw new Error(`Unsupported timeframe: ${timeframe}`);
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - timeframeConfig.seconds * 1000);
    const candles = await fetchJson({
      url:
        `${appConfig.marketRestUrl}/products/${assetId}/candles?granularity=${timeframeConfig.granularity}` +
        `&start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
      schema: coinbaseCandleSchema,
    });

    return {
      assetId,
      timeframe,
      candles: [...candles].map(normalizeCandle).sort((left, right) => left.time - right.time),
    } satisfies AssetTimeSeries;
  },
  createStream(assetIds, handlers: MarketStreamHandlers) {
    return createCoinbaseMarketStream(assetIds, handlers);
  },
};
