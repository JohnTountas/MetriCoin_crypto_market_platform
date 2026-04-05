import { useEffect } from 'react';

import { useAppStore } from '@/app';
import { useMarketStore } from '@/entities/market';
import { usePortfolioStore } from '@/entities/portfolio';
import { getFallbackAssetMeta } from '@/shared/constants';
import { formatPrice } from '@/shared/utils';

export const usePriceAlertMonitor = () => {
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
        const assetSymbol = getFallbackAssetMeta(alert.assetId).symbol;
        markAlertTriggered(alert.id);
        useAppStore.getState().pushToast({
          title: `${assetSymbol} trigger hit`,
          description: `${alert.label ?? 'Price level reached'} at ${formatPrice(currentPrice)}.`,
          tone: 'success',
        });
      }
    });
  }, [alerts, markAlertTriggered, snapshots]);
};


