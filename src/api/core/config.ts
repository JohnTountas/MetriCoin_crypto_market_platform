import type { MarketProviderMode } from '@/shared/types/market';

const readEnv = (key: keyof ImportMetaEnv) => {
  const value: unknown = import.meta.env[key];
  return typeof value === 'string' ? value : undefined;
};

const useMockData = readEnv('VITE_USE_MOCK_DATA') === 'true';
const marketRestUrl = readEnv('VITE_MARKET_REST_URL');
const marketWsUrl = readEnv('VITE_MARKET_WS_URL');

export const appConfig = {
  appName: 'Metricoin',
  providerMode: (useMockData ? 'mock' : 'coinbase') as MarketProviderMode,
  marketRestUrl: typeof marketRestUrl === 'string' ? marketRestUrl : 'https://api.exchange.coinbase.com',
  marketWsUrl: typeof marketWsUrl === 'string' ? marketWsUrl : 'wss://ws-feed.exchange.coinbase.com',
};
