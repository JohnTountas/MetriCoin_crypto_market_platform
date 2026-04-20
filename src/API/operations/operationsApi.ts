import { requestJson, runtimeConfig } from '@/api/core';
import type { NotificationSettings, PriceAlert, TelemetryEvent } from '@/shared/types';

import {
  notificationSettingsResponseSchema,
  notificationSettingsSchema,
  notificationsResponseSchema,
  operationsHealthSchema,
  telemetrySummarySchema,
} from './operationsSchemas';

const buildApiUrl = (path: string) => `${runtimeConfig.appApiBaseUrl}${path}`;

const postJson = async <T>(path: string, body: unknown) =>
  requestJson<T>({
    url: buildApiUrl(path),
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  });

export const fetchOperationsHealth = async () =>
  requestJson({
    url: buildApiUrl('/health'),
    schema: operationsHealthSchema,
  });

export const fetchNotificationSettings = async () =>
  requestJson({
    url: buildApiUrl('/notification-settings'),
    schema: notificationSettingsResponseSchema,
  }).then((response) => response.settings);

export const saveNotificationSettings = async (settings: NotificationSettings) =>
  postJson<{ settings: NotificationSettings }>('/notification-settings', { settings });

export const fetchServerNotifications = async () =>
  requestJson({
    url: buildApiUrl('/notifications'),
    schema: notificationsResponseSchema,
  }).then((response) => response.notifications);

export const fetchTelemetrySummary = async () =>
  requestJson({
    url: buildApiUrl('/telemetry/summary'),
    schema: telemetrySummarySchema,
  });

export const syncServerAlerts = async (alerts: PriceAlert[]) => {
  await postJson('/alerts/sync', { alerts });
};

type TelemetryEventInput = Omit<TelemetryEvent, 'id' | 'createdAt'>;

export const sendTelemetryEvent = async (event: TelemetryEventInput) => {
  const payload = JSON.stringify(event);
  const targetUrl = buildApiUrl('/telemetry/events');

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(targetUrl, blob);
      return;
    }

    await postJson('/telemetry/events', event);
  } catch {
    // Telemetry should never break the product flow. We intentionally swallow
    // transport failures so observability remains additive rather than risky.
  }
};

export { notificationSettingsSchema };
