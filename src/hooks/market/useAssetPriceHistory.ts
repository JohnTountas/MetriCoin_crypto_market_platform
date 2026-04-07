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

