import { useEffect } from 'react';

import { useAppStore } from '@/app/appStore';
import { useMarketStore } from '@/entities/market/model/marketStore';
import { usePortfolioStore } from '@/entities/portfolio/model/portfolioStore';
import { formatPrice } from '@/shared/lib/formatters';

export const useAlertMonitor = () => {
  const alerts = usePortfolioStore((state) => state.alerts);
  const markAlertTriggered = usePortfolioStore((state) => state.markAlertTriggered);
  const snapshots = useMarketStore((state) => state.snapshots);

  useEffect(() => {
    alerts.forEach((alert) => {
      if (alert.triggered) return;

      const currentPrice = snapshots[alert.assetId]?.price;
      if (!currentPrice) return;

      const crossedAbove = alert.direction === 'above' && currentPrice >= alert.targetPrice;
      const crossedBelow = alert.direction === 'below' && currentPrice <= alert.targetPrice;

      if (crossedAbove || crossedBelow) {
        markAlertTriggered(alert.id);
        useAppStore.getState().pushToast({
          title: `${alert.assetId.replace('-USD', '')} alert triggered`,
          description: `${alert.label ?? 'Price level hit'} at ${formatPrice(currentPrice)}.`,
          tone: 'success',
        });
      }
    });
  }, [alerts, markAlertTriggered, snapshots]);
};
