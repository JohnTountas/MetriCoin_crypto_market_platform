import { Command, Menu, MoonStar, Radio, SunMedium } from 'lucide-react';

import { useAppStore } from '@/app/appStore';
import { useMarketStore } from '@/entities/market/model/marketStore';
import { useTheme } from '@/hooks/app/useTheme';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { formatTimestamp } from '@/shared/lib/formatters';

const statusToneMap = {
  connected: 'positive',
  reconnecting: 'warning',
  connecting: 'warning',
  disconnected: 'negative',
  error: 'negative',
  idle: 'default',
} as const;

export const Topbar = () => {
  const setMobileNavOpen = useAppStore((state) => state.setMobileNavOpen);
  const setCommandPaletteOpen = useAppStore((state) => state.setCommandPaletteOpen);
  const connectionStatus = useMarketStore((state) => state.connectionStatus);
  const selectedAssetId = useMarketStore((state) => state.selectedAssetId);
  const snapshots = useMarketStore((state) => state.snapshots);
  const { themePreference, setThemePreference } = useTheme();

  const selectedSnapshot = snapshots[selectedAssetId];

  return (
    <div className="surface flex flex-col gap-4 rounded-[2rem] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Button
          className="lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          size="sm"
          variant="secondary"
        >
          <Menu className="h-4.5 w-4.5" />
        </Button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/70">
            Live execution context
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl font-semibold text-white">Metricoin market dashboard</h2>
            <Badge tone={statusToneMap[connectionStatus]}>
              <Radio className={cn('h-3.5 w-3.5', connectionStatus === 'connected' && 'animate-pulse-glow')} />
              {connectionStatus}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {selectedSnapshot
              ? `Latest ${selectedAssetId.replace('-USD', '')} tick at ${formatTimestamp(selectedSnapshot.lastUpdated, true)}`
              : 'Syncing market state...'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => setCommandPaletteOpen(true)}
          variant="secondary"
        >
          <Command className="h-4.5 w-4.5" />
          Quick search
        </Button>
        <div className="inline-flex rounded-2xl border border-white/10 bg-slate-950/60 p-1">
          <button
            className={cn(
              'rounded-2xl px-3 py-2 text-sm transition',
              themePreference === 'light' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white',
            )}
            onClick={() => setThemePreference('light')}
            type="button"
          >
            <SunMedium className="h-4.5 w-4.5" />
          </button>
          <button
            className={cn(
              'rounded-2xl px-3 py-2 text-sm transition',
              themePreference === 'dark' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white',
            )}
            onClick={() => setThemePreference('dark')}
            type="button"
          >
            <MoonStar className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
