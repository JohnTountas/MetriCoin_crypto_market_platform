// MarketsTable is the browseable universe view for tracked assets and their live context.
// It stays table-driven so scaling the asset list does not require rethinking page structure.
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAppStore } from '@/app';
import { useMarketStore } from '@/entities/market';
import {
  AssetIcon,
  Button,
  Card,
  formatCompactNumber,
  formatCurrency,
  formatPercent,
  formatPrice,
  formatTimestamp,
  SectionHeading,
} from '@/shared';

/**
 * MarketsTable gives the tracked universe two views: compact cards for smaller screens and a wide table for desktop.
 * Both views read from the same market state so the content stays identical while the layout adapts.
 */
export const MarketsTable = () => {
  const favoriteAssetIds = useAppStore((state) => state.favoriteAssetIds);
  const toggleFavoriteAsset = useAppStore((state) => state.toggleFavoriteAsset);
  const assets = useMarketStore((state) => state.assets);
  const snapshots = useMarketStore((state) => state.snapshots);

  return (
    <Card className="surface p-4 sm:p-5">
      <SectionHeading
        eyebrow="Universe"
        title="Tracked markets"
        description="Primary Bitcoin coverage with scalable multi-asset support, market-cap context, spread visibility, and fast navigation."
      />

      <div className="mt-6 grid gap-4 md:hidden">
        {assets.map((asset) => {
          const snapshot = snapshots[asset.id];
          const isFavorite = favoriteAssetIds.includes(asset.id);
          const changeTone =
            snapshot && snapshot.changePercent24h >= 0
              ? 'text-[var(--positive-text)]'
              : 'text-[var(--negative-text)]';

          return (
            <div className="surface-subtle rounded-[1.5rem] p-4" key={asset.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <AssetIcon asset={asset} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--text-primary)]">
                      {asset.name}
                    </p>
                    <p className="text-sm text-[var(--text-faint)]">
                      {asset.symbol} / USD
                    </p>
                  </div>
                </div>
                <Button
                  aria-label={
                    isFavorite
                      ? `Remove ${asset.name} from favorites`
                      : `Add ${asset.name} to favorites`
                  }
                  className="h-9 w-9 shrink-0 rounded-2xl p-0"
                  onClick={() => toggleFavoriteAsset(asset.id)}
                  size="sm"
                  variant="secondary"
                >
                  <Star
                    className={`h-4 w-4 ${isFavorite ? 'fill-[var(--highlight-text)] text-[var(--highlight-text)]' : 'text-[var(--text-muted)]'}`}
                  />
                </Button>
              </div>

              <div className="mt-5 grid gap-3 xs:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Price
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                    {snapshot ? formatPrice(snapshot.price) : 'Loading...'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    24h
                  </p>
                  <p className={`mt-1 text-lg font-semibold ${changeTone}`}>
                    {snapshot ? formatPercent(snapshot.changePercent24h) : '--'}
                  </p>
                  <p className="text-sm text-[var(--text-faint)]">
                    {snapshot ? formatCurrency(snapshot.change24h) : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Volume
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                    {snapshot ? formatCompactNumber(snapshot.volume24h) : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Spread
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                    {snapshot?.spread ? formatPrice(snapshot.spread) : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    High / Low
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                    {snapshot
                      ? `${formatPrice(snapshot.high24h)} / ${formatPrice(snapshot.low24h)}`
                      : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Updated
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                    {snapshot
                      ? formatTimestamp(snapshot.lastUpdated, true)
                      : '--'}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <Link className="block" to={`/markets/${asset.id}`}>
                  <Button className="w-full" variant="secondary">
                    Details
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="min-w-[920px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.22em] text-[var(--text-faint)]">
            <tr>
              <th className="pb-3 font-medium">Asset</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium">24h</th>
              <th className="pb-3 font-medium">Volume</th>
              <th className="pb-3 font-medium">High / low</th>
              <th className="pb-3 font-medium">Spread</th>
              <th className="pb-3 font-medium">Updated</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {assets.map((asset) => {
              const snapshot = snapshots[asset.id];

              return (
                <tr key={asset.id}>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <AssetIcon asset={asset} size="sm" />
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">
                          {asset.name}
                        </p>
                        <p className="text-[var(--text-faint)]">
                          {asset.symbol}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-[var(--text-primary)]">
                    {snapshot ? formatPrice(snapshot.price) : 'Loading...'}
                  </td>
                  <td className="py-4">
                    <div
                      className={
                        snapshot && snapshot.changePercent24h >= 0
                          ? 'text-[var(--positive-text)]'
                          : 'text-[var(--negative-text)]'
                      }
                    >
                      <p>
                        {snapshot
                          ? formatPercent(snapshot.changePercent24h)
                          : '--'}
                      </p>
                      <p className="text-[var(--text-faint)]">
                        {snapshot ? formatCurrency(snapshot.change24h) : '--'}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 text-[var(--text-secondary)]">
                    {snapshot ? formatCompactNumber(snapshot.volume24h) : '--'}
                  </td>
                  <td className="py-4 text-[var(--text-secondary)]">
                    {snapshot
                      ? `${formatPrice(snapshot.high24h)} / ${formatPrice(snapshot.low24h)}`
                      : '--'}
                  </td>
                  <td className="py-4 text-[var(--text-secondary)]">
                    {snapshot?.spread ? formatPrice(snapshot.spread) : '--'}
                  </td>
                  <td className="py-4 text-[var(--text-muted)]">
                    {snapshot
                      ? formatTimestamp(snapshot.lastUpdated, true)
                      : '--'}
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <Link to={`/markets/${asset.id}`}>
                        <Button size="sm" variant="secondary">
                          Details
                        </Button>
                      </Link>
                      <Button
                        onClick={() => toggleFavoriteAsset(asset.id)}
                        size="sm"
                        variant="secondary"
                      >
                        <Star
                          className={`h-4 w-4 ${favoriteAssetIds.includes(asset.id) ? 'fill-[var(--highlight-text)] text-[var(--highlight-text)]' : 'text-[var(--text-muted)]'}`}
                        />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
