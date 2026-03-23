import { AlertCircle, Bell, CheckCircle2, TriangleAlert } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { useAppStore } from '@/app/appStore';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { cn } from '@/shared/lib/cn';

const iconMap = {
  info: Bell,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
};

const toneMap = {
  info: 'border-cyan-300/20 bg-cyan-400/10 text-cyan-100',
  success: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100',
  warning: 'border-amber-300/20 bg-amber-400/10 text-amber-100',
  error: 'border-rose-300/20 bg-rose-400/10 text-rose-100',
};

export const ToastViewport = () => {
  const toasts = useAppStore((state) => state.toasts);
  const dismissToast = useAppStore((state) => state.dismissToast);
  const scheduledRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    toasts.forEach((toast) => {
      if (scheduledRef.current.has(toast.id)) return;
      scheduledRef.current.add(toast.id);
      window.setTimeout(() => {
        dismissToast(toast.id);
        scheduledRef.current.delete(toast.id);
      }, 4200);
    });
  }, [dismissToast, toasts]);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[min(92vw,380px)] flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.tone];
        return (
          <Card
            className="surface pointer-events-auto animate-slide-up p-4"
            key={toast.id}
          >
            <div className="flex gap-3">
              <div
                className={cn(
                  'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border',
                  toneMap[toast.tone],
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
                    {toast.description ? (
                      <p className="text-sm leading-6 text-slate-400">{toast.description}</p>
                    ) : null}
                  </div>
                  <Button
                    className="h-8 px-2 text-slate-400"
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

