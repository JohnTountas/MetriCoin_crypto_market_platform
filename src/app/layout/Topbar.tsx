import { Menu, MoonStar, Radio, Search, SunMedium } from 'lucide-react';

import { useAppStore } from '@/app';
import { useMarketStore } from '@/entities/market';
import { useTheme } from '@/hooks/app';
import {
  AssetIcon,
  Badge,
  Button,
  classNames,
  formatTimestamp,
  getFallbackAssetMeta,
} from '@/shared';

const connectionStatusToneMap = {
  connected: 'positive',
  reconnecting: 'warning',
  connecting: 'warning',
  disconnected: 'negative',
  error: 'negative',
  idle: 'default',
} as const;

export const Topbar = () => {
  const setMobileNavOpen = useAppStore((state) => state.setMobileNavOpen);
  const setCommandPaletteOpen = useAppStore(
    (state) => state.setCommandPaletteOpen,
  );
  const connectionStatus = useMarketStore((state) => state.connectionStatus);
  const assetLookup = useMarketStore((state) => state.assetLookup);
  const selectedAssetId = useMarketStore((state) => state.selectedAssetId);
  const snapshots = useMarketStore((state) => state.snapshots);
  const { themePreference, setThemePreference } = useTheme();

  const selectedAsset =
    assetLookup[selectedAssetId] ?? getFallbackAssetMeta(selectedAssetId);
  const selectedSnapshot = snapshots[selectedAssetId];
  const shouldPulseStatus =
    connectionStatus === 'connecting' || connectionStatus === 'reconnecting';

  return (
    <div className="surface flex flex-col gap-4 rounded-[2.25rem] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-start gap-3">
        <Button
          className="lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          size="sm"
          variant="secondary"
        >
          <Menu className="h-4.5 w-4.5" />
        </Button>
        <div className="flex min-w-0 items-start gap-3">
          <AssetIcon asset={selectedAsset} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-xs font-semibold uppercase tracking-[0.3em]">
              Live execution context
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
              <h2 className="basis-full font-display text-xl font-semibold leading-tight text-[var(--text-primary)] sm:basis-auto sm:text-2xl">
                Metricoin market dashboard
              </h2>
              <Badge
                className="shrink-0"
                tone={connectionStatusToneMap[connectionStatus]}
              >
                <Radio
                  className={classNames(
                    'h-3.5 w-3.5',
                    shouldPulseStatus && 'animate-pulse-glow',
                  )}
                />
                {connectionStatus}
              </Badge>
            </div>
            <p className="mt-1 break-words text-sm text-[var(--text-muted)]">
              {selectedSnapshot
                ? `Latest ${selectedAsset.symbol} tick at ${formatTimestamp(selectedSnapshot.lastUpdated, true)}`
                : `Syncing ${selectedAsset.name} market state...`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <Button
          className="w-full justify-between xs:w-auto"
          onClick={() => setCommandPaletteOpen(true)}
          variant="secondary"
        >
          <Search className="h-4.5 w-4.5" />
          Quick search
        </Button>
        <div className="control-group inline-flex rounded-2xl p-1">
          <button
            aria-label="Switch to light theme"
            className={classNames(
              'control-option rounded-2xl px-3 py-2 text-sm',
              themePreference === 'light' && 'control-option-active',
            )}
            onClick={() => setThemePreference('light')}
            type="button"
          >
            <SunMedium className="h-4.5 w-4.5" />
          </button>
          <button
            aria-label="Switch to dark theme"
            className={classNames(
              'control-option rounded-2xl px-3 py-2 text-sm',
              themePreference === 'dark' && 'control-option-active',
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
