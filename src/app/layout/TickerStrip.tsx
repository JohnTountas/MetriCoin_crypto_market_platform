import { Link } from 'react-router-dom';

import { useMarketStore } from '@/entities';
import { cn, formatPercent, formatPrice, TRACKED_ASSETS } from '@/shared';

export const TickerStrip = () => {
  const snapshots = useMarketStore((state) => state.snapshots);
  const setSelectedAssetId = useMarketStore((state) => state.setSelectedAssetId);

  return (
    <div className="surface overflow-hidden rounded-[2rem]">
      <div className="flex gap-3 overflow-x-auto px-4 py-3">
        {TRACKED_ASSETS.map((asset) => {
          const snapshot = snapshots[asset.id];
          const positive = (snapshot?.changePercent24h ?? 0) >= 0;

          return (
            <Link
              className={cn(
                'min-w-[220px] rounded-2xl border px-4 py-3 transition hover:border-white/20',
                snapshot?.direction === 'up' && 'animate-flash-up',
                snapshot?.direction === 'down' && 'animate-flash-down',
                'border-white/10 bg-white/[0.04]',
              )}
              key={asset.id}
              onClick={() => setSelectedAssetId(asset.id)}
              to={`/markets/${asset.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {asset.symbol}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{asset.name}</p>
                </div>
                <div
                  className={cn(
                    'rounded-full px-2 py-1 text-xs font-medium',
                    positive ? 'bg-emerald-400/10 text-emerald-200' : 'bg-rose-400/10 text-rose-200',
                  )}
                >
                  {snapshot ? formatPercent(snapshot.changePercent24h) : '--'}
                </div>
              </div>
              <p className="mt-4 text-xl font-semibold text-white">
                {snapshot ? formatPrice(snapshot.price) : 'Loading...'}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
