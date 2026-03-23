import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useAppStore } from '@/app/appStore';
import { Sidebar } from '@/app/layout/Sidebar';
import { TickerStrip } from '@/app/layout/TickerStrip';
import { Topbar } from '@/app/layout/Topbar';
import { useTheme } from '@/hooks/app/useTheme';
import { useMarketOverview } from '@/hooks/market/useMarketOverview';
import { useMarketStream } from '@/hooks/market/useMarketStream';
import { useAlertMonitor } from '@/hooks/portfolio/useAlertMonitor';
import { CommandPalette } from '@/shared/components/feedback/CommandPalette';
import { ToastViewport } from '@/shared/components/feedback/ToastViewport';

export const AppShell = () => {
  const location = useLocation();
  const mobileNavOpen = useAppStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useAppStore((state) => state.setMobileNavOpen);

  useTheme();
  useMarketOverview();
  useMarketStream();
  useAlertMonitor();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, setMobileNavOpen]);

  return (
    <div className="mx-auto max-w-[1800px] p-4 sm:p-6 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div className="space-y-6">
          <Topbar />
          <TickerStrip />
          <main className="space-y-6">
            <Outlet />
          </main>
        </div>
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 flex bg-slate-950/70 p-4 backdrop-blur-md lg:hidden">
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

      <CommandPalette />
      <ToastViewport />
    </div>
  );
};
