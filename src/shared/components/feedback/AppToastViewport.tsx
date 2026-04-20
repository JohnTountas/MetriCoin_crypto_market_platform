import { AlertCircle, Bell, CheckCircle2, TriangleAlert } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { useAppStore } from '@/app';
import { Button, Card } from '@/shared/components/ui';
import { classNames } from '@/shared/utils';

const toastToneIconMap = {
  info: Bell,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
};

const toastToneStyleMap = {
  info: 'tone-accent',
  success: 'tone-positive',
  warning: 'tone-warning',
  error: 'tone-negative',
};

export const AppToastViewport = () => {
  const toasts = useAppStore((state) => state.toasts);
  const dismissToast = useAppStore((state) => state.dismissToast);
  const scheduledToastIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    toasts.forEach((toast) => {
      if (scheduledToastIdsRef.current.has(toast.id)) return;
      scheduledToastIdsRef.current.add(toast.id);
      window.setTimeout(() => {
        dismissToast(toast.id);
        scheduledToastIdsRef.current.delete(toast.id);
      }, 4200);
    });
  }, [dismissToast, toasts]);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[min(92vw,380px)] flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = toastToneIconMap[toast.tone];
        return (
          <Card
            className="surface pointer-events-auto animate-slide-up p-4"
            key={toast.id}
          >
            <div className="flex gap-3">
              <div
                className={classNames(
                  'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border',
                  toastToneStyleMap[toast.tone],
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">{toast.title}</h4>
                    {toast.description ? (
                      <p className="text-sm leading-6 text-[var(--text-muted)]">{toast.description}</p>
                    ) : null}
                  </div>
                  <Button
                    className="h-8 px-2 text-[var(--text-muted)]"
                    onClick={() => dismissToast(toast.id)}
                    size="sm"
                    variant="ghost"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};


