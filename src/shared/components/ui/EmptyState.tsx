import type { ReactNode } from 'react';

import { Card } from '@/shared/components/ui/Card';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <Card className="surface-subtle border-dashed border-[var(--border-strong)] p-8 text-center">
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4">
      <div className="tone-accent flex h-16 w-16 items-center justify-center rounded-full border">
        BTC
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-2xl font-semibold text-[var(--text-primary)]">{title}</h3>
        <p className="text-sm leading-6 text-[var(--text-muted)]">{description}</p>
      </div>
      {action}
    </div>
  </Card>
);
