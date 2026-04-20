import { Star } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useAppStore } from '@/app';
import { useMarketStore } from '@/entities/market';
import { AssetIcon, Badge, classNames, NAV_ITEMS } from '@/shared';

type SidebarProps = {
  mobile?: boolean;
};

export const Sidebar = ({ mobile = false }: SidebarProps) => {
  const favoriteAssetIds = useAppStore((state) => state.favoriteAssetIds);
  const assets = useMarketStore((state) => state.assets);

  const favoriteAssets = assets.filter((asset) =>
    favoriteAssetIds.includes(asset.id),
  );

  return (
    <aside
      className={classNames(
        'surface flex h-full flex-col rounded-[2.25rem] p-5 sm:p-6 xl:p-7',
        !mobile && 'lg:min-h-[calc(100vh-4rem)]',
      )}
    >
      <div className="space-y-3">
        <Badge className="highlight-pill w-fit rounded-full px-3 py-1 text-[10px] tracking-[0.28em]">
          Metricoin
        </Badge>
        <h1 className="font-display text-[1.95rem] font-semibold leading-tight text-[var(--text-primary)]">
          Institutional-grade market view
        </h1>
        <p className="max-w-xs text-sm leading-6 text-[var(--text-muted)]">
          A refined crypto workspace for live pricing, portfolio intelligence,
          and fast decision support.
        </p>
      </div>

      <div className="mt-10 flex-1">
        <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
          Navigation
        </p>
        <nav className="mt-3 space-y-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              className={({ isActive }) =>
                classNames(
                  'sidebar-nav-link flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-medium tracking-[0.01em]',
                  isActive && 'sidebar-nav-link-active',
                )
              }
              end={item.path === '/'}
              key={item.path}
              to={item.path}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="surface-subtle space-y-4 rounded-3xl p-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
              Favorites
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Pinned for fast review
            </p>
          </div>
          <Star className="h-4.5 w-4.5 text-[var(--highlight-text)]" />
        </div>
        <div className="space-y-2">
          {favoriteAssets.map((asset) => (
            <div className="surface-muted rounded-2xl px-3 py-3" key={asset.id}>
              <div className="flex min-w-0 items-center gap-3">
                <AssetIcon asset={asset} size="sm" />
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-semibold leading-tight text-[var(--text-primary)]"
                    title={asset.name}
                  >
                    {asset.name}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                    {asset.symbol} / USD
                  </p>
                </div>
              </div>
            </div>
          ))}
          {favoriteAssets.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              Star assets from Markets to build a tighter watchlist.
            </p>
          ) : null}
        </div>
      </div>

      {mobile ? (
        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[var(--text-faint)]">
          Tap outside the panel to close
        </p>
      ) : null}
    </aside>
  );
};
