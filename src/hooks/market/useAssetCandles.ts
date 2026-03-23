import { useQuery } from '@tanstack/react-query';

import { marketProvider } from '@/api/market/provider';
import type { Timeframe } from '@/shared/types/market';

export const useAssetCandles = (assetId: string, timeframe: Timeframe) =>
  useQuery({
    queryKey: ['asset-candles', assetId, timeframe],
    queryFn: () => marketProvider.fetchCandles(assetId, timeframe),
    staleTime: 30_000,
  });
