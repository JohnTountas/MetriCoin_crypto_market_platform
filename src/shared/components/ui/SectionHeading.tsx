import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeadingProps) => (
  <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
    <div className="space-y-2">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/70">{eyebrow}</p>
      ) : null}
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-semibold text-white">{title}</h2>
        {description ? <p className="max-w-2xl text-sm leading-6 text-slate-400">{description}</p> : null}
      </div>
    </div>
    {action}
  </div>
);

