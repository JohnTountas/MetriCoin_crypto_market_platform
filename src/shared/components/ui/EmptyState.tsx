import type { ReactNode } from 'react';

import { Card } from '@/shared/components/ui/Card';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <Card className="border-dashed border-white/15 bg-slate-900/60 p-8 text-center">
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
        BTC
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-2xl font-semibold text-white">{title}</h3>
        <p className="text-sm leading-6 text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  </Card>
);
