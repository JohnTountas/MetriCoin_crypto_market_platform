import { ASSET_LOOKUP } from '@/shared/constants';
import { formatCurrency } from '@/shared/lib';
import type { PositionMetrics } from '@/shared/types';

type AllocationDonutProps = {
  positions: PositionMetrics[];
  size?: number;
};

export const AllocationDonut = ({ positions, size = 240 }: AllocationDonutProps) => {
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
            stroke="rgba(255,255,255,0.08)"
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
            {positions.map((position) => (
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
                  stopColor={position.assetId === 'BTC-USD' ? '#f59e0b' : '#67e8f9'}
                />
                <stop
                  offset="100%"
                  stopColor={position.assetId === 'ETH-USD' ? '#818cf8' : '#22d3ee'}
                />
              </linearGradient>
            ))}
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Allocation</p>
          <p className="mt-2 font-display text-3xl font-semibold text-white">
            {positions.length}
          </p>
          <p className="text-sm text-slate-400">Active exposures</p>
        </div>
      </div>

      <div className="w-full space-y-3">
        {positions.map((position) => (
          <div
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            key={position.assetId}
          >
            <div>
              <p className="text-sm font-semibold text-white">{ASSET_LOOKUP[position.assetId]?.name}</p>
              <p className="text-sm text-slate-400">{position.allocationPercent.toFixed(1)}% of portfolio</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{formatCurrency(position.currentValue)}</p>
              <p className="text-sm text-slate-400">{position.quantity.toFixed(4)} units</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
