export type MarketProviderMode = 'coinbase' | 'mock';

export type StreamConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

export type PriceDirection = 'up' | 'down' | 'flat';

export type Timeframe = '1H' | '24H' | '7D' | '30D' | '1Y';

export type AssetMeta = {
  id: string;
  symbol: string;
  name: string;
  productId: string;
  description: string;
  accent: string;
  iconUrl?: string;
  circulatingSupply?: number;
  quantityPrecision: number;
};

export type MarketSnapshot = {
  assetId: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  open24h: number;
  marketCap?: number;
  bid?: number;
  ask?: number;
  spread?: number;
  lastUpdated: number;
  direction: PriceDirection;
};

export type MarketTickerMessage = {
  assetId: string;
  price: number;
  bid?: number;
  ask?: number;
  volume24h?: number;
  lastUpdated: number;
};

export type MarketCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type AssetTimeSeries = {
  assetId: string;
  timeframe: Timeframe;
  candles: MarketCandle[];
};
