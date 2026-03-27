import { Command, Search, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppStore } from '@/app';
import { useMarketStore } from '@/entities/market';
import { useKeyboardShortcut } from '@/hooks/shared';
import { ROUTES } from '@/shared/constants';
import { AssetIcon, Input } from '@/shared/components/ui';

const baseNavigationCommands = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Jump to the live Metricoin command center.',
    path: ROUTES.dashboard,
    keywords: ['home', 'dashboard', 'overview'],
  },
  {
    id: 'markets',
    label: 'Markets',
    description: 'Browse tracked crypto market snapshots.',
    path: ROUTES.markets,
    keywords: ['markets', 'coins', 'prices'],
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Review your live positions and exposure.',
    path: ROUTES.portfolio,
    keywords: ['portfolio', 'pnl', 'positions'],
  },
  {
    id: 'watchlist',
    label: 'Watchlist',
    description: 'Open favorites and live alerting workflows.',
    path: ROUTES.watchlist,
    keywords: ['watchlist', 'favorites', 'alerts'],
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Customize themes, fees, and portfolio behavior.',
    path: ROUTES.settings,
    keywords: ['settings', 'preferences', 'theme'],
  },
];

export const GlobalCommandPalette = () => {
  const navigate = useNavigate();
  const commandPaletteOpen = useAppStore((state) => state.commandPaletteOpen);
  const setCommandPaletteOpen = useAppStore((state) => state.setCommandPaletteOpen);
  const favoriteAssetIds = useAppStore((state) => state.favoriteAssetIds);
  const assets = useMarketStore((state) => state.assets);
  const setSelectedAssetId = useMarketStore((state) => state.setSelectedAssetId);
  const [searchQuery, setSearchQuery] = useState('');

  useKeyboardShortcut(
    (event) => (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k',
    () => setCommandPaletteOpen(true),
  );

  useEffect(() => {
    if (!commandPaletteOpen) {
      setSearchQuery('');
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const assetCommands = assets.map((asset) => ({
    id: asset.id,
    label: `${asset.name} (${asset.symbol})`,
    description: asset.description,
    path: `/markets/${asset.id}`,
    keywords: [asset.id, asset.name.toLowerCase(), asset.symbol.toLowerCase()],
    asset,
  }));

  const filteredCommands = [...baseNavigationCommands, ...assetCommands].filter((command) => {
    const haystack = `${command.label} ${command.description} ${command.keywords.join(' ')}`.toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="surface-overlay fixed inset-0 z-50 flex items-start justify-center px-4 pt-16 backdrop-blur-md">
      <button
        aria-label="Close command palette"
        className="absolute inset-0"
        onClick={() => setCommandPaletteOpen(false)}
        type="button"
      />
      <div className="surface relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem]">
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
          <Search className="h-4.5 w-4.5 text-[var(--text-muted)]" />
          <Input
            autoFocus
            className="h-auto border-none bg-transparent px-0 text-base focus:ring-0"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search routes, assets, alerts, settings..."
            value={searchQuery}
          />
          <div className="surface-subtle hidden items-center gap-1 rounded-xl px-2 py-1 text-xs text-[var(--text-muted)] sm:flex">
            <Command className="h-3.5 w-3.5" />K
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {filteredCommands.map((command) => (
            <button
              className="surface-hover flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left"
              key={command.id}
              onClick={() => {
                if (command.path?.startsWith('/markets/')) {
                  setSelectedAssetId(command.id);
                }
                navigate(command.path ?? ROUTES.dashboard);
                setCommandPaletteOpen(false);
              }}
              type="button"
            >
              <div className="flex items-center gap-3">
                {'asset' in command ? (
                  <AssetIcon
                    asset={command.asset}
                    size="sm"
                  />
                ) : null}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{command.label}</span>
                    {favoriteAssetIds.includes(command.id) ? (
                      <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                    ) : null}
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{command.description}</p>
                </div>
              </div>
              <span className="text-xs uppercase tracking-[0.22em] text-[var(--text-faint)]">Open</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

