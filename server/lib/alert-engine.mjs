import crypto from 'node:crypto';

import { fetchSpotPrice } from './coinbase.mjs';

const MAX_NOTIFICATIONS = 100;
const MAX_TELEMETRY_EVENTS = 500;

const trimHistory = (items, limit) => items.slice(0, limit);

const buildNotification = ({
  alert,
  currentPrice,
  channels,
  webhookStatus,
}) => ({
  id: crypto.randomUUID(),
  kind: 'price-alert',
  title: `${alert.assetId} crossed ${alert.direction} ${alert.targetPrice.toFixed(2)}`,
  description: `${alert.label ?? 'Server-side alert delivery'} fired at ${currentPrice.toFixed(2)}.`,
  createdAt: new Date().toISOString(),
  assetId: alert.assetId,
  alertId: alert.id,
  direction: alert.direction,
  targetPrice: alert.targetPrice,
  currentPrice,
  channels,
  webhookStatus,
});

const postWebhookNotification = async (webhookUrl, notification) => {
  if (!webhookUrl) {
    return 'skipped';
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    return response.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
};

export const recordTelemetryEvent = (state, event) => ({
  ...state,
  telemetry: trimHistory(
    [
      {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...event,
      },
      ...state.telemetry,
    ],
    MAX_TELEMETRY_EVENTS,
  ),
});

export const buildTelemetrySummary = (state) => {
  const last24HoursThreshold = Date.now() - 24 * 60 * 60 * 1000;
  const analyticsEvents = state.telemetry.filter((event) => event.type === 'analytics');
  const errorEvents = state.telemetry.filter((event) => event.type === 'error');

  return {
    totalAnalyticsEvents: analyticsEvents.length,
    totalErrorEvents: errorEvents.length,
    eventsLast24Hours: state.telemetry.filter(
      (event) => new Date(event.createdAt).getTime() >= last24HoursThreshold,
    ).length,
    activeAlertCount: state.syncedAlerts.filter((alert) => !alert.triggered).length,
    notificationCount: state.notifications.length,
    lastNotificationAt: state.notifications[0]?.createdAt,
    recentErrors: errorEvents.slice(0, 8),
    recentAnalytics: analyticsEvents.slice(0, 8),
  };
};

export const evaluateAlertDeliveries = async (state) => {
  if (!state.notificationSettings.alertPollingEnabled) {
    return state;
  }

  const nextNotifications = [...state.notifications];
  const nextAlertStatuses = { ...state.alertStatuses };

  for (const alert of state.syncedAlerts) {
    const existingStatus = nextAlertStatuses[alert.id] ?? {
      lastClientTriggered: false,
    };

    // When the client explicitly re-arms an alert, the server should forget
    // its delivered marker and allow a fresh delivery cycle.
    if (existingStatus.lastClientTriggered && !alert.triggered) {
      delete existingStatus.deliveredAt;
    }

    existingStatus.lastClientTriggered = alert.triggered;
    nextAlertStatuses[alert.id] = existingStatus;

    if (alert.triggered || existingStatus.deliveredAt) {
      continue;
    }

    try {
      const currentPrice = await fetchSpotPrice(alert.assetId);
      const crossedThreshold =
        alert.direction === 'above'
          ? currentPrice >= alert.targetPrice
          : currentPrice <= alert.targetPrice;

      if (!crossedThreshold) {
        continue;
      }

      const channels = [];

      if (state.notificationSettings.enableInApp) {
        channels.push('in-app');
      }

      if (state.notificationSettings.webhookUrl) {
        channels.push('webhook');
      }

      const notification = buildNotification({
        alert,
        currentPrice,
        channels,
        webhookStatus: 'skipped',
      });
      const webhookStatus = await postWebhookNotification(
        state.notificationSettings.webhookUrl,
        notification,
      );

      nextNotifications.unshift({
        ...notification,
        webhookStatus,
      });
      existingStatus.deliveredAt = notification.createdAt;
    } catch (error) {
      nextNotifications.unshift({
        id: crypto.randomUUID(),
        kind: 'price-alert',
        title: `Server alert monitor failed for ${alert.assetId}`,
        description:
          error instanceof Error ? error.message : 'Unknown alert delivery failure.',
        createdAt: new Date().toISOString(),
        assetId: alert.assetId,
        alertId: alert.id,
        direction: alert.direction,
        targetPrice: alert.targetPrice,
        currentPrice: alert.targetPrice,
        channels: ['in-app'],
        webhookStatus: 'failed',
      });
    }
  }

  return {
    ...state,
    alertStatuses: nextAlertStatuses,
    notifications: trimHistory(nextNotifications, MAX_NOTIFICATIONS),
  };
};
