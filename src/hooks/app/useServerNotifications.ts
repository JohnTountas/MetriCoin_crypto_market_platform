import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { fetchServerNotifications } from '@/api';
import { useAppStore } from '@/app';
import { usePortfolioStore } from '@/entities/portfolio';

export const useServerNotifications = () => {
  const markAlertTriggered = usePortfolioStore((state) => state.markAlertTriggered);
  const alerts = usePortfolioStore((state) => state.alerts);
  const hasHydratedFeedRef = useRef(false);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());

  const notificationsQuery = useQuery({
    queryKey: ['server-notifications'],
    queryFn: fetchServerNotifications,
    refetchInterval: 15_000,
    retry: 1,
  });

  useEffect(() => {
    const notifications = notificationsQuery.data ?? [];

    if (!hasHydratedFeedRef.current) {
      // The first fetch seeds our local cache so we only toast for genuinely
      // new server-side deliveries instead of replaying the whole inbox.
      notifications.forEach((notification) => seenNotificationIdsRef.current.add(notification.id));
      hasHydratedFeedRef.current = true;
      return;
    }

    notifications.forEach((notification) => {
      if (seenNotificationIdsRef.current.has(notification.id)) {
        return;
      }

      seenNotificationIdsRef.current.add(notification.id);

      const matchingAlert = alerts.find((alert) => alert.id === notification.alertId);
      if (matchingAlert && !matchingAlert.triggered) {
        // Server delivery should reconcile the local alert state too, otherwise
        // the UI would still look "live" even after the backend already fired.
        markAlertTriggered(notification.alertId);
      }

      useAppStore.getState().pushToast({
        tone: notification.webhookStatus === 'failed' ? 'warning' : 'success',
        title: notification.title,
        description: notification.description,
      });
    });
  }, [alerts, markAlertTriggered, notificationsQuery.data]);

  return notificationsQuery;
};
