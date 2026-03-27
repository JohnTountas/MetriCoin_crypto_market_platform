import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { activeMarketDataProvider } from '@/api/market';
import { useMarketStore } from '@/entities/market';

export const useTrackedAssets = () => {
  const setAssets = useMarketStore((state) => state.setAssets);

  const trackedAssetsQuery = useQuery({
    queryKey: ['market-assets'],
    queryFn: () => activeMarketDataProvider.fetchAssets(),
    staleTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    if (trackedAssetsQuery.data?.length) {
      setAssets(trackedAssetsQuery.data);
    }
  }, [trackedAssetsQuery.data, setAssets]);

  return trackedAssetsQuery;
};

