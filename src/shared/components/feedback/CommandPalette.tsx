import { Command, Search, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppStore } from '@/app/appStore';
import { useMarketStore } from '@/entities/market/model/marketStore';
import { useHotkeys } from '@/hooks/shared/useHotkeys';
import { Input } from '@/shared/components/ui/Input';
import { TRACKED_ASSETS } from '@/shared/constants/assets';
import { ROUTES } from '@/shared/constants/routes';

const baseCommands = [
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

export const CommandPalette = () => {
  const navigate = useNavigate();
  const commandPaletteOpen = useAppStore((state) => state.commandPaletteOpen);
  const setCommandPaletteOpen = useAppStore((state) => state.setCommandPaletteOpen);
  const favoriteAssetIds = useAppStore((state) => state.favoriteAssetIds);
  const setSelectedAssetId = useMarketStore((state) => state.setSelectedAssetId);
  const [query, setQuery] = useState('');

  useHotkeys(
    (event) => (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k',
    () => setCommandPaletteOpen(true),
  );

  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery('');
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const assetCommands = TRACKED_ASSETS.map((asset) => ({
    id: asset.id,
    label: `${asset.name} (${asset.symbol})`,
    description: asset.description,
    path: `/markets/${asset.id}`,
    keywords: [asset.id, asset.name.toLowerCase(), asset.symbol.toLowerCase()],
  }));

  const commands = [...baseCommands, ...assetCommands].filter((command) => {
    const haystack = `${command.label} ${command.description} ${command.keywords.join(' ')}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 px-4 pt-16 backdrop-blur-md">
      <button
        aria-label="Close command palette"
        className="absolute inset-0"
        onClick={() => setCommandPaletteOpen(false)}
        type="button"
      />
      <div className="surface relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem]">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Search className="h-4.5 w-4.5 text-slate-400" />
          <Input
            autoFocus
            className="h-auto border-none bg-transparent px-0 text-base focus:ring-0"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search routes, assets, alerts, settings..."
            value={query}
          />
          <div className="hidden items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-400 sm:flex">
            <Command className="h-3.5 w-3.5" />K
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {commands.map((command) => (
            <button
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-white/5"
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
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{command.label}</span>
                  {favoriteAssetIds.includes(command.id) ? (
                    <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                  ) : null}
                </div>
                <p className="text-sm text-slate-400">{command.description}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.22em] text-slate-500">Open</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
