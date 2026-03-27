import { Helmet } from 'react-helmet-async';

import { useMarketStore } from '@/entities/market';
import { PortfolioPositionsGrid, PortfolioTransactionHistory } from '@/entities/portfolio';
import { AssetAnalyticsPanel } from '@/features/asset-details';
import { DashboardHero, PortfolioSummaryGrid } from '@/features/dashboard';
import { AlertsPanel, WatchlistGrid } from '@/features/watchlist';
import { usePortfolioOverview } from '@/hooks/portfolio';

const DashboardPage = () => {
  const selectedAssetId = useMarketStore((state) => state.selectedAssetId);
  const snapshot = useMarketStore((state) => state.snapshots[selectedAssetId]);
  const { summary, positions, bestPerformer, worstPerformer } = usePortfolioOverview();

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dashboard | Metricoin</title>
        <meta
          content="Live Metricoin dashboard with real-time Bitcoin pricing, professional crypto market analytics, and portfolio intelligence."
          name="description"
        />
      </Helmet>

      <DashboardHero
        assetId={selectedAssetId}
        snapshot={snapshot}
        summary={summary}
      />

      <PortfolioSummaryGrid
        bestPerformer={bestPerformer}
        summary={summary}
        worstPerformer={worstPerformer}
      />

      <AssetAnalyticsPanel assetId={selectedAssetId} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <PortfolioPositionsGrid positions={positions} />
        <AlertsPanel assetId={selectedAssetId} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <PortfolioTransactionHistory compact limit={5} />
        <WatchlistGrid />
      </div>
    </div>
  );
};

export default DashboardPage;

