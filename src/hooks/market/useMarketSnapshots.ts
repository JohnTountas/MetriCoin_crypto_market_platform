import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { activeMarketDataProvider } from '@/api/market';
import { useMarketStore } from '@/entities/market';

export const useMarketSnapshots = () => {
  const assets = useMarketStore((state) => state.assets);
  const assetsLoaded = useMarketStore((state) => state.assetsLoaded);
  const bootstrapSnapshots = useMarketStore((state) => state.bootstrapSnapshots);
  const trackedAssetIds = assets.map((asset) => asset.id);

  const marketSnapshotsQuery = useQuery({
    queryKey: ['market-overview', trackedAssetIds],
    queryFn: () => activeMarketDataProvider.fetchSnapshots(trackedAssetIds),
    enabled: assetsLoaded && trackedAssetIds.length > 0,
    refetchInterval: 5 * 60_000,
    staleTime: 2 * 60_000,
  });

  useEffect(() => {
    if (marketSnapshotsQuery.data) {
      bootstrapSnapshots(marketSnapshotsQuery.data);
    }
  }, [bootstrapSnapshots, marketSnapshotsQuery.data]);

  return marketSnapshotsQuery;
};

