// WatchlistGrid is the high-signal favorites surface for fast market monitoring.
// It intentionally reuses shared state so pinned assets stay consistent across the whole app.
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAppStore } from '@/app';
import { useMarketStore } from '@/entities/market';
import {
  AssetIcon,
  Button,
  Card,
  classNames,
  EmptyState,
  formatCompactNumber,
  formatPercent,
  formatPrice,
  SectionHeading,
} from '@/shared';

const TWO_LINE_CLAMP_STYLE = {
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical' as const,
  WebkitLineClamp: 2,
  overflow: 'hidden',
};

export const WatchlistGrid = () => {
  const favoriteAssetIds = useAppStore((state) => state.favoriteAssetIds);
  const toggleFavoriteAsset = useAppStore((state) => state.toggleFavoriteAsset);
  const assets = useMarketStore((state) => state.assets);
  const snapshots = useMarketStore((state) => state.snapshots);

  const favoriteAssets = assets.filter((asset) =>
    favoriteAssetIds.includes(asset.id),
  );

  if (favoriteAssets.length === 0) {
    return (
      <EmptyState
        title="No favorites pinned yet"
        description="Star the coins you care about most so the watchlist becomes a fast high-signal monitoring lane."
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

      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4">
        {favoriteAssets.map((asset) => {
          const snapshot = snapshots[asset.id];
          return (
            <Link
              className="surface-hover relative overflow-hidden rounded-[1.75rem] p-5 transition-transform duration-200 hover:-translate-y-0.5"
              key={asset.id}
              to={`/markets/${asset.id}`}
            >
              <Button
                aria-label={`Remove ${asset.name} from favorites`}
                className="absolute right-5 top-5 h-9 w-9 shrink-0 rounded-2xl p-0"
                onClick={(event) => {
                  event.preventDefault();
                  toggleFavoriteAsset(asset.id);
                }}
                size="sm"
                variant="secondary"
              >
                <Star className="h-4 w-4 fill-[var(--highlight-text)] text-[var(--highlight-text)]" />
              </Button>

              <div className="flex min-w-0 items-start gap-3.5 pr-12">
                <div className="pt-0.5">
                  <AssetIcon asset={asset} size="md" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]"
                    title={`${asset.symbol} / USD`}
                  >
                    {asset.symbol} / USD
                  </p>
                  <h3
                    className="mt-1 text-lg font-semibold leading-tight text-[var(--text-primary)] sm:text-xl"
                    style={TWO_LINE_CLAMP_STYLE}
                    title={asset.name}
                  >
                    {asset.name}
                  </h3>
                  <p className="mt-1 truncate text-sm text-[var(--text-muted)]">
                    Live spot market
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                    Spot price
                  </p>
                  <p className="mt-2 text-[1.65rem] font-semibold leading-none tracking-tight text-[var(--text-primary)]">
                    {snapshot ? formatPrice(snapshot.price) : 'Loading...'}
                  </p>
                </div>

                <div className="surface-muted mt-5 grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-3 rounded-[1.25rem] p-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">
                      24h change
                    </p>
                    <p
                      className={classNames(
                        'mt-2 text-base font-semibold',
                        !snapshot
                          ? 'text-[var(--text-secondary)]'
                          : snapshot.changePercent24h >= 0
                            ? 'text-[var(--positive-text)]'
                            : 'text-[var(--negative-text)]',
                      )}
                    >
                      {snapshot
                        ? formatPercent(snapshot.changePercent24h)
                        : '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">
                      24h volume
                    </p>
                    <p className="mt-2 text-base font-semibold text-[var(--text-secondary)]">
                      {snapshot
                        ? formatCompactNumber(snapshot.volume24h)
                        : '--'}
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
