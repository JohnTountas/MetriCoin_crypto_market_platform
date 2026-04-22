// These schemas define the ops server's persisted state and request contracts.
// They act as the backend guardrail against malformed client writes and stale runtime data.
import { z } from 'zod';

const isoTimestampSchema = z
  .string()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Expected a valid ISO timestamp.');

export const priceAlertSchema = z.object({
  id: z.string().min(1),
  assetId: z.string().min(1),
  direction: z.enum(['above', 'below']),
  targetPrice: z.number().positive(),
  label: z.string().max(80).optional(),
  triggered: z.boolean(),
  createdAt: isoTimestampSchema,
  triggeredAt: isoTimestampSchema.optional(),
});

export const notificationSettingsSchema = z.object({
  enableInApp: z.boolean(),
  alertPollingEnabled: z.boolean(),
  webhookUrl: z.string().trim().url().optional().or(z.literal('')),
});

export const telemetryEventSchema = z.object({
  type: z.enum(['analytics', 'error']),
  name: z.string().min(1).max(120),
  route: z.string().max(240).optional(),
  message: z.string().max(500).optional(),
  metadata: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export const alertsSyncPayloadSchema = z.object({
  alerts: z.array(priceAlertSchema),
});

export const notificationSettingsPayloadSchema = z.object({
  settings: notificationSettingsSchema,
});

const alertStatusSchema = z.object({
  deliveredAt: isoTimestampSchema.optional(),
  lastClientTriggered: z.boolean().default(false),
});

export const serverNotificationSchema = z.object({
  id: z.string().min(1),
  kind: z.literal('price-alert'),
  title: z.string().min(1),
  description: z.string().min(1),
  createdAt: isoTimestampSchema,
  assetId: z.string().min(1),
  alertId: z.string().min(1),
  direction: z.enum(['above', 'below']),
  targetPrice: z.number().positive(),
  currentPrice: z.number().positive(),
  channels: z.array(z.enum(['in-app', 'webhook'])),
  webhookStatus: z.enum(['sent', 'failed', 'skipped']),
});

export const serverStateSchema = z.object({
  notificationSettings: notificationSettingsSchema,
  syncedAlerts: z.array(priceAlertSchema),
  alertStatuses: z.record(alertStatusSchema),
  notifications: z.array(serverNotificationSchema),
  telemetry: z.array(
    telemetryEventSchema.extend({
      id: z.string().min(1),
      createdAt: isoTimestampSchema,
    }),
  ),
});

export const defaultServerState = {
  notificationSettings: {
    enableInApp: true,
    alertPollingEnabled: true,
    webhookUrl: '',
  },
  syncedAlerts: [],
  alertStatuses: {},
  notifications: [],
  telemetry: [],
};
