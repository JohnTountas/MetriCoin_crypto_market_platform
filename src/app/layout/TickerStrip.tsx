// TickerStrip is the fast-scanning market ribbon that keeps navigation close to live prices.
// It stays intentionally lightweight so stream updates can repaint without touching heavier panels.
import { Link } from 'react-router-dom';

import { useMarketStore } from '@/entities/market';
import { AssetIcon, classNames, formatPercent, formatPrice } from '@/shared';

/**
 * TickerStrip keeps live prices one scroll away even when the main page content is deep.
 * The horizontal snap behavior makes the ribbon feel calmer on touch devices.
 */
export const TickerStrip = () => {
  const assets = useMarketStore((state) => state.assets);
  const snapshots = useMarketStore((state) => state.snapshots);
  const setSelectedAssetId = useMarketStore(
    (state) => state.setSelectedAssetId,
  );

  return (
    <div className="surface overflow-hidden rounded-[2rem]">
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 py-3 sm:px-4 sm:py-3.5">
        {assets.map((asset) => {
          const snapshot = snapshots[asset.id];
          const positive = (snapshot?.changePercent24h ?? 0) >= 0;

          return (
            <Link
              className={classNames(
                'surface-hover min-w-[180px] snap-start rounded-[1.4rem] px-3.5 py-3 xs:min-w-[220px] sm:px-4 sm:py-3.5',
                snapshot?.direction === 'up' && 'animate-flash-up',
                snapshot?.direction === 'down' && 'animate-flash-down',
              )}
              key={asset.id}
              onClick={() => setSelectedAssetId(asset.id)}
              to={`/markets/${asset.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <AssetIcon asset={asset} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                      {asset.symbol}
                    </p>
                    <p
                      className="mt-1 truncate text-sm font-semibold text-[var(--text-primary)]"
                      title={asset.name}
                    >
                      {asset.name}
                    </p>
                  </div>
                </div>
                <div
                  className={classNames(
                    'rounded-full border px-2 py-1 text-xs font-medium',
                    positive ? 'tone-positive' : 'tone-negative',
                  )}
                >
                  {snapshot ? formatPercent(snapshot.changePercent24h) : '--'}
                </div>
              </div>
              <p className="mt-4 text-xl font-semibold text-[var(--text-primary)]">
                {snapshot ? formatPrice(snapshot.price) : 'Loading...'}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
