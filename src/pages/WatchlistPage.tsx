import { Helmet } from 'react-helmet-async';

import { AlertsPanel, WatchlistGrid } from '@/features';

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
