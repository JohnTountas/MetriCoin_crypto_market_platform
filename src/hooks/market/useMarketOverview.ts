import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { marketProvider } from '@/API';
import { useMarketStore } from '@/entities';
import { TRACKED_ASSETS } from '@/shared/constants';

export const useMarketOverview = () => {
  const bootstrapSnapshots = useMarketStore((state) => state.bootstrapSnapshots);
  const snapshots = useMarketStore((state) => state.snapshots);

  const query = useQuery({
    queryKey: ['market-overview'],
    queryFn: () => marketProvider.fetchSnapshots(TRACKED_ASSETS.map((asset) => asset.id)),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data) {
      bootstrapSnapshots(query.data);
    }
  }, [bootstrapSnapshots, query.data]);

  return {
    ...query,
    snapshots,
  };
};
