import { useQueries } from '@tanstack/react-query';

import { activeMarketDataProvider } from '@/api/market';
import {
  calculatePortfolioPerformancePoints,
  usePortfolioStore,
} from '@/entities/portfolio/model';
import { TIMEFRAME_OPTIONS } from '@/shared/constants';
import type { MarketCandle, Timeframe } from '@/shared/types';

export const usePortfolioPerformanceHistory = (timeframe: Timeframe) => {
  const transactions = usePortfolioStore((state) => state.transactions);
  const assetIds = Array.from(new Set(transactions.map((transaction) => transaction.assetId)));
  const timeframeSupported = TIMEFRAME_OPTIONS.some((option) => option.label === timeframe);

  const candleQueries = useQueries({
    queries: assetIds.map((assetId) => ({
      queryKey: ['portfolio-performance', assetId, timeframe],
      queryFn: () => activeMarketDataProvider.fetchCandles(assetId, timeframe),
      enabled: timeframeSupported,
      staleTime: 30_000,
      retry: 1,
    })),
  });

  const candlesByAssetId = assetIds.reduce<Record<string, MarketCandle[]>>(
    (accumulator, assetId, index) => {
      // Failed candle lookups fall back to trade prices inside the calculator,
      // which keeps the curve usable even for assets without full coverage.
      accumulator[assetId] = candleQueries[index].data?.candles ?? [];
      return accumulator;
    },
    {},
  );

  const points = calculatePortfolioPerformancePoints({
    transactions,
    candlesByAssetId,
  });

  return {
    points,
    assetCount: assetIds.length,
    isLoading: candleQueries.some((query) => query.isLoading),
    hasErrors: candleQueries.some((query) => query.isError),
  };
};
