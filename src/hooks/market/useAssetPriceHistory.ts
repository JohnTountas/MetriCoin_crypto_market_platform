// Thin query hook for historical candle data so chart consumers share one cache shape.
// Keeping this wrapper small makes provider changes easier to roll through the charting layer.
import { useQuery } from '@tanstack/react-query';

import { activeMarketDataProvider } from '@/api/market';
import type { Timeframe } from '@/shared/types';

export const useAssetPriceHistory = (
  assetId: string,
  timeframe: Timeframe,
  enabled = true,
) =>
  useQuery({
    queryKey: ['asset-candles', assetId, timeframe],
    queryFn: () => activeMarketDataProvider.fetchCandles(assetId, timeframe),
    enabled: enabled && Boolean(assetId),
    staleTime: 30_000,
  });

