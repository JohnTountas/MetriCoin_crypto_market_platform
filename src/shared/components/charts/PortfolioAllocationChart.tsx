import { useMarketStore } from '@/entities/market';
import { getAssetChartGradient, getFallbackAssetMeta } from '@/shared/constants';
import { formatCurrency } from '@/shared/utils';
import { AssetIcon } from '@/shared/components/ui';
import type { PositionMetrics } from '@/shared/types';

type PortfolioAllocationChartProps = {
  positions: PositionMetrics[];
  size?: number;
};

export const PortfolioAllocationChart = ({ positions, size = 240 }: PortfolioAllocationChartProps) => {
  const assetLookup = useMarketStore((state) => state.assetLookup);
  const radius = size / 2 - 18;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
      <div
        className="relative"
        style={{ height: size, width: size }}
      >
        <svg
          className="-rotate-90"
          height={size}
          width={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            r={radius}
            stroke="var(--border)"
            strokeWidth="18"
          />
          {positions.map((position) => {
            const strokeDasharray = `${(position.allocationPercent / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -cumulative;
            cumulative += (position.allocationPercent / 100) * circumference;

            return (
              <circle
                className="transition-all duration-500"
                cx={size / 2}
                cy={size / 2}
                fill="transparent"
                key={position.assetId}
                r={radius}
                stroke={`url(#${position.assetId})`}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="18"
              />
            );
          })}
          <defs>
            {positions.map((position) => {
              const asset = assetLookup[position.assetId] ?? getFallbackAssetMeta(position.assetId);
              const { startColor, endColor } = getAssetChartGradient(asset.symbol);

              return (
                <linearGradient
                  id={position.assetId}
                  key={position.assetId}
                  x1="0%"
                  x2="100%"
                  y1="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor={startColor}
                  />
                  <stop
                    offset="100%"
                    stopColor={endColor}
                  />
                </linearGradient>
              );
            })}
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-faint)]">Allocation</p>
          <p className="mt-2 font-display text-3xl font-semibold text-[var(--text-primary)]">
            {positions.length}
          </p>
          <p className="text-sm text-[var(--text-muted)]">Active exposures</p>
        </div>
      </div>

      <div className="w-full space-y-3">
        {positions.map((position) => (
          <div
            className="surface-subtle flex items-center justify-between rounded-2xl px-4 py-3"
            key={position.assetId}
          >
            <div className="flex items-center gap-3">
              <AssetIcon
                asset={assetLookup[position.assetId] ?? getFallbackAssetMeta(position.assetId)}
                size="sm"
              />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {(assetLookup[position.assetId] ?? getFallbackAssetMeta(position.assetId)).name}
                </p>
                <p className="text-sm text-[var(--text-muted)]">{position.allocationPercent.toFixed(1)}% of portfolio</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(position.currentValue)}</p>
              <p className="text-sm text-[var(--text-muted)]">{position.quantity.toFixed(4)} units</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


