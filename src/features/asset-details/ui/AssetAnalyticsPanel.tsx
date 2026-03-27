import { CandlestickChart, LineChart, Scale, TimerReset } from 'lucide-react';
import { useState } from 'react';

import { useMarketStore } from '@/entities/market';
import { useTheme } from '@/hooks/app';
import { useAssetPriceHistory, useLiveAssetSnapshot } from '@/hooks/market';
import {
  AssetIcon,
  Card,
  classNames,
  formatCompactNumber,
  getFallbackAssetMeta,
  formatPrice,
  formatTimestamp,
  AssetPriceChart,
  SegmentedControl,
  Skeleton,
  TIMEFRAME_OPTIONS,
} from '@/shared';

type AssetAnalyticsPanelProps = {
  assetId: string;
};

const chartModeOptions: Array<{
  value: 'area' | 'candles';
  icon: typeof LineChart;
  label: string;
}> = [
  { value: 'area', icon: LineChart, label: 'Area chart' },
  { value: 'candles', icon: CandlestickChart, label: 'Candlestick chart' },
];

export const AssetAnalyticsPanel = ({ assetId }: AssetAnalyticsPanelProps) => {
  const activeTimeframe = useMarketStore((state) => state.activeTimeframe);
  const setActiveTimeframe = useMarketStore((state) => state.setActiveTimeframe);
  const assetLookup = useMarketStore((state) => state.assetLookup);
  const snapshot = useMarketStore((state) => state.snapshots[assetId]);
  const [chartMode, setChartMode] = useState<'area' | 'candles'>('area');
  const { resolvedTheme } = useTheme();
  const candlesQuery = useAssetPriceHistory(assetId, activeTimeframe);
  const asset = assetLookup[assetId] ?? getFallbackAssetMeta(assetId);

  useLiveAssetSnapshot(assetId);

  return (
    <Card className="surface p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <AssetIcon
            asset={asset}
            size="lg"
          />
          <div>
            <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
              {asset.symbol} analytics
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-[var(--text-primary)]">{asset.name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">{asset.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <SegmentedControl
            onChange={setActiveTimeframe}
            options={TIMEFRAME_OPTIONS.map((option) => ({ label: option.label, value: option.label }))}
            value={activeTimeframe}
          />
          <div className="control-group inline-flex rounded-2xl p-1">
            {chartModeOptions.map((option) => {
              const Icon = option.icon;

              return (
                <button
                  aria-label={option.label}
                  className={classNames(
                    'control-option rounded-2xl px-3 py-2 text-sm font-medium',
                    chartMode === option.value && 'control-option-active',
                  )}
                  key={option.value}
                  onClick={() => setChartMode(option.value)}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="surface-muted rounded-[1.75rem] p-4">
          {candlesQuery.isLoading ? (
            <Skeleton className="h-[360px] rounded-[1.5rem]" />
          ) : (
            <AssetPriceChart
              candles={candlesQuery.data?.candles ?? []}
              mode={chartMode}
              theme={resolvedTheme}
            />
          )}
        </div>

        <div className="grid gap-4">
          <div className="surface-subtle rounded-[1.75rem] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--text-faint)]">Spot price</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">
                  {snapshot ? formatPrice(snapshot.price) : 'Loading...'}
                </p>
              </div>
              <div className="surface-subtle rounded-2xl p-3 text-[var(--text-primary)]">
                <Scale className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--text-faint)]">Bid</p>
                <p className="mt-1 font-semibold text-[var(--text-primary)]">{snapshot?.bid ? formatPrice(snapshot.bid) : '--'}</p>
              </div>
              <div>
                <p className="text-[var(--text-faint)]">Ask</p>
                <p className="mt-1 font-semibold text-[var(--text-primary)]">{snapshot?.ask ? formatPrice(snapshot.ask) : '--'}</p>
              </div>
              <div>
                <p className="text-[var(--text-faint)]">High 24h</p>
                <p className="mt-1 font-semibold text-[var(--text-primary)]">{snapshot ? formatPrice(snapshot.high24h) : '--'}</p>
              </div>
              <div>
                <p className="text-[var(--text-faint)]">Low 24h</p>
                <p className="mt-1 font-semibold text-[var(--text-primary)]">{snapshot ? formatPrice(snapshot.low24h) : '--'}</p>
              </div>
            </div>
          </div>

          <div className="surface-subtle rounded-[1.75rem] p-5">
            <div className="flex items-center gap-3">
              <TimerReset className="h-4.5 w-4.5 text-[var(--accent-text)]" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">Market context</p>
            </div>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-faint)]">24h volume</span>
                <span className="font-medium text-[var(--text-secondary)]">
                  {snapshot ? formatCompactNumber(snapshot.volume24h) : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-faint)]">Market cap</span>
                <span className="font-medium text-[var(--text-secondary)]">
                  {snapshot?.marketCap ? formatCompactNumber(snapshot.marketCap) : 'n/a'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-faint)]">Spread</span>
                <span className="font-medium text-[var(--text-secondary)]">
                  {snapshot?.spread ? formatPrice(snapshot.spread) : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-faint)]">Last update</span>
                <span className="font-medium text-[var(--text-secondary)]">
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

