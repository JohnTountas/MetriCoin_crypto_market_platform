import { zodResolver } from '@hookform/resolvers/zod';
import { BellRing, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useMarketStore } from '@/entities/market';
import { priceAlertFormSchema, type PriceAlertFormValues, usePortfolioStore } from '@/entities/portfolio';
import { DEFAULT_ASSET_ID, getFallbackAssetMeta } from '@/shared/constants';
import {
  AssetIcon,
  AssetSelect,
  Badge,
  Button,
  Card,
  formatPrice,
  formatTimestamp,
  Input,
  SectionHeading,
  Select,
} from '@/shared';

type AlertsPanelProps = {
  assetId?: string;
};

const buildPriceAlertDefaults = (initialAssetId: string): PriceAlertFormValues => ({
  assetId: initialAssetId,
  direction: 'above',
  targetPrice: 90_000,
  label: '',
});

export const AlertsPanel = ({ assetId }: AlertsPanelProps) => {
  const alerts = usePortfolioStore((state) => state.alerts);
  const addAlert = usePortfolioStore((state) => state.addAlert);
  const deleteAlert = usePortfolioStore((state) => state.deleteAlert);
  const assets = useMarketStore((state) => state.assets);
  const assetLookup = useMarketStore((state) => state.assetLookup);
  const initialAssetId = assetId ?? DEFAULT_ASSET_ID;

  const form = useForm<PriceAlertFormValues>({
    resolver: zodResolver(priceAlertFormSchema),
    defaultValues: buildPriceAlertDefaults(initialAssetId),
  });

  const filteredAlerts = alerts.filter((alert) => !assetId || alert.assetId === assetId);
  const selectedFormAssetId = form.watch('assetId');

  useEffect(() => {
    form.reset(buildPriceAlertDefaults(initialAssetId));
  }, [form, initialAssetId]);

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
            ...buildPriceAlertDefaults(assetId ?? values.assetId),
            direction: values.direction,
            targetPrice: values.targetPrice,
          });
        })}
      >
        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Asset
          <AssetSelect
            assets={assets}
            onChange={(nextAssetId) =>
              form.setValue('assetId', nextAssetId, {
                shouldDirty: true,
                shouldValidate: true,
              })}
            value={selectedFormAssetId}
          />
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Direction
          <Select {...form.register('direction')}>
            <option value="above">Crosses above</option>
            <option value="below">Crosses below</option>
          </Select>
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Trigger price
          <Input
            step="0.01"
            type="number"
            {...form.register('targetPrice')}
          />
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
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
        {filteredAlerts.map((alert) => {
          const asset = assetLookup[alert.assetId] ?? assets[0];

          return (
            <div
              className="surface-subtle flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
              key={alert.id}
            >
              <div className="flex items-start gap-3">
                {asset ? (
                  <AssetIcon
                    asset={asset}
                    size="md"
                  />
                ) : (
                  <div className="tone-accent mt-1 flex h-10 w-10 items-center justify-center rounded-2xl border">
                    <BellRing className="h-4.5 w-4.5" />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[var(--text-primary)]">
                      {(asset?.name ?? getFallbackAssetMeta(alert.assetId).name)} {alert.direction} {formatPrice(alert.targetPrice)}
                    </p>
                    <Badge tone={alert.triggered ? 'positive' : 'default'}>
                      {alert.triggered ? 'Triggered' : 'Live'}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{alert.label ?? 'Custom alert rule'}</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-faint)]">
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
          );
        })}
      </div>
    </Card>
  );
};
