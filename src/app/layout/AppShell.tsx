// AppShell composes the long-lived chrome, background hooks, and route outlet.
// If shared behavior breaks across pages, this shell is the first place to inspect.
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

/**
 * AppShell keeps navigation, streaming hooks, overlays, and route content in one stable frame.
 * It closes the mobile drawer on route changes so smaller screens do not stay trapped behind it.
 */
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
    <div className="mx-auto max-w-[1820px] px-3 pb-6 pt-3 sm:px-5 sm:pb-8 sm:pt-5 lg:px-8 lg:pb-10 lg:pt-7">
      <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6 xl:gap-7">
        <div className="hidden lg:sticky lg:top-6 lg:block lg:self-start xl:top-8">
          <Sidebar />
        </div>

        <div className="flex min-h-[calc(100vh-2.75rem)] flex-col gap-4 sm:min-h-[calc(100vh-4rem)] sm:gap-5 xl:min-h-[calc(100vh-6rem)] xl:gap-7">
          <Topbar />
          <TickerStrip />
          <main className="flex-1 space-y-6 xl:space-y-7">
            <Outlet />
          </main>
          <div className="border-t border-[var(--border)] pt-4 text-center sm:self-end sm:pr-1 sm:text-right">
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
                | Copyright {currentYear}. All rights reserved.
              </span>
            </p>
          </div>
        </div>
      </div>

      {mobileNavOpen ? (
        <div className="surface-overlay fixed inset-0 z-40 flex items-start p-3 backdrop-blur-md sm:p-4 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0"
            onClick={() => setMobileNavOpen(false)}
            type="button"
          />
          <div className="relative z-10 ml-auto w-full max-w-md animate-slide-up">
            <Sidebar mobile />
          </div>
        </div>
      ) : null}

      <GlobalCommandPalette />
      <AppToastViewport />
    </div>
  );
};
