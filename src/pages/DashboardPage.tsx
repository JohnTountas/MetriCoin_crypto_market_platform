import { Helmet } from 'react-helmet-async';

import { useMarketStore } from '@/entities/market/model/marketStore';
import { PositionsOverview } from '@/entities/portfolio/ui/PositionsOverview';
import { TransactionHistory } from '@/entities/portfolio/ui/TransactionHistory';
import { CoinAnalyticsPanel } from '@/features/coin-details/ui/CoinAnalyticsPanel';
import { DashboardHero } from '@/features/dashboard/ui/DashboardHero';
import { PortfolioSummaryGrid } from '@/features/dashboard/ui/PortfolioSummaryGrid';
import { AlertsPanel } from '@/features/watchlist/ui/AlertsPanel';
import { WatchlistGrid } from '@/features/watchlist/ui/WatchlistGrid';
import { usePortfolioMetrics } from '@/hooks/portfolio/usePortfolioMetrics';

const DashboardPage = () => {
  const selectedAssetId = useMarketStore((state) => state.selectedAssetId);
  const snapshot = useMarketStore((state) => state.snapshots[selectedAssetId]);
  const { summary, positions, bestPerformer, worstPerformer } = usePortfolioMetrics();

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dashboard | MetaSignal</title>
        <meta
          content="Live MetaSignal dashboard with real-time Bitcoin pricing, professional crypto market analytics, and portfolio intelligence."
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

      <CoinAnalyticsPanel assetId={selectedAssetId} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <PositionsOverview positions={positions} />
        <AlertsPanel assetId={selectedAssetId} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <TransactionHistory compact limit={5} />
        <WatchlistGrid />
      </div>
    </div>
  );
};

export default DashboardPage;
