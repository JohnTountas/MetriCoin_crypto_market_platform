import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { useMarketStore } from '@/entities/market';
import { PortfolioPositionsGrid, PortfolioTransactionForm, PortfolioTransactionHistory } from '@/entities/portfolio';
import { AssetAnalyticsPanel } from '@/features/asset-details';
import { AlertsPanel } from '@/features/watchlist';
import { usePortfolioOverview } from '@/hooks/portfolio';
import { DEFAULT_ASSET_ID, getFallbackAssetMeta } from '@/shared';

const AssetDetailsPage = () => {
  const { assetId = DEFAULT_ASSET_ID } = useParams();
  const assetLookup = useMarketStore((state) => state.assetLookup);
  const assetsLoaded = useMarketStore((state) => state.assetsLoaded);
  const normalizedAssetId =
    !assetsLoaded || assetLookup[assetId] ? assetId : DEFAULT_ASSET_ID;
  const setSelectedAssetId = useMarketStore((state) => state.setSelectedAssetId);
  const { positions } = usePortfolioOverview();
  const asset = assetLookup[normalizedAssetId] ?? getFallbackAssetMeta(normalizedAssetId);

  useEffect(() => {
    setSelectedAssetId(normalizedAssetId);
  }, [normalizedAssetId, setSelectedAssetId]);

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{asset.name} | Metricoin</title>
      </Helmet>

      <AssetAnalyticsPanel assetId={normalizedAssetId} />

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

