import { useEffect } from 'react';

import { syncServerAlerts } from '@/api';
import { usePortfolioStore } from '@/entities/portfolio/model';

export const useServerAlertSync = () => {
  const alerts = usePortfolioStore((state) => state.alerts);

  useEffect(() => {
    // We debounce alert sync slightly so typing in the watchlist form does not
    // spam the ops server with every intermediate field edit.
    const syncHandle = window.setTimeout(() => {
      void syncServerAlerts(alerts).catch(() => {
        // The UI should keep working even when the ops server is offline.
      });
    }, 500);

    return () => window.clearTimeout(syncHandle);
  }, [alerts]);
};
