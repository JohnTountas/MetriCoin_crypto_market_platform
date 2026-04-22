// PortfolioPerformancePanel presents the reconstructed history view plus its headline metrics.
// It keeps timeframe changes close to the data they affect so the feature stays easy to reason about.
import { useState } from 'react';

import { useTheme } from '@/hooks/app';
import { usePortfolioPerformanceHistory } from '@/hooks/portfolio';
import {
  Card,
  EmptyState,
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
  PortfolioPerformanceChart,
  SectionHeading,
  SegmentedControl,
  Skeleton,
  TIMEFRAME_OPTIONS,
} from '@/shared';
import type { PortfolioPerformancePoint, Timeframe } from '@/shared/types';

const buildPerformanceSummary = (points: PortfolioPerformancePoint[]) => {
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const peakValue = points.reduce(
    (peak, point) => Math.max(peak, point.value),
    0,
  );
  const changeValue = lastPoint.value - firstPoint.value;
  const changePercent = firstPoint.value === 0 ? 0 : (changeValue / firstPoint.value) * 100;

  return {
    currentValue: lastPoint.value,
    investedCapital: lastPoint.investedCapital,
    changeValue,
    changePercent,
    peakValue,
  };
};

export const PortfolioPerformancePanel = () => {
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('30D');
  const { resolvedTheme } = useTheme();
  const { points, assetCount, hasErrors, isLoading } = usePortfolioPerformanceHistory(activeTimeframe);

  if (points.length === 0 && !isLoading) {
    return (
      <EmptyState
        title="No performance timeline yet"
        description="Add or import trades first so Metricoin can reconstruct your portfolio value over time."
      />
    );
  }

  const summary = points.length > 0 ? buildPerformanceSummary(points) : undefined;

  return (
    <Card className="surface p-5">
      <SectionHeading
        action={
          <SegmentedControl
            onChange={setActiveTimeframe}
            options={TIMEFRAME_OPTIONS.map((option) => ({ label: option.label, value: option.label }))}
            value={activeTimeframe}
          />
        }
        eyebrow="Performance"
        title="Historical portfolio value"
        description="Metricoin rebuilds your portfolio value over time using ledger quantities, transaction cost basis, and historical market candles."
      />

      {summary ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="surface-subtle rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
              Current value
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {formatCurrency(summary.currentValue)}
            </p>
          </div>
          <div className="surface-subtle rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
              Open capital
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {formatCurrency(summary.investedCapital)}
            </p>
          </div>
          <div className="surface-subtle rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
              Period move
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {formatSignedCurrency(summary.changeValue)}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{formatPercent(summary.changePercent)}</p>
          </div>
          <div className="surface-subtle rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
              Peak value
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {formatCurrency(summary.peakValue)}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{assetCount} assets priced in this range</p>
          </div>
        </div>
      ) : null}

      <div className="mt-6 surface-muted rounded-[1.75rem] p-4">
        {isLoading ? <Skeleton className="h-[320px] rounded-[1.5rem]" /> : null}
        {!isLoading && points.length > 0 ? (
          <PortfolioPerformanceChart
            points={points}
            theme={resolvedTheme}
          />
        ) : null}
      </div>

      {hasErrors ? (
        <p className="mt-4 text-sm leading-6 text-[var(--warning-text)]">
          Some assets do not have complete historical candle coverage, so Metricoin falls back to trade prices until live history becomes available.
        </p>
      ) : null}
    </Card>
  );
};
