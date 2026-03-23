import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';

import { Card } from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { SectionHeading } from '@/shared/components/ui/SectionHeading';
import { ASSET_LOOKUP } from '@/shared/constants/assets';
import { cn } from '@/shared/lib/cn';
import { formatCurrency, formatPercent, formatPrice, formatQuantity } from '@/shared/lib/formatters';
import type { PositionMetrics } from '@/shared/types/portfolio';

type PositionsOverviewProps = {
  positions: PositionMetrics[];
};

export const PositionsOverview = ({ positions }: PositionsOverviewProps) => {
  if (positions.length === 0) {
    return (
      <EmptyState
        title="Portfolio is ready for its first position"
        description="Add a transaction to unlock live cost-basis tracking, break-even analysis, allocation visuals, and PnL monitoring."
      />
    );
  }

  return (
    <Card className="surface p-5">
      <SectionHeading
        eyebrow="Exposure"
        title="Open positions"
        description="Real-time position cards driven by live prices, average cost, and fee-aware break-even levels."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {positions.map((position) => {
          const positive = position.unrealizedPnL >= 0;
          return (
            <div
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5"
              key={position.assetId}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {position.assetId.replace('-USD', '')}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-white">
                    {ASSET_LOOKUP[position.assetId]?.name}
                  </h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Current value</p>
                  <p className="mt-1 font-semibold text-white">{formatCurrency(position.currentValue)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Position size</p>
                  <p className="mt-1 font-semibold text-white">
                    {formatQuantity(position.assetId, position.quantity)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Average cost</p>
                  <p className="mt-1 font-semibold text-white">{formatPrice(position.averageCost)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Break-even</p>
                  <p className="mt-1 font-semibold text-white">{formatPrice(position.breakEvenPrice)}</p>
                </div>
              </div>

              <div
                className={cn(
                  'mt-5 flex items-center justify-between rounded-2xl px-4 py-3',
                  positive ? 'bg-emerald-400/10 text-emerald-200' : 'bg-rose-400/10 text-rose-200',
                )}
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.22em]">Unrealized PnL</p>
                  <p className="mt-1 text-lg font-semibold">{formatCurrency(position.unrealizedPnL)}</p>
                </div>
                <div className="text-right">
                  <p className="inline-flex items-center gap-1 text-sm font-medium">
                    {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {formatPercent(position.roiPercent)}
                  </p>
                  <p className="mt-1 text-sm opacity-80">{position.allocationPercent.toFixed(1)}% allocation</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
