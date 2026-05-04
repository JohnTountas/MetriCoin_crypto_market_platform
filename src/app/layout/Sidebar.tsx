// Sidebar owns primary navigation plus the pinned favorites rail.
// Keeping it separate from page content makes navigation changes easier to scale safely.
import { House, Star } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useAppStore } from '@/app';
import { useMarketStore } from '@/entities/market';
import { AssetIcon, classNames, NAV_ITEMS, ROUTES } from '@/shared';

type SidebarProps = {
  mobile?: boolean;
};

/**
 * Sidebar keeps the main route map and favorite assets visible in one predictable place.
 * The same component powers desktop chrome and the mobile drawer so navigation stays aligned.
 */
export const Sidebar = ({ mobile = false }: SidebarProps) => {
  const favoriteAssetIds = useAppStore((state) => state.favoriteAssetIds);
  const setMobileNavOpen = useAppStore((state) => state.setMobileNavOpen);
  const assets = useMarketStore((state) => state.assets);
  const navigate = useNavigate();

  const favoriteAssets = assets.filter((asset) =>
    favoriteAssetIds.includes(asset.id),
  );

  /**
   * handleHomeClick returns the user to the dashboard and resets the scroll position.
   * That small reset keeps the brand badge useful as a quick "start over" action on long pages.
   */
  const handleHomeClick = () => {
    setMobileNavOpen(false);
    navigate(ROUTES.dashboard);

    // The badge doubles as a lightweight "back to the top" action, so the same
    // control handles navigation and a clean viewport reset.
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  return (
    <aside
      className={classNames(
        'surface flex h-full max-h-[calc(100vh-1.5rem)] flex-col overflow-y-auto rounded-[2rem] p-4 sm:max-h-[calc(100vh-2rem)] sm:p-5 xl:p-7',
        !mobile && 'lg:min-h-[calc(100vh-4rem)]',
      )}
    >
      <div className="space-y-3">
        <button
          aria-label="Go to dashboard and scroll to top"
          className="surface-subtle group w-full rounded-[1.75rem] border border-[var(--highlight-border)] px-4 py-3 text-left transition duration-200 hover:-translate-y-px hover:border-[var(--border-strong)] hover:bg-[var(--panel-hover)] hover:shadow-[var(--shadow-floating)] hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.35)] hover:filter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
          onClick={handleHomeClick}
          type="button"
        >
          <div className="flex items-center gap-3">
            <div className="highlight-pill flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition duration-200 group-hover:scale-[1.04]">
              <House className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.3em] text-[var(--highlight-text)]">
                Home
              </p>
              <p className="mt-1 text-xl font-semibold tracking-[0.01em] text-[var(--text-primary)]">
                Metricoin
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Return to dashboard
              </p>
            </div>
          </div>
        </button>
        <h1 className="font-display text-[1.75rem] font-semibold leading-tight text-[var(--text-primary)] sm:text-[1.95rem]">
          Institutional-grade market view
        </h1>
        <p className="max-w-xs text-sm leading-6 text-[var(--text-muted)]">
          A refined crypto workspace for live pricing, portfolio intelligence,
          and fast decision support.
        </p>
      </div>

      <div className="mt-8 flex-1">
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

      <div className="surface-subtle space-y-4 rounded-3xl p-5 sm:p-6">
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
        <p className="mt-4 text-center text-xs uppercase tracking-[0.22em] text-[var(--text-faint)]">
          Tap outside the panel to close
        </p>
      ) : null}
    </aside>
  );
};
