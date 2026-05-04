// SectionHeading standardizes the title, eyebrow, and optional action pattern used across panels.
// Keeping headings consistent makes larger pages easier to scan and reorganize.
import type { ReactNode } from 'react';

import { classNames } from '@/shared/utils';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

/**
 * SectionHeading keeps titles, helper copy, and panel-level actions aligned across the product.
 * It gives actions a full row on narrow screens so buttons do not compete with the text block.
 */
export const SectionHeading = ({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeadingProps) => (
  <div
    className={classNames(
      'flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between',
      className,
    )}
  >
    <div className="space-y-2">
      {eyebrow ? (
        <p className="eyebrow text-xs font-semibold uppercase tracking-[0.3em]">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
    </div>
    {action ? <div className="w-full lg:w-auto">{action}</div> : null}
  </div>
);
