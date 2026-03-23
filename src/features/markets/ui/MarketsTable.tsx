import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAppStore } from '@/app';
import { useMarketStore } from '@/entities';
import {
  Button,
  Card,
  formatCompactNumber,
  formatCurrency,
  formatPercent,
  formatPrice,
  formatTimestamp,
  SectionHeading,
  TRACKED_ASSETS,
} from '@/shared';

export const MarketsTable = () => {
  const favoriteAssetIds = useAppStore((state) => state.favoriteAssetIds);
  const toggleFavoriteAsset = useAppStore((state) => state.toggleFavoriteAsset);
  const snapshots = useMarketStore((state) => state.snapshots);

  return (
    <Card className="surface p-5">
      <SectionHeading
        eyebrow="Universe"
        title="Tracked markets"
        description="Primary Bitcoin coverage with scalable multi-asset support, market-cap context, spread visibility, and fast navigation."
      />

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.22em] text-slate-500">
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
          <tbody className="divide-y divide-white/5">
            {TRACKED_ASSETS.map((asset) => {
              const snapshot = snapshots[asset.id];
              return (
                <tr key={asset.id}>
                  <td className="py-4">
                    <div>
                      <p className="font-semibold text-white">{asset.name}</p>
                      <p className="text-slate-500">{asset.symbol}</p>
                    </div>
                  </td>
                  <td className="py-4 text-white">{snapshot ? formatPrice(snapshot.price) : 'Loading...'}</td>
                  <td className="py-4">
                    <div className={snapshot && snapshot.changePercent24h >= 0 ? 'text-emerald-200' : 'text-rose-200'}>
                      <p>{snapshot ? formatPercent(snapshot.changePercent24h) : '--'}</p>
                      <p className="text-slate-500">{snapshot ? formatCurrency(snapshot.change24h) : '--'}</p>
                    </div>
                  </td>
                  <td className="py-4 text-slate-300">
                    {snapshot ? formatCompactNumber(snapshot.volume24h) : '--'}
                  </td>
                  <td className="py-4 text-slate-300">
                    {snapshot ? `${formatPrice(snapshot.high24h)} / ${formatPrice(snapshot.low24h)}` : '--'}
                  </td>
                  <td className="py-4 text-slate-300">
                    {snapshot?.spread ? formatPrice(snapshot.spread) : '--'}
                  </td>
                  <td className="py-4 text-slate-400">
                    {snapshot ? formatTimestamp(snapshot.lastUpdated, true) : '--'}
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
                          className={`h-4 w-4 ${favoriteAssetIds.includes(asset.id) ? 'fill-amber-300 text-amber-300' : 'text-slate-400'}`}
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
