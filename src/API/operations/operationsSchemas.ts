// Browser-to-ops-server contracts live here. When settings or monitoring views drift,
// these schemas are the quickest place to confirm both sides still agree on the payload shape.
import { z } from 'zod';

const telemetryMetadataSchema = z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]));

export const notificationSettingsSchema = z.object({
  enableInApp: z.boolean(),
  alertPollingEnabled: z.boolean(),
  webhookUrl: z.string().optional(),
});

export const serverNotificationSchema = z.object({
  id: z.string(),
  kind: z.literal('price-alert'),
  title: z.string(),
  description: z.string(),
  createdAt: z.string(),
  assetId: z.string(),
  alertId: z.string(),
  direction: z.enum(['above', 'below']),
  targetPrice: z.number(),
  currentPrice: z.number(),
  channels: z.array(z.enum(['in-app', 'webhook'])),
  webhookStatus: z.enum(['sent', 'failed', 'skipped']),
});

export const notificationsResponseSchema = z.object({
  notifications: z.array(serverNotificationSchema),
});

export const notificationSettingsResponseSchema = z.object({
  settings: notificationSettingsSchema,
});

export const telemetryEventSchema = z.object({
  id: z.string(),
  type: z.enum(['analytics', 'error']),
  name: z.string(),
  createdAt: z.string(),
  route: z.string().optional(),
  message: z.string().optional(),
  metadata: telemetryMetadataSchema.optional(),
});

export const telemetrySummarySchema = z.object({
  totalAnalyticsEvents: z.number(),
  totalErrorEvents: z.number(),
  eventsLast24Hours: z.number(),
  activeAlertCount: z.number(),
  notificationCount: z.number(),
  lastNotificationAt: z.string().optional(),
  recentErrors: z.array(telemetryEventSchema),
  recentAnalytics: z.array(telemetryEventSchema),
});

export const operationsHealthSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string(),
  activeAlertCount: z.number(),
  notificationCount: z.number(),
  telemetryCount: z.number(),
  alertPollingEnabled: z.boolean(),
});
