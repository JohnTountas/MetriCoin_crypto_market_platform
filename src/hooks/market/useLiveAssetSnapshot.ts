import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { activeMarketDataProvider } from '@/api/market';
import { useMarketStore } from '@/entities/market';

export const useLiveAssetSnapshot = (assetId: string) => {
  const bootstrapSnapshots = useMarketStore((state) => state.bootstrapSnapshots);

  const liveAssetSnapshotQuery = useQuery({
    queryKey: ['asset-snapshot', assetId],
    queryFn: async () => {
      const [snapshot] = await activeMarketDataProvider.fetchSnapshots([assetId]);
      return snapshot;
    },
    enabled: Boolean(assetId),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (liveAssetSnapshotQuery.data) {
      bootstrapSnapshots([liveAssetSnapshotQuery.data]);
    }
  }, [bootstrapSnapshots, liveAssetSnapshotQuery.data]);

  return liveAssetSnapshotQuery;
};

