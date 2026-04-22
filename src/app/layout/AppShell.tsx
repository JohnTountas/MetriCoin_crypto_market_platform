// AppShell is the long-lived composition root for shared chrome and background hooks.
// If a cross-page behavior breaks, start here to verify the shell is still wiring it in.
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useAppStore } from '@/app';
import { useOperationalTelemetry, useServerNotifications, useTheme } from '@/hooks/app';
import { useMarketSnapshots, useMarketTickerStream, useTrackedAssets } from '@/hooks/market';
import { usePriceAlertMonitor, useServerAlertSync } from '@/hooks/portfolio';
import { AppToastViewport, GlobalCommandPalette } from '@/shared';

import { Sidebar, TickerStrip, Topbar } from '.';

export const AppShell = () => {
  const location = useLocation();
  const mobileNavOpen = useAppStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useAppStore((state) => state.setMobileNavOpen);

  useTheme();
  useTrackedAssets();
  useMarketSnapshots();
  useMarketTickerStream();
  usePriceAlertMonitor();
  useServerAlertSync();
  useServerNotifications();
  useOperationalTelemetry();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, setMobileNavOpen]);

  return (
    <div className="mx-auto max-w-[1820px] px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-6 lg:px-8 lg:pb-12 lg:pt-8">
      <div className="grid items-start gap-6 xl:gap-7 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="hidden lg:sticky lg:top-8 lg:block lg:self-start">
          <Sidebar />
        </div>

        <div className="space-y-6 xl:space-y-7">
          <Topbar />
          <TickerStrip />
          <main className="space-y-6 xl:space-y-7">
            <Outlet />
          </main>
        </div>
      </div>

      {mobileNavOpen ? (
        <div className="surface-overlay fixed inset-0 z-40 flex p-4 backdrop-blur-md lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0"
            onClick={() => setMobileNavOpen(false)}
            type="button"
          />
          <div className="relative z-10 h-full w-full max-w-sm">
            <Sidebar mobile />
          </div>
        </div>
      ) : null}

      <GlobalCommandPalette />
      <AppToastViewport />
    </div>
  );
};

