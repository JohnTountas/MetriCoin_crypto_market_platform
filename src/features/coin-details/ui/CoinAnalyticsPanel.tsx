import { CandlestickChart, LineChart, Scale, TimerReset } from 'lucide-react';
import { useState } from 'react';

import { useMarketStore } from '@/entities/market/model/marketStore';
import { useTheme } from '@/hooks/app/useTheme';
import { useAssetCandles } from '@/hooks/market/useAssetCandles';
import { MarketPriceChart } from '@/shared/components/charts/MarketPriceChart';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { SegmentedControl } from '@/shared/components/ui/SegmentedControl';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { ASSET_LOOKUP, TIMEFRAME_OPTIONS } from '@/shared/constants/assets';
import { formatCompactNumber, formatPrice, formatTimestamp } from '@/shared/lib/formatters';

type CoinAnalyticsPanelProps = {
  assetId: string;
};

export const CoinAnalyticsPanel = ({ assetId }: CoinAnalyticsPanelProps) => {
  const activeTimeframe = useMarketStore((state) => state.activeTimeframe);
  const setActiveTimeframe = useMarketStore((state) => state.setActiveTimeframe);
  const snapshot = useMarketStore((state) => state.snapshots[assetId]);
  const [chartMode, setChartMode] = useState<'area' | 'candles'>('area');
  const { resolvedTheme } = useTheme();
  const candlesQuery = useAssetCandles(assetId, activeTimeframe);

  return (
    <Card className="surface p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
            {ASSET_LOOKUP[assetId]?.symbol} analytics
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">{ASSET_LOOKUP[assetId]?.name}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{ASSET_LOOKUP[assetId]?.description}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <SegmentedControl
            onChange={setActiveTimeframe}
            options={TIMEFRAME_OPTIONS.map((option) => ({ label: option.label, value: option.label }))}
            value={activeTimeframe}
          />
          <div className="inline-flex rounded-2xl border border-white/10 bg-slate-950/70 p-1">
            <Button
              className={chartMode === 'area' ? 'bg-white text-slate-950 hover:bg-white' : ''}
              onClick={() => setChartMode('area')}
              size="sm"
              variant="ghost"
            >
              <LineChart className="h-4 w-4" />
            </Button>
            <Button
              className={chartMode === 'candles' ? 'bg-white text-slate-950 hover:bg-white' : ''}
              onClick={() => setChartMode('candles')}
              size="sm"
              variant="ghost"
            >
              <CandlestickChart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-4">
          {candlesQuery.isLoading ? (
            <Skeleton className="h-[360px] rounded-[1.5rem]" />
          ) : (
            <MarketPriceChart
              candles={candlesQuery.data?.candles ?? []}
              mode={chartMode}
              theme={resolvedTheme}
            />
          )}
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Spot price</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {snapshot ? formatPrice(snapshot.price) : 'Loading...'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-100">
                <Scale className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Bid</p>
                <p className="mt-1 font-semibold text-white">{snapshot?.bid ? formatPrice(snapshot.bid) : '--'}</p>
              </div>
              <div>
                <p className="text-slate-500">Ask</p>
                <p className="mt-1 font-semibold text-white">{snapshot?.ask ? formatPrice(snapshot.ask) : '--'}</p>
              </div>
              <div>
                <p className="text-slate-500">High 24h</p>
                <p className="mt-1 font-semibold text-white">{snapshot ? formatPrice(snapshot.high24h) : '--'}</p>
              </div>
              <div>
                <p className="text-slate-500">Low 24h</p>
                <p className="mt-1 font-semibold text-white">{snapshot ? formatPrice(snapshot.low24h) : '--'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3">
              <TimerReset className="h-4.5 w-4.5 text-cyan-200" />
              <p className="text-sm font-semibold text-white">Market context</p>
            </div>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">24h volume</span>
                <span className="font-medium text-slate-200">
                  {snapshot ? formatCompactNumber(snapshot.volume24h) : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Market cap</span>
                <span className="font-medium text-slate-200">
                  {snapshot?.marketCap ? formatCompactNumber(snapshot.marketCap) : 'n/a'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Spread</span>
                <span className="font-medium text-slate-200">
                  {snapshot?.spread ? formatPrice(snapshot.spread) : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last update</span>
                <span className="font-medium text-slate-200">
                  {snapshot ? formatTimestamp(snapshot.lastUpdated) : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

