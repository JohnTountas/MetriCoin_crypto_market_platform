// PortfolioPositionsGrid shows the main visual summary of open holdings and their live performance.
// It stays presentational so portfolio math can keep living in the model layer.
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';

import { useMarketStore } from '@/entities/market';
import {
  AssetIcon,
  Card,
  classNames,
  EmptyState,
  formatCurrency,
  formatPercent,
  formatPrice,
  formatQuantity,
  getFallbackAssetMeta,
  type PositionMetrics,
  SectionHeading,
} from '@/shared';

type PortfolioPositionsGridProps = {
  positions: PositionMetrics[];
};

/**
 * PortfolioPositionsGrid turns calculated position metrics into scan-friendly cards.
 * It stays presentational so position math can keep evolving in the model layer.
 */
export const PortfolioPositionsGrid = ({
  positions,
}: PortfolioPositionsGridProps) => {
  const assetLookup = useMarketStore((state) => state.assetLookup);

  if (positions.length === 0) {
    return (
      <EmptyState
        title="Portfolio is ready for its first position"
        description="Add a transaction to unlock live cost-basis tracking, break-even analysis, allocation visuals, and PnL monitoring."
      />
    );
  }

  return (
    <Card className="surface p-4 sm:p-5">
      <SectionHeading
        eyebrow="Exposure"
        title="Open positions"
        description="Real-time position cards driven by live prices, average cost, and fee-aware break-even levels."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {positions.map((position) => {
          const positive = position.unrealizedPnL >= 0;
          const asset =
            assetLookup[position.assetId] ??
            getFallbackAssetMeta(position.assetId);

          return (
            <div
              className="surface-subtle rounded-[1.75rem] p-5"
              key={position.assetId}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AssetIcon asset={asset} size="md" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                      {asset.symbol}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
                      {asset.name}
                    </h3>
                  </div>
                </div>
                <div className="surface-subtle flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--text-primary)]">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 text-sm xs:grid-cols-2">
                <div>
                  <p className="text-[var(--text-faint)]">Current value</p>
                  <p className="mt-1 font-semibold text-[var(--text-primary)]">
                    {formatCurrency(position.currentValue)}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--text-faint)]">Position size</p>
                  <p className="mt-1 font-semibold text-[var(--text-primary)]">
                    {formatQuantity(position.assetId, position.quantity)}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--text-faint)]">Average cost</p>
                  <p className="mt-1 font-semibold text-[var(--text-primary)]">
                    {formatPrice(position.averageCost)}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--text-faint)]">Break-even</p>
                  <p className="mt-1 font-semibold text-[var(--text-primary)]">
                    {formatPrice(position.breakEvenPrice)}
                  </p>
                </div>
              </div>

              <div
                className={classNames(
                  'mt-5 flex flex-col gap-3 rounded-2xl border px-4 py-3 xs:flex-row xs:items-center xs:justify-between',
                  positive ? 'tone-positive' : 'tone-negative',
                )}
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.22em]">
                    Unrealized PnL
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {formatCurrency(position.unrealizedPnL)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="inline-flex items-center gap-1 text-sm font-medium">
                    {positive ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {formatPercent(position.roiPercent)}
                  </p>
                  <p className="mt-1 text-sm opacity-80">
                    {position.allocationPercent.toFixed(1)}% allocation
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
