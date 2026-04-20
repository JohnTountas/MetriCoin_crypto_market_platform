import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { sendTelemetryEvent } from '@/api';

export const trackAnalyticsEvent = (
  name: string,
  metadata?: Record<string, string | number | boolean | null>,
) => {
  void sendTelemetryEvent({
    type: 'analytics',
    name,
    metadata,
  });
};

export const useOperationalTelemetry = () => {
  const location = useLocation();

  useEffect(() => {
    // Browser-level failures are easy to miss in localStorage-only apps, so
    // we forward them to the ops server whenever it is available.
    const handleWindowError = (event: ErrorEvent) => {
      void sendTelemetryEvent({
        type: 'error',
        name: 'window.error',
        message: event.message,
        route: window.location.pathname,
        metadata: {
          source: event.filename ?? 'unknown',
          line: event.lineno ?? 0,
          column: event.colno ?? 0,
        },
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason =
        typeof event.reason === 'string'
          ? event.reason
          : event.reason instanceof Error
            ? event.reason.message
            : 'Unhandled promise rejection';

      void sendTelemetryEvent({
        type: 'error',
        name: 'window.unhandledrejection',
        message: reason,
        route: window.location.pathname,
      });
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    // Page-view telemetry gives the monitoring panel a basic product analytics
    // trail without requiring a third-party analytics SDK.
    void sendTelemetryEvent({
      type: 'analytics',
      name: 'page.view',
      route: location.pathname,
    });
  }, [location.pathname]);
};
