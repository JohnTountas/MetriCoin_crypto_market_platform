import { useQuery } from '@tanstack/react-query';

import { marketProvider } from '@/API';
import type { Timeframe } from '@/shared/types';

export const useAssetCandles = (assetId: string, timeframe: Timeframe) =>
  useQuery({
    queryKey: ['asset-candles', assetId, timeframe],
    queryFn: () => marketProvider.fetchCandles(assetId, timeframe),
    staleTime: 30_000,
  });
