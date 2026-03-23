import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAppStore } from '@/app/appStore';
import { useMarketStore } from '@/entities/market/model/marketStore';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { SectionHeading } from '@/shared/components/ui/SectionHeading';
import { TRACKED_ASSETS } from '@/shared/constants/assets';
import { formatCompactNumber, formatPercent, formatPrice } from '@/shared/lib/formatters';

export const WatchlistGrid = () => {
  const favoriteAssetIds = useAppStore((state) => state.favoriteAssetIds);
  const toggleFavoriteAsset = useAppStore((state) => state.toggleFavoriteAsset);
  const snapshots = useMarketStore((state) => state.snapshots);

  const favoriteAssets = TRACKED_ASSETS.filter((asset) => favoriteAssetIds.includes(asset.id));

  if (favoriteAssets.length === 0) {
    return (
      <EmptyState
        title="No favorites pinned yet"
        description="Star the assets you care about most so the watchlist becomes a fast high-signal monitoring lane."
      />
    );
  }

  return (
    <Card className="surface p-5">
      <SectionHeading
        eyebrow="Watchlist"
        title="Favorite markets"
        description="A tighter high-signal set of coins with fast access to detail pages, live pricing, and 24h context."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {favoriteAssets.map((asset) => {
          const snapshot = snapshots[asset.id];
          return (
            <Link
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20"
              key={asset.id}
              to={`/markets/${asset.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{asset.symbol}</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{asset.name}</h3>
                </div>
                <Button
                  onClick={(event) => {
                    event.preventDefault();
                    toggleFavoriteAsset(asset.id);
                  }}
                  size="sm"
                  variant="secondary"
                >
                  <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                </Button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Spot price</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {snapshot ? formatPrice(snapshot.price) : 'Loading...'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">24h change</p>
                    <p className={snapshot && snapshot.changePercent24h >= 0 ? 'text-emerald-200' : 'text-rose-200'}>
                      {snapshot ? formatPercent(snapshot.changePercent24h) : '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Volume</p>
                    <p className="text-slate-300">
                      {snapshot ? formatCompactNumber(snapshot.volume24h) : '--'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
};

