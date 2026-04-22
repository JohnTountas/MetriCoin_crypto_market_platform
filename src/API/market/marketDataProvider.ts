// The provider contract keeps the rest of the app agnostic to where market data comes from.
// New providers should implement this shape so hooks and stores can stay unchanged.
import { runtimeConfig } from '@/api/core';
import type {
  AssetMeta,
  AssetTimeSeries,
  MarketSnapshot,
  MarketTickerMessage,
  StreamConnectionStatus,
  Timeframe,
} from '@/shared/types';

import { coinbaseMarketDataSource } from './coinbaseMarketApi';
import { mockMarketDataSource } from './mockMarketDataProvider';

export type MarketStreamHandlers = {
  onBatch: (messages: MarketTickerMessage[]) => void;
  onStatus: (status: StreamConnectionStatus) => void;
  onError: (message: string) => void;
};

export type MarketStream = {
  connect: () => void;
  disconnect: () => void;
};

export type MarketDataProvider = {
  fetchAssets: () => Promise<AssetMeta[]>;
  fetchSnapshots: (assetIds: string[]) => Promise<MarketSnapshot[]>;
  fetchCandles: (assetId: string, timeframe: Timeframe) => Promise<AssetTimeSeries>;
  createStream: (assetIds: string[], handlers: MarketStreamHandlers) => MarketStream;
};

export const activeMarketDataProvider: MarketDataProvider =
  runtimeConfig.providerMode === 'mock' ? mockMarketDataSource : coinbaseMarketDataSource;

