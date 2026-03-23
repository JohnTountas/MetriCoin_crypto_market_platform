import { ASSET_LOOKUP, TIMEFRAME_OPTIONS, TRACKED_ASSETS } from '@/shared/constants';
import type {
  AssetTimeSeries,
  MarketCandle,
  MarketSnapshot,
  MarketTickerMessage,
  Timeframe,
} from '@/shared/types';

import type { MarketDataProvider, MarketStreamHandlers } from './provider';

const mockSnapshots = new Map<string, MarketSnapshot>(
  TRACKED_ASSETS.map((asset, index) => {
    const basePrice = [86_250, 4_650, 184, 21.7, 41.9][index] ?? 100;
    const open24h = basePrice * (1 - (index + 1) * 0.006);
    return [
      asset.id,
      {
        assetId: asset.id,
        price: basePrice,
        change24h: basePrice - open24h,
        changePercent24h: ((basePrice - open24h) / open24h) * 100,
        volume24h: basePrice * (300_000 + index * 120_000),
        high24h: basePrice * 1.018,
        low24h: basePrice * 0.982,
        open24h,
        marketCap: asset.circulatingSupply ? asset.circulatingSupply * basePrice : undefined,
        bid: basePrice - 12,
        ask: basePrice + 12,
        spread: 24,
        lastUpdated: Date.now(),
        direction: 'flat',
      },
    ];
  }),
);

const makeSeries = (assetId: string, timeframe: Timeframe) => {
  const asset = ASSET_LOOKUP[assetId];
  const base = mockSnapshots.get(assetId)?.price ?? 100;
  const config = TIMEFRAME_OPTIONS.find((option) => option.label === timeframe);
  const points = timeframe === '1H' ? 60 : timeframe === '24H' ? 96 : timeframe === '7D' ? 168 : 120;
  const step = config?.seconds ? Math.floor(config.seconds / points) : 3600;

  return Array.from({ length: points }, (_, index) => {
    const time = Math.floor(Date.now() / 1000) - step * (points - index);
    const drift = Math.sin(index / 12) * base * 0.016;
    const trend = index * base * 0.00022;
    const close = base + drift + trend;
    const open = close - base * 0.004;
    const high = close + base * 0.007;
    const low = close - base * 0.009;

    return {
      time,
      open,
      high,
      low,
      close,
      volume: close * (asset?.circulatingSupply ? 0.00001 : 0.00005),
    } satisfies MarketCandle;
  });
};

export const mockMarketProvider: MarketDataProvider = {
  fetchSnapshots(assetIds) {
    return Promise.resolve(
      assetIds
      .map((assetId) => mockSnapshots.get(assetId))
      .filter((snapshot): snapshot is MarketSnapshot => Boolean(snapshot)),
    );
  },
  fetchCandles(assetId, timeframe) {
    return Promise.resolve({
      assetId,
      timeframe,
      candles: makeSeries(assetId, timeframe),
    } satisfies AssetTimeSeries);
  },
  createStream(assetIds, handlers: MarketStreamHandlers) {
    let intervalHandle: ReturnType<typeof setInterval> | undefined;

    return {
      connect: () => {
        handlers.onStatus('connected');
        intervalHandle = setInterval(() => {
          const updates = assetIds.map((assetId, index) => {
            const snapshot = mockSnapshots.get(assetId);
            if (!snapshot) {
              return {
                assetId,
                price: 0,
                lastUpdated: Date.now(),
              } satisfies MarketTickerMessage;
            }

            const movement = (Math.random() - 0.48) * snapshot.price * (0.0009 + index * 0.0002);
            const nextPrice = snapshot.price + movement;
            const updatedSnapshot: MarketSnapshot = {
              ...snapshot,
              price: nextPrice,
              bid: nextPrice - 4,
              ask: nextPrice + 4,
              spread: 8,
              change24h: nextPrice - snapshot.open24h,
              changePercent24h: ((nextPrice - snapshot.open24h) / snapshot.open24h) * 100,
              marketCap: ASSET_LOOKUP[assetId]?.circulatingSupply
                ? nextPrice * (ASSET_LOOKUP[assetId]?.circulatingSupply ?? 0)
                : undefined,
              direction: nextPrice > snapshot.price ? 'up' : nextPrice < snapshot.price ? 'down' : 'flat',
              lastUpdated: Date.now(),
            };

            mockSnapshots.set(assetId, updatedSnapshot);

            return {
              assetId,
              price: nextPrice,
              bid: updatedSnapshot.bid,
              ask: updatedSnapshot.ask,
              volume24h: updatedSnapshot.volume24h,
              lastUpdated: updatedSnapshot.lastUpdated,
            } satisfies MarketTickerMessage;
          });

          handlers.onBatch(updates);
        }, 1_200);
      },
      disconnect: () => {
        handlers.onStatus('disconnected');
        if (intervalHandle) {
          clearInterval(intervalHandle);
        }
      },
    };
  },
};
