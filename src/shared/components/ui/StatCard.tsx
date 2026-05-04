// StatCard is the reusable summary block for KPIs across dashboard and portfolio views.
// Centralizing it keeps metric emphasis and spacing consistent as new stats are added.
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card } from '@/shared/components/ui/Card';
import { classNames } from '@/shared/utils';

type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  tone?: 'neutral' | 'positive' | 'negative';
  detail?: string;
  icon?: ReactNode;
  className?: string;
};

/**
 * StatCard packages one KPI, its supporting detail, and an optional tone marker into a reusable block.
 * The card keeps copy wrapping predictable so four-up metric rows still behave on narrower screens.
 */
export const StatCard = ({
  label,
  value,
  delta,
  tone = 'neutral',
  detail,
  icon,
  className,
}: StatCardProps) => (
  <Card className={classNames('surface p-4 sm:p-5', className)}>
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
            {label}
          </p>
          <h3 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {value}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {delta ? (
            <span
              className={classNames(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium',
                tone === 'positive' && 'tone-positive',
                tone === 'negative' && 'tone-negative',
                tone === 'neutral' && 'tone-default',
              )}
            >
              {tone === 'positive' ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : null}
              {tone === 'negative' ? (
                <ArrowDownRight className="h-3.5 w-3.5" />
              ) : null}
              {delta}
            </span>
          ) : null}
          {detail ? (
            <span className="text-[var(--text-faint)]">{detail}</span>
          ) : null}
        </div>
      </div>
      {icon ? (
        <div className="surface-subtle flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--text-primary)]">
          {icon}
        </div>
      ) : null}
    </div>
  </Card>
);
