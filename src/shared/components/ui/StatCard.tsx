import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card } from '@/shared/components/ui/Card';
import { cn } from '@/shared/lib/cn';

type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  tone?: 'neutral' | 'positive' | 'negative';
  detail?: string;
  icon?: ReactNode;
  className?: string;
};

export const StatCard = ({
  label,
  value,
  delta,
  tone = 'neutral',
  detail,
  icon,
  className,
}: StatCardProps) => (
  <Card className={cn('surface p-5', className)}>
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <h3 className="text-2xl font-semibold tracking-tight text-white">{value}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {delta ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium',
                tone === 'positive' && 'bg-emerald-400/10 text-emerald-200',
                tone === 'negative' && 'bg-rose-400/10 text-rose-200',
                tone === 'neutral' && 'bg-white/5 text-slate-300',
              )}
            >
              {tone === 'positive' ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
              {tone === 'negative' ? <ArrowDownRight className="h-3.5 w-3.5" /> : null}
              {delta}
            </span>
          ) : null}
          {detail ? <span className="text-slate-500">{detail}</span> : null}
        </div>
      </div>
      {icon ? (
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100">
          {icon}
        </div>
      ) : null}
    </div>
  </Card>
);

