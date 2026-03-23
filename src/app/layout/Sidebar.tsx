import { Command, Star } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useAppStore } from '@/app/appStore';
import { Button } from '@/shared/components/ui/Button';
import { TRACKED_ASSETS } from '@/shared/constants/assets';
import { NAV_ITEMS } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';

type SidebarProps = {
  mobile?: boolean;
};

export const Sidebar = ({ mobile = false }: SidebarProps) => {
  const favoriteAssetIds = useAppStore((state) => state.favoriteAssetIds);
  const setCommandPaletteOpen = useAppStore((state) => state.setCommandPaletteOpen);

  const favoriteAssets = TRACKED_ASSETS.filter((asset) => favoriteAssetIds.includes(asset.id));

  return (
    <aside className="surface flex h-full flex-col rounded-[2rem] p-5">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">
            MetaSignal
          </p>
          <h1 className="font-display text-2xl font-semibold text-white">Institutional-grade market view</h1>
        </div>

        <Button
          className="justify-between"
          fullWidth
          onClick={() => setCommandPaletteOpen(true)}
          variant="secondary"
        >
          Quick search
          <span className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-400">
            <Command className="h-3.5 w-3.5" />K
          </span>
        </Button>
      </div>

      <nav className="mt-8 flex-1 space-y-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'bg-white text-slate-950'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white',
              )
            }
            key={item.path}
            to={item.path}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Favorites</p>
            <p className="mt-1 text-sm text-slate-300">Pinned for fast review</p>
          </div>
          <Star className="h-4.5 w-4.5 text-amber-300" />
        </div>
        <div className="space-y-2">
          {favoriteAssets.map((asset) => (
            <div
              className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2"
              key={asset.id}
            >
              <p className="text-sm font-semibold text-white">{asset.name}</p>
              <p className="text-sm text-slate-400">{asset.description}</p>
            </div>
          ))}
          {favoriteAssets.length === 0 ? (
            <p className="text-sm text-slate-400">Star assets from Markets to build a tighter watchlist.</p>
          ) : null}
        </div>
      </div>

      {mobile ? (
        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-500">Tap outside the panel to close</p>
      ) : null}
    </aside>
  );
};
