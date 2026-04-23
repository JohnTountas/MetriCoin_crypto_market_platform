// AppShell is the long-lived composition root for shared chrome and background hooks.
// If a cross-page behavior breaks, start here to verify the shell is still wiring it in.
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useAppStore } from '@/app';
import {
  useOperationalTelemetry,
  useServerNotifications,
  useTheme,
} from '@/hooks/app';
import {
  useMarketSnapshots,
  useMarketTickerStream,
  useTrackedAssets,
} from '@/hooks/market';
import { usePriceAlertMonitor, useServerAlertSync } from '@/hooks/portfolio';
import { AppToastViewport, GlobalCommandPalette } from '@/shared';

import { Sidebar, TickerStrip, Topbar } from '.';

export const AppShell = () => {
  const location = useLocation();
  const mobileNavOpen = useAppStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useAppStore((state) => state.setMobileNavOpen);
  const currentYear = new Date().getFullYear();

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
      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:gap-7">
        <div className="hidden lg:sticky lg:top-8 lg:block lg:self-start">
          <Sidebar />
        </div>

        <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 xl:min-h-[calc(100vh-6rem)] xl:gap-7">
          <Topbar />
          <TickerStrip />
          <main className="flex-1 space-y-6 xl:space-y-7">
            <Outlet />
          </main>
          <div className="self-end border-t border-[var(--border)] pr-1 pt-4 text-right">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Design and Development
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
              <a
                className="font-semibold text-[var(--text-secondary)] underline decoration-slate-400 underline-offset-4 transition hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
                href="https://www.linkedin.com/in/ioannis-tountas"
                rel="noreferrer"
                target="_blank"
              >
                John Tountas
              </a>
              <span className="text-slate-500">
                {' '}
                · Copyright {currentYear}. All rights reserved.
              </span>
            </p>
          </div>
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
