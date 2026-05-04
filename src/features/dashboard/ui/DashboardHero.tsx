// DashboardHero frames the product around the selected asset and the current portfolio snapshot.
// It answers "what matters right now?" before the user scans the rest of the page.
import { ArrowRight, Radar, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useMarketStore } from '@/entities/market';
import {
  AssetIcon,
  Button,
  Card,
  formatCompactNumber,
  formatPercent,
  formatPrice,
  getFallbackAssetMeta,
  type MarketSnapshot,
  type PortfolioSummary,
} from '@/shared';

type DashboardHeroProps = {
  snapshot?: MarketSnapshot;
  summary: PortfolioSummary;
  assetId: string;
};

/**
 * DashboardHero introduces the selected market and the portfolio signals that matter most.
 * The action buttons and live stats stack cleanly so the hero stays readable on smaller devices.
 */
export const DashboardHero = ({
  snapshot,
  summary,
  assetId,
}: DashboardHeroProps) => {
  const assetLookup = useMarketStore((state) => state.assetLookup);
  const asset = assetLookup[assetId] ?? getFallbackAssetMeta(assetId);

  return (
    <Card className="surface overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
      <div className="grid gap-6 lg:gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="eyebrow text-xs font-semibold uppercase tracking-[0.34em]">
              Metricoin terminal
            </p>
            <h1 className="max-w-3xl font-display text-[2.15rem] font-semibold leading-tight text-[var(--text-primary)] sm:text-5xl lg:text-[2.46rem]">
              Premium crypto market intelligence delivering real-time portfolio
              analytics with execution-grade precision.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[var(--text-muted)] sm:text-base sm:leading-8">
              Track {asset.name} in real time, monitor allocation shifts
              instantly, and keep every PnL, ROI, fee impact, and break-even
              figure in sync with the market stream.
            </p>
          </div>

          <div className="flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <Link className="w-full xs:w-auto" to="/portfolio">
              <Button className="w-full xs:w-auto">
                Open portfolio
                <ArrowRight className="h-4.5 w-4.5" />
              </Button>
            </Link>
            <Link className="w-full xs:w-auto" to="/markets">
              <Button className="w-full xs:w-auto" variant="secondary">
                Explore markets
                <Radar className="h-4.5 w-4.5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="surface-subtle space-y-4 rounded-[1.75rem] p-4 sm:p-5">
          <div className="flex flex-col gap-4 xs:flex-row xs:items-start xs:justify-between">
            <div className="flex items-center gap-3">
              <AssetIcon asset={asset} size="lg" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                  {asset.symbol} live ticker
                </p>
                <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
                  {snapshot ? formatPrice(snapshot.price) : 'Loading...'}
                </p>
              </div>
            </div>
            <div className="surface-strong w-full rounded-2xl p-3 text-left xs:w-auto xs:text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-faint)]">
                24h move
              </p>
              <p
                className={
                  snapshot && snapshot.changePercent24h >= 0
                    ? 'mt-2 text-xl font-semibold text-[var(--positive-text)]'
                    : 'mt-2 text-xl font-semibold text-[var(--negative-text)]'
                }
              >
                {snapshot ? formatPercent(snapshot.changePercent24h) : '--'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface-muted rounded-2xl p-4">
              <p className="text-sm text-[var(--text-faint)]">
                Portfolio value
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                {formatPrice(summary.currentValue)}
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Live marked-to-market across open exposures
              </p>
            </div>
            <div className="surface-muted rounded-2xl p-4">
              <p className="text-sm text-[var(--text-faint)]">
                Fees + slippage impact
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                {formatPrice(summary.totalFeesPaid)}
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Historical fees plus modeled exit cost buffer
              </p>
            </div>
            <div className="surface-muted rounded-2xl p-4">
              <p className="text-sm text-[var(--text-faint)]">24h volume</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                {snapshot ? formatCompactNumber(snapshot.volume24h) : '--'}
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Liquidity context for execution confidence
              </p>
            </div>
            <div className="surface-muted rounded-2xl p-4">
              <p className="text-sm text-[var(--text-faint)]">
                Active exposures
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Wallet className="h-5 w-5 text-[var(--accent-strong)]" />
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  {summary.exposureCount}
                </p>
              </div>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Multi-position support for a growing crypto sleeve
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
