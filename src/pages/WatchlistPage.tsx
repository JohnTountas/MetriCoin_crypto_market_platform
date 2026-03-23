import { Helmet } from 'react-helmet-async';

import { AlertsPanel } from '@/features/watchlist/ui/AlertsPanel';
import { WatchlistGrid } from '@/features/watchlist/ui/WatchlistGrid';

const WatchlistPage = () => (
  <div className="space-y-6">
    <Helmet>
      <title>Watchlist | Metricoin</title>
    </Helmet>

    <WatchlistGrid />
    <AlertsPanel />
  </div>
);

export default WatchlistPage;
