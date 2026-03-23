import { ArrowRight, Radar, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { ASSET_LOOKUP } from '@/shared/constants/assets';
import { formatCompactNumber, formatPercent, formatPrice } from '@/shared/lib/formatters';
import type { MarketSnapshot } from '@/shared/types/market';
import type { PortfolioSummary } from '@/shared/types/portfolio';

type DashboardHeroProps = {
  snapshot?: MarketSnapshot;
  summary: PortfolioSummary;
  assetId: string;
};

export const DashboardHero = ({ snapshot, summary, assetId }: DashboardHeroProps) => (
  <Card className="surface overflow-hidden rounded-[2rem] p-6 lg:p-8">
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-200/70">Metricoin terminal</p>
          <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Premium crypto market intelligence with live portfolio math and execution-ready clarity.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-slate-400">
            Track {ASSET_LOOKUP[assetId]?.name} in real time, monitor allocation shifts instantly, and keep every PnL,
            ROI, fee impact, and break-even figure in sync with the market stream.
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

      <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {assetId.replace('-USD', '')} live ticker
            </p>
            <p className="mt-2 text-4xl font-semibold text-white">{snapshot ? formatPrice(snapshot.price) : 'Loading...'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-right">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">24h move</p>
            <p className={snapshot && snapshot.changePercent24h >= 0 ? 'mt-2 text-xl font-semibold text-emerald-200' : 'mt-2 text-xl font-semibold text-rose-200'}>
              {snapshot ? formatPercent(snapshot.changePercent24h) : '--'}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-sm text-slate-500">Portfolio value</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatPrice(summary.currentValue)}</p>
            <p className="mt-1 text-sm text-slate-400">Live marked-to-market across open exposures</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-sm text-slate-500">Fees + slippage impact</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatPrice(summary.totalFeesPaid)}</p>
            <p className="mt-1 text-sm text-slate-400">Historical fees plus modeled exit cost buffer</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-sm text-slate-500">24h volume</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {snapshot ? formatCompactNumber(snapshot.volume24h) : '--'}
            </p>
            <p className="mt-1 text-sm text-slate-400">Liquidity context for execution confidence</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-sm text-slate-500">Active exposures</p>
            <div className="mt-2 flex items-center gap-3">
              <Wallet className="h-5 w-5 text-cyan-200" />
              <p className="text-2xl font-semibold text-white">{summary.exposureCount}</p>
            </div>
            <p className="mt-1 text-sm text-slate-400">Multi-position support for a growing crypto sleeve</p>
          </div>
        </div>
      </div>
    </div>
  </Card>
);
