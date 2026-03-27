import type { ReactNode } from 'react';

import { classNames } from '@/shared/utils';

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
  <div className={classNames('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
    <div className="space-y-2">
      {eyebrow ? (
        <p className="eyebrow text-xs font-semibold uppercase tracking-[0.3em]">{eyebrow}</p>
      ) : null}
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">{title}</h2>
        {description ? <p className="max-w-2xl text-sm leading-6 text-[var(--text-muted)]">{description}</p> : null}
      </div>
    </div>
    {action}
  </div>
);

