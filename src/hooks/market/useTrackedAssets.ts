// Loads the tracked asset catalog and falls back to the built-in list when the provider cannot help.
// That fallback keeps the rest of the app usable even when discovery calls fail.
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { activeMarketDataProvider } from '@/api/market';
import { useMarketStore } from '@/entities/market';
import { TRACKED_ASSETS } from '@/shared/constants';

export const useTrackedAssets = () => {
  const setAssets = useMarketStore((state) => state.setAssets);

  const trackedAssetsQuery = useQuery({
    queryKey: ['market-assets'],
    queryFn: () => activeMarketDataProvider.fetchAssets(),
    staleTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    if (trackedAssetsQuery.data) {
      setAssets(trackedAssetsQuery.data);
      return;
    }

    if (trackedAssetsQuery.error) {
      setAssets(TRACKED_ASSETS);
    }
  }, [trackedAssetsQuery.data, trackedAssetsQuery.error, setAssets]);

  return trackedAssetsQuery;
};

