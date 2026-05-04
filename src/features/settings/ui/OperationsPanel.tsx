// OperationsPanel is the browser-side window into ops server health, telemetry, and alert delivery.
// When server-backed features feel inconsistent, this panel should make the failure mode visible.
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Activity, BellRing, Bug, Save, ServerCog, Siren } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  fetchNotificationSettings,
  fetchOperationsHealth,
  fetchServerNotifications,
  fetchTelemetrySummary,
  notificationSettingsSchema,
  saveNotificationSettings,
} from '@/api';
import { useAppStore } from '@/app';
import { trackAnalyticsEvent } from '@/hooks/app';
import {
  Badge,
  Button,
  Card,
  formatTimestamp,
  Input,
  SectionHeading,
  Skeleton,
} from '@/shared';
import type { NotificationSettings } from '@/shared/types';

const statusToneMap = {
  connected: 'positive',
  disconnected: 'negative',
} as const;

/**
 * OperationsPanel collects server health, delivery telemetry, and notification settings in one place.
 * It helps developers and users verify that the browser and the local ops layer still agree.
 */
export const OperationsPanel = () => {
  const pushToast = useAppStore((state) => state.pushToast);
  const healthQuery = useQuery({
    queryKey: ['operations-health'],
    queryFn: fetchOperationsHealth,
    refetchInterval: 30_000,
    retry: 1,
  });
  const telemetryQuery = useQuery({
    queryKey: ['telemetry-summary'],
    queryFn: fetchTelemetrySummary,
    refetchInterval: 30_000,
    retry: 1,
  });
  const notificationsQuery = useQuery({
    queryKey: ['server-notifications'],
    queryFn: fetchServerNotifications,
    refetchInterval: 15_000,
    retry: 1,
  });
  const settingsQuery = useQuery({
    queryKey: ['notification-settings'],
    queryFn: fetchNotificationSettings,
    retry: 1,
  });

  const form = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      enableInApp: true,
      alertPollingEnabled: true,
      webhookUrl: '',
    },
  });

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    form.reset({
      enableInApp: settingsQuery.data.enableInApp,
      alertPollingEnabled: settingsQuery.data.alertPollingEnabled,
      webhookUrl: settingsQuery.data.webhookUrl ?? '',
    });
  }, [form, settingsQuery.data]);

  const isServerConnected = healthQuery.isSuccess;
  const notificationSettings = form.watch();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="surface p-4 sm:p-5">
        <SectionHeading
          eyebrow="Operations"
          title="Server monitoring and alert delivery"
          description="A lightweight local ops layer tracks server-side alert delivery, webhook attempts, analytics, and client-side errors."
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <div className="surface-subtle rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                Server
              </p>
              <Badge
                tone={
                  statusToneMap[
                    isServerConnected ? 'connected' : 'disconnected'
                  ]
                }
              >
                {isServerConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
              {healthQuery.data?.activeAlertCount ?? '--'}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Live alerts owned by the server poller
            </p>
          </div>

          <div className="surface-subtle rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <BellRing className="h-4.5 w-4.5 text-[var(--accent-text)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                Notifications
              </p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
              {telemetryQuery.data?.notificationCount ?? '--'}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Persisted alert deliveries and monitor events
            </p>
          </div>

          <div className="surface-subtle rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-[var(--accent-text)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                Analytics
              </p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
              {telemetryQuery.data?.totalAnalyticsEvents ?? '--'}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Tracked product events in the last retained window
            </p>
          </div>

          <div className="surface-subtle rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Bug className="h-4.5 w-4.5 text-[var(--negative-text)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                Errors
              </p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
              {telemetryQuery.data?.totalErrorEvents ?? '--'}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Unhandled browser and async failures captured
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,360px)]">
          <div className="space-y-4">
            <div className="surface-subtle rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Siren className="h-4.5 w-4.5 text-[var(--highlight-text)]" />
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Recent server notifications
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {notificationsQuery.isLoading ? (
                  <Skeleton className="h-28 rounded-2xl" />
                ) : null}
                {!notificationsQuery.isLoading &&
                (notificationsQuery.data ?? []).length === 0 ? (
                  <p className="text-sm leading-6 text-[var(--text-muted)]">
                    No server notifications yet. Sync the app with the ops
                    server and let an alert cross a live price threshold.
                  </p>
                ) : null}
                {(notificationsQuery.data ?? [])
                  .slice(0, 6)
                  .map((notification) => (
                    <div
                      className="surface-muted rounded-2xl px-4 py-3"
                      key={notification.id}
                    >
                      <div className="flex flex-col gap-2 xs:flex-row xs:items-center xs:justify-between">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {notification.title}
                        </p>
                        <Badge
                          tone={
                            notification.webhookStatus === 'failed'
                              ? 'warning'
                              : 'positive'
                          }
                        >
                          {notification.webhookStatus}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                        {notification.description}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--text-faint)]">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            <div className="surface-subtle rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Bug className="h-4.5 w-4.5 text-[var(--negative-text)]" />
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Recent captured errors
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {telemetryQuery.isLoading ? (
                  <Skeleton className="h-24 rounded-2xl" />
                ) : null}
                {!telemetryQuery.isLoading &&
                (telemetryQuery.data?.recentErrors.length ?? 0) === 0 ? (
                  <p className="text-sm leading-6 text-[var(--text-muted)]">
                    No recent client-side errors captured by the telemetry
                    pipeline.
                  </p>
                ) : null}
                {(telemetryQuery.data?.recentErrors ?? []).map((event) => (
                  <div
                    className="surface-muted rounded-2xl px-4 py-3"
                    key={event.id}
                  >
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {event.name}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                      {event.message ?? 'No message recorded.'}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--text-faint)]">
                      {event.route ?? 'unknown route'} |{' '}
                      {formatTimestamp(event.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Card className="surface p-4 sm:p-5">
            <SectionHeading
              eyebrow="Delivery"
              title="Notification channels"
              description="Configure whether the ops server keeps an inbox feed, polls alerts, and forwards deliveries to a webhook."
            />

            <form
              className="mt-6 space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                const trimmedWebhookUrl = values.webhookUrl?.trim();
                const normalizedValues = {
                  ...values,
                  webhookUrl:
                    trimmedWebhookUrl === '' ? undefined : trimmedWebhookUrl,
                };

                try {
                  await saveNotificationSettings(normalizedValues);
                  pushToast({
                    tone: 'success',
                    title: 'Notification settings saved',
                    description:
                      'The ops server will use the updated delivery configuration on the next poll cycle.',
                  });
                  trackAnalyticsEvent('notification_settings.saved', {
                    enableInApp: normalizedValues.enableInApp,
                    alertPollingEnabled: normalizedValues.alertPollingEnabled,
                    hasWebhook: Boolean(normalizedValues.webhookUrl),
                  });
                } catch {
                  pushToast({
                    tone: 'error',
                    title: 'Save failed',
                    description:
                      'Metricoin could not update the ops server notification settings.',
                  });
                }
              })}
            >
              <label className="flex items-start gap-3 rounded-2xl border border-[var(--border)] px-4 py-3">
                <input
                  className="mt-1"
                  type="checkbox"
                  {...form.register('enableInApp')}
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Store in-app notification feed
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                    Keep a server-owned delivery inbox that the UI can poll and
                    render.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-[var(--border)] px-4 py-3">
                <input
                  className="mt-1"
                  type="checkbox"
                  {...form.register('alertPollingEnabled')}
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Enable server-side alert polling
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                    Keep monitoring synced alerts even when the browser is no
                    longer on the watchlist page.
                  </p>
                </div>
              </label>

              <label className="space-y-2 text-sm text-[var(--text-secondary)]">
                Webhook URL
                <Input
                  placeholder="https://example.com/metricoin-alerts"
                  {...form.register('webhookUrl')}
                />
                <p className="text-xs leading-6 text-[var(--text-faint)]">
                  Optional. When set, the ops server will POST alert deliveries
                  to this endpoint.
                </p>
                {form.formState.errors.webhookUrl?.message ? (
                  <p className="text-xs text-[var(--negative-text)]">
                    {form.formState.errors.webhookUrl.message}
                  </p>
                ) : null}
              </label>

              <Button className="w-full xs:w-auto" type="submit">
                <Save className="h-4 w-4" />
                Save delivery settings
              </Button>
            </form>

            <div className="surface-subtle mt-6 rounded-2xl p-4 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <ServerCog className="h-4.5 w-4.5 text-[var(--accent-text)]" />
                <p className="font-semibold text-[var(--text-primary)]">
                  Current server snapshot
                </p>
              </div>
              <p className="mt-3">
                Polling enabled:{' '}
                {notificationSettings.alertPollingEnabled ? 'yes' : 'no'}
              </p>
              <p className="mt-1">
                In-app feed:{' '}
                {notificationSettings.enableInApp ? 'enabled' : 'disabled'}
              </p>
              <p className="mt-1">
                Webhook configured:{' '}
                {notificationSettings.webhookUrl ? 'yes' : 'no'}
              </p>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};
