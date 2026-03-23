import { zodResolver } from '@hookform/resolvers/zod';
import { BellRing, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { usePortfolioStore } from '@/entities/portfolio/model/portfolioStore';
import { alertFormSchema, type AlertFormValues } from '@/entities/portfolio/model/schemas';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';
import { SectionHeading } from '@/shared/components/ui/SectionHeading';
import { Select } from '@/shared/components/ui/Select';
import { TRACKED_ASSETS } from '@/shared/constants/assets';
import { formatPrice, formatTimestamp } from '@/shared/lib/formatters';

type AlertsPanelProps = {
  assetId?: string;
};

export const AlertsPanel = ({ assetId }: AlertsPanelProps) => {
  const alerts = usePortfolioStore((state) => state.alerts);
  const addAlert = usePortfolioStore((state) => state.addAlert);
  const deleteAlert = usePortfolioStore((state) => state.deleteAlert);

  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      assetId: assetId ?? 'BTC-USD',
      direction: 'above',
      targetPrice: 90_000,
      label: '',
    },
  });

  const filteredAlerts = alerts.filter((alert) => !assetId || alert.assetId === assetId);

  return (
    <Card className="surface p-5">
      <SectionHeading
        eyebrow="Alerts"
        title="Price triggers"
        description="Create fast alert rules tied to the live websocket stream and receive in-app notifications when levels break."
      />

      <form
        className="mt-6 grid gap-4 md:grid-cols-2"
        onSubmit={form.handleSubmit((values) => {
          addAlert({
            ...values,
            label: values.label ?? undefined,
          });
          form.reset({
            assetId: assetId ?? values.assetId,
            direction: values.direction,
            targetPrice: values.targetPrice,
            label: '',
          });
        })}
      >
        <label className="space-y-2 text-sm text-slate-300">
          Asset
          <Select {...form.register('assetId')}>
            {TRACKED_ASSETS.map((asset) => (
              <option
                key={asset.id}
                value={asset.id}
              >
                {asset.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          Direction
          <Select {...form.register('direction')}>
            <option value="above">Crosses above</option>
            <option value="below">Crosses below</option>
          </Select>
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          Trigger price
          <Input
            step="0.01"
            type="number"
            {...form.register('targetPrice')}
          />
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          Label
          <Input
            placeholder="Breakout, hedge zone, profit target..."
            {...form.register('label')}
          />
        </label>

        <div className="md:col-span-2">
          <Button type="submit">Create alert</Button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between"
            key={alert.id}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
                <BellRing className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-white">
                    {alert.assetId.replace('-USD', '')} {alert.direction} {formatPrice(alert.targetPrice)}
                  </p>
                  <Badge tone={alert.triggered ? 'positive' : 'default'}>
                    {alert.triggered ? 'Triggered' : 'Live'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">{alert.label ?? 'Custom alert rule'}</p>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Added {formatTimestamp(alert.createdAt)}
                </p>
              </div>
            </div>
            <Button
              onClick={() => deleteAlert(alert.id)}
              size="sm"
              variant="danger"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
