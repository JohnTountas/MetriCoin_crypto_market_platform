import { appConfig } from '@/api/core/config';
import type {
  AssetTimeSeries,
  MarketSnapshot,
  MarketTickerMessage,
  StreamConnectionStatus,
  Timeframe,
} from '@/shared/types/market';

import { coinbaseMarketProvider } from './marketRest';
import { mockMarketProvider } from './mockProvider';

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
  fetchSnapshots: (assetIds: string[]) => Promise<MarketSnapshot[]>;
  fetchCandles: (assetId: string, timeframe: Timeframe) => Promise<AssetTimeSeries>;
  createStream: (assetIds: string[], handlers: MarketStreamHandlers) => MarketStream;
};

export const marketProvider: MarketDataProvider =
  appConfig.providerMode === 'mock' ? mockMarketProvider : coinbaseMarketProvider;

