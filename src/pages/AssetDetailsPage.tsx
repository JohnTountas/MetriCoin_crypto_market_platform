// AssetDetailsPage is the route-level orchestrator for a single asset's market and portfolio context.
// It resolves flexible asset ids so links from different sources still land in a useful state.
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { useMarketStore } from '@/entities/market';
import { usePortfolioStore } from '@/entities/portfolio';
import { PortfolioPositionsGrid, PortfolioTransactionForm, PortfolioTransactionHistory } from '@/entities/portfolio';
import { AssetAnalyticsPanel } from '@/features/asset-details';
import { AlertsPanel } from '@/features/watchlist';
import { usePortfolioOverview } from '@/hooks/portfolio/usePortfolioOverview';
import { DEFAULT_ASSET_ID, getFallbackAssetMeta, resolveAssetDetailsAssetId } from '@/shared';

const AssetDetailsPage = () => {
  const { assetId = DEFAULT_ASSET_ID } = useParams();
  const assetLookup = useMarketStore((state) => state.assetLookup);
  const assetsLoaded = useMarketStore((state) => state.assetsLoaded);
  const snapshots = useMarketStore((state) => state.snapshots);
  const setSelectedAssetId = useMarketStore((state) => state.setSelectedAssetId);
  const transactions = usePortfolioStore((state) => state.transactions);
  const alerts = usePortfolioStore((state) => state.alerts);
  const { positions } = usePortfolioOverview();
  const normalizedAssetId = resolveAssetDetailsAssetId({
    requestedAssetId: assetId,
    assetLookup,
    transactions,
    alerts,
    snapshots,
  });
  const hasLiveMarketData = assetsLoaded && Boolean(assetLookup[normalizedAssetId]);
  const asset = assetLookup[normalizedAssetId] ?? getFallbackAssetMeta(normalizedAssetId);

  useEffect(() => {
    setSelectedAssetId(normalizedAssetId);
  }, [normalizedAssetId, setSelectedAssetId]);

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{asset.name} | Metricoin</title>
      </Helmet>

      <AssetAnalyticsPanel assetId={normalizedAssetId} trackLiveData={hasLiveMarketData} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <PortfolioPositionsGrid
          positions={positions.filter((position) => position.assetId === normalizedAssetId)}
        />
        <PortfolioTransactionForm assetId={normalizedAssetId} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <PortfolioTransactionHistory assetId={normalizedAssetId} />
        <AlertsPanel assetId={normalizedAssetId} />
      </div>
    </div>
  );
};

export default AssetDetailsPage;

