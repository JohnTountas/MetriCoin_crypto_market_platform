// WatchlistPage brings favorites and trigger management together into one monitoring lane.
// It stays light so users can move quickly between scanning assets and configuring alerts.
import { Helmet } from 'react-helmet-async';

import { AlertsPanel, WatchlistGrid } from '@/features/watchlist';

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
