import { Command, Star } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useAppStore } from '@/app';
import { useMarketStore } from '@/entities/market';
import { AssetIcon, Button, classNames, NAV_ITEMS } from '@/shared';

type SidebarProps = {
  mobile?: boolean;
};

export const Sidebar = ({ mobile = false }: SidebarProps) => {
  const favoriteAssetIds = useAppStore((state) => state.favoriteAssetIds);
  const setCommandPaletteOpen = useAppStore((state) => state.setCommandPaletteOpen);
  const assets = useMarketStore((state) => state.assets);

  const favoriteAssets = assets.filter((asset) => favoriteAssetIds.includes(asset.id));

  return (
    <aside className="surface flex h-full flex-col rounded-[2rem] p-5">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.32em]">
            Metricoin
          </p>
          <h1 className="font-display text-2xl font-semibold text-[var(--text-primary)]">Institutional-grade market view</h1>
        </div>

        <Button
          className="justify-between"
          fullWidth
          onClick={() => setCommandPaletteOpen(true)}
          variant="secondary"
        >
          Quick search
          <span className="surface-subtle inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs text-[var(--text-muted)]">
            <Command className="h-3.5 w-3.5" />K
          </span>
        </Button>
      </div>

      <nav className="mt-8 flex-1 space-y-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            className={({ isActive }) =>
              classNames(
                'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'control-option-active'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--panel-subtle)] hover:text-[var(--text-primary)]',
              )
            }
            key={item.path}
            to={item.path}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="surface-subtle space-y-4 rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">Favorites</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Pinned for fast review</p>
          </div>
          <Star className="h-4.5 w-4.5 text-amber-300" />
        </div>
        <div className="space-y-2">
          {favoriteAssets.map((asset) => (
            <div
              className="surface-muted rounded-2xl px-3 py-2"
              key={asset.id}
            >
              <div className="flex items-center gap-3">
                <AssetIcon
                  asset={asset}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{asset.name}</p>
                  <p className="truncate text-sm text-[var(--text-muted)]">{asset.description}</p>
                </div>
              </div>
            </div>
          ))}
          {favoriteAssets.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Star assets from Markets to build a tighter watchlist.</p>
          ) : null}
        </div>
      </div>

      {mobile ? (
        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[var(--text-faint)]">Tap outside the panel to close</p>
      ) : null}
    </aside>
  );
};
