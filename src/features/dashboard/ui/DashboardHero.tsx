// DashboardHero frames the product around the selected asset and the current portfolio snapshot.
// It is meant to answer "what matters right now?" before the user scans the rest of the page.
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

export const DashboardHero = ({
  snapshot,
  summary,
  assetId,
}: DashboardHeroProps) => {
  const assetLookup = useMarketStore((state) => state.assetLookup);
  const asset = assetLookup[assetId] ?? getFallbackAssetMeta(assetId);

  return (
    <Card className="surface overflow-hidden rounded-[2rem] p-6 lg:p-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="eyebrow text-xs font-semibold uppercase tracking-[0.34em]">
              Metricoin terminal
            </p>
            <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight text-[var(--text-primary)] sm:text-4xl">
              Premium crypto market intelligence delivering real-time portfolio
              analytics with execution-grade precision.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--text-muted)]">
              Track {asset.name} in real time, monitor allocation shifts
              instantly, and keep every PnL, ROI, fee impact, and break-even
              figure in sync with the market stream.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/portfolio">
              <Button>
                Open portfolio
                <ArrowRight className="h-4.5 w-4.5" />
              </Button>
            </Link>
            <Link to="/markets">
              <Button variant="secondary">
                Explore markets
                <Radar className="h-4.5 w-4.5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="surface-subtle space-y-4 rounded-[1.75rem] p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AssetIcon asset={asset} size="lg" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                  {asset.symbol} live ticker
                </p>
                <p className="mt-2 text-4xl font-semibold text-[var(--text-primary)]">
                  {snapshot ? formatPrice(snapshot.price) : 'Loading...'}
                </p>
              </div>
            </div>
            <div className="surface-strong rounded-2xl p-3 text-right">
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
