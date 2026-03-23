import { BadgeDollarSign, Gauge, ShieldCheck, Sparkles } from 'lucide-react';

import { StatCard } from '@/shared/components/ui/StatCard';
import { formatCurrency, formatPercent, formatPrice } from '@/shared/lib/formatters';
import type { PortfolioSummary, PositionMetrics } from '@/shared/types/portfolio';

type PortfolioSummaryGridProps = {
  summary: PortfolioSummary;
  bestPerformer?: PositionMetrics;
  worstPerformer?: PositionMetrics;
};

export const PortfolioSummaryGrid = ({
  summary,
  bestPerformer,
  worstPerformer,
}: PortfolioSummaryGridProps) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <StatCard
      detail="Live position mark"
      icon={<BadgeDollarSign className="h-5 w-5" />}
      label="Current value"
      tone={summary.unrealizedPnL >= 0 ? 'positive' : 'negative'}
      value={formatCurrency(summary.currentValue)}
    />
    <StatCard
      delta={formatPercent(summary.roiPercent)}
      detail="Gross unrealized return"
      icon={<Sparkles className="h-5 w-5" />}
      label="Unrealized PnL"
      tone={summary.unrealizedPnL >= 0 ? 'positive' : 'negative'}
      value={formatCurrency(summary.unrealizedPnL)}
    />
    <StatCard
      detail={bestPerformer ? `${bestPerformer.assetId.replace('-USD', '')} best performer` : 'Awaiting holdings'}
      icon={<Gauge className="h-5 w-5" />}
      label="Break-even value"
      tone="neutral"
      value={formatCurrency(summary.breakEvenValue)}
    />
    <StatCard
      detail={
        worstPerformer
          ? `${worstPerformer.assetId.replace('-USD', '')} needs ${formatPrice(worstPerformer.breakEvenPrice)}`
          : 'Add positions to benchmark risk'
      }
      icon={<ShieldCheck className="h-5 w-5" />}
      label="Modeled fee impact"
      tone="neutral"
      value={formatCurrency(summary.totalFeesPaid)}
    />
  </div>
);

