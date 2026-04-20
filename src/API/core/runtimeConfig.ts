import type { MarketProviderMode } from '@/shared/types';

const readEnvironmentVariable = (key: keyof ImportMetaEnv) => {
  const value: unknown = import.meta.env[key];
  return typeof value === 'string' ? value : undefined;
};

const shouldUseMockData =
  readEnvironmentVariable('VITE_USE_MOCK_DATA') === 'true';
const marketApiBaseUrl = readEnvironmentVariable('VITE_MARKET_REST_URL');
const marketWebSocketUrl = readEnvironmentVariable('VITE_MARKET_WS_URL');
const appApiBaseUrl = readEnvironmentVariable('VITE_APP_API_BASE_URL');

export const runtimeConfig = {
  appName: 'Metricoin',
  providerMode: (shouldUseMockData ? 'mock' : 'coinbase') as MarketProviderMode,
  appApiBaseUrl: typeof appApiBaseUrl === 'string' ? appApiBaseUrl : '/api',
  marketApiBaseUrl:
    typeof marketApiBaseUrl === 'string'
      ? marketApiBaseUrl
      : 'https://api.exchange.coinbase.com',
  marketWebSocketUrl:
    typeof marketWebSocketUrl === 'string'
      ? marketWebSocketUrl
      : 'wss://ws-feed.exchange.coinbase.com',
};
