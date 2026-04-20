import http from 'node:http';
import { URL } from 'node:url';

import {
  alertsSyncPayloadSchema,
  notificationSettingsPayloadSchema,
  telemetryEventSchema,
} from './lib/schemas.mjs';
import {
  buildTelemetrySummary,
  evaluateAlertDeliveries,
  recordTelemetryEvent,
} from './lib/alert-engine.mjs';
import { readServerState, updateServerState } from './lib/storage.mjs';

const port = Number(process.env.PORT ?? 4174);

const sendJson = (response, statusCode, body) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  response.end(JSON.stringify(body));
};

const readRequestBody = async (request) => {
  let rawBody = '';

  for await (const chunk of request) {
    rawBody += chunk;
  }

  return rawBody ? JSON.parse(rawBody) : {};
};

const handleRequest = async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host}`);

  if (request.method === 'OPTIONS') {
    sendJson(response, 200, { ok: true });
    return;
  }

  try {
    if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
      const state = await readServerState();

      sendJson(response, 200, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        activeAlertCount: state.syncedAlerts.filter((alert) => !alert.triggered).length,
        notificationCount: state.notifications.length,
        telemetryCount: state.telemetry.length,
        alertPollingEnabled: state.notificationSettings.alertPollingEnabled,
      });
      return;
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/notifications') {
      const state = await readServerState();
      sendJson(response, 200, { notifications: state.notifications.slice(0, 25) });
      return;
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/notification-settings') {
      const state = await readServerState();
      sendJson(response, 200, { settings: state.notificationSettings });
      return;
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/telemetry/summary') {
      const state = await readServerState();
      sendJson(response, 200, buildTelemetrySummary(state));
      return;
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/alerts/sync') {
      // The browser remains the source of truth for alert definitions; the ops
      // server just mirrors that state so it can keep monitoring in the background.
      const payload = alertsSyncPayloadSchema.parse(await readRequestBody(request));
      const state = await updateServerState(async (currentState) => ({
        ...currentState,
        syncedAlerts: payload.alerts,
      }));

      sendJson(response, 200, { syncedAlerts: state.syncedAlerts.length });
      return;
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/notification-settings') {
      const payload = notificationSettingsPayloadSchema.parse(await readRequestBody(request));
      const state = await updateServerState(async (currentState) => ({
        ...currentState,
        notificationSettings: payload.settings,
      }));

      sendJson(response, 200, { settings: state.notificationSettings });
      return;
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/telemetry/events') {
      const payload = telemetryEventSchema.parse(await readRequestBody(request));
      const state = await updateServerState(async (currentState) =>
        recordTelemetryEvent(currentState, payload),
      );

      sendJson(response, 202, { storedEvents: state.telemetry.length });
      return;
    }

    sendJson(response, 404, { message: 'Route not found.' });
  } catch (error) {
    sendJson(response, 400, {
      message: error instanceof Error ? error.message : 'Request failed.',
    });
  }
};

const server = http.createServer((request, response) => {
  // The ops server stays intentionally compact: it only owns alert delivery,
  // notifications, and telemetry that would otherwise disappear in the browser.
  void handleRequest(request, response);
});

server.listen(port, () => {
  console.log(`Metricoin ops server listening on http://127.0.0.1:${port}`);
});

const alertEvaluationInterval = setInterval(() => {
  void updateServerState(async (currentState) => evaluateAlertDeliveries(currentState));
}, 30_000);

const shutdown = () => {
  clearInterval(alertEvaluationInterval);
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
