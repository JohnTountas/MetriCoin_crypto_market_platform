import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { useMarketStore } from '@/entities/market/model/marketStore';
import { PositionsOverview } from '@/entities/portfolio/ui/PositionsOverview';
import { TransactionForm } from '@/entities/portfolio/ui/TransactionForm';
import { TransactionHistory } from '@/entities/portfolio/ui/TransactionHistory';
import { CoinAnalyticsPanel } from '@/features/coin-details/ui/CoinAnalyticsPanel';
import { AlertsPanel } from '@/features/watchlist/ui/AlertsPanel';
import { usePortfolioMetrics } from '@/hooks/portfolio/usePortfolioMetrics';
import { ASSET_LOOKUP, DEFAULT_ASSET_ID } from '@/shared/constants/assets';

const CoinDetailsPage = () => {
  const { assetId = DEFAULT_ASSET_ID } = useParams();
  const normalizedAssetId = ASSET_LOOKUP[assetId] ? assetId : DEFAULT_ASSET_ID;
  const setSelectedAssetId = useMarketStore((state) => state.setSelectedAssetId);
  const { positions } = usePortfolioMetrics();

  useEffect(() => {
    setSelectedAssetId(normalizedAssetId);
  }, [normalizedAssetId, setSelectedAssetId]);

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{ASSET_LOOKUP[normalizedAssetId]?.name} | MetaSignal</title>
      </Helmet>

      <CoinAnalyticsPanel assetId={normalizedAssetId} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <PositionsOverview
          positions={positions.filter((position) => position.assetId === normalizedAssetId)}
        />
        <TransactionForm assetId={normalizedAssetId} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <TransactionHistory assetId={normalizedAssetId} />
        <AlertsPanel assetId={normalizedAssetId} />
      </div>
    </div>
  );
};

export default CoinDetailsPage;
