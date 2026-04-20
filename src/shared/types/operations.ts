export type NotificationChannel = 'in-app' | 'webhook';

export type NotificationWebhookStatus = 'sent' | 'failed' | 'skipped';

export type ServerNotification = {
  id: string;
  kind: 'price-alert';
  title: string;
  description: string;
  createdAt: string;
  assetId: string;
  alertId: string;
  direction: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  channels: NotificationChannel[];
  webhookStatus: NotificationWebhookStatus;
};

export type NotificationSettings = {
  enableInApp: boolean;
  alertPollingEnabled: boolean;
  webhookUrl?: string;
};

export type TelemetryEvent = {
  id: string;
  type: 'analytics' | 'error';
  name: string;
  createdAt: string;
  route?: string;
  message?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type TelemetrySummary = {
  totalAnalyticsEvents: number;
  totalErrorEvents: number;
  eventsLast24Hours: number;
  activeAlertCount: number;
  notificationCount: number;
  lastNotificationAt?: string;
  recentErrors: TelemetryEvent[];
  recentAnalytics: TelemetryEvent[];
};

export type OperationsHealth = {
  status: 'ok';
  timestamp: string;
  activeAlertCount: number;
  notificationCount: number;
  telemetryCount: number;
  alertPollingEnabled: boolean;
};
