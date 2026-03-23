/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_USE_MOCK_DATA?: 'true' | 'false';
  readonly VITE_MARKET_REST_URL?: string;
  readonly VITE_MARKET_WS_URL?: string;
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};
