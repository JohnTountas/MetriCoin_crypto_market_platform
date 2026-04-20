import { zodResolver } from '@hookform/resolvers/zod';
import { BellRing, RotateCcw, Trash2 } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useAppStore } from '@/app';
import { useMarketStore } from '@/entities/market';
import {
  calculatePriceTriggerSummary,
  getPriceTriggerMetrics,
  priceAlertFormSchema,
  type PriceAlertFormValues,
  sortPriceAlerts,
  usePortfolioStore,
} from '@/entities/portfolio';
import {
  AssetIcon,
  AssetSelect,
  Badge,
  Button,
  Card,
  classNames,
  formatPrice,
  formatTimestamp,
  Input,
  SectionHeading,
  Select,
} from '@/shared';
import { DEFAULT_ASSET_ID, getFallbackAssetMeta } from '@/shared/constants';

type AlertsPanelProps = {
  assetId?: string;
};

const getSuggestedTargetPrice = (
  assetId: string,
  direction: 'above' | 'below',
  snapshots: Record<string, { price: number }>,
) => {
  const livePrice = snapshots[assetId]?.price;

  if (!livePrice) {
    return assetId === DEFAULT_ASSET_ID ? 90_000 : 100;
  }

  const multiplier = direction === 'above' ? 1.05 : 0.95;
  const precision = livePrice < 1 ? 4 : 2;

  return Number((livePrice * multiplier).toFixed(precision));
};

const buildPriceAlertDefaults = (
  assetId: string,
  snapshots: Record<string, { price: number }>,
  direction: 'above' | 'below' = 'above',
): PriceAlertFormValues => ({
  assetId,
  direction,
  targetPrice: getSuggestedTargetPrice(assetId, direction, snapshots),
  label: '',
});

const formatDistancePercent = (value?: number) => {
  if (value === undefined) {
    return 'Awaiting live price';
  }

  return `${value.toFixed(Math.abs(value) >= 10 ? 1 : 2)}% away`;
};

export const AlertsPanel = ({ assetId }: AlertsPanelProps) => {
  const alerts = usePortfolioStore((state) => state.alerts);
  const addAlert = usePortfolioStore((state) => state.addAlert);
  const deleteAlert = usePortfolioStore((state) => state.deleteAlert);
  const rearmStoredAlert = usePortfolioStore((state) => state.rearmAlert);
  const assets = useMarketStore((state) => state.assets);
  const assetLookup = useMarketStore((state) => state.assetLookup);
  const snapshots = useMarketStore((state) => state.snapshots);
  const pushToast = useAppStore((state) => state.pushToast);
  const initialAssetId = assetId ?? DEFAULT_ASSET_ID;

  const form = useForm<PriceAlertFormValues>({
    resolver: zodResolver(priceAlertFormSchema),
    defaultValues: buildPriceAlertDefaults(initialAssetId, snapshots),
  });

  const filteredAlerts = sortPriceAlerts(alerts, snapshots);
  const triggerSummary = calculatePriceTriggerSummary(
    filteredAlerts,
    snapshots,
  );
  const triggeredAlerts = filteredAlerts.filter((alert) => alert.triggered);
  const selectedFormAssetId = form.watch('assetId');
  const selectedDirection = form.watch('direction');
  const watchedTargetPrice = Number(form.watch('targetPrice') ?? 0);
  const selectedTargetPrice = Number.isFinite(watchedTargetPrice)
    ? watchedTargetPrice
    : 0;
  const { errors } = form.formState;
  const selectedAsset =
    assetLookup[selectedFormAssetId] ??
    getFallbackAssetMeta(selectedFormAssetId);
  const selectedSnapshot = snapshots[selectedFormAssetId];
  const selectedTriggerMetrics = getPriceTriggerMetrics(
    {
      id: 'draft-trigger',
      assetId: selectedFormAssetId,
      direction: selectedDirection,
      targetPrice: selectedTargetPrice,
      label: undefined,
      triggered: false,
      createdAt: new Date().toISOString(),
    },
    selectedSnapshot,
  );
  const resetTriggerForm = useCallback(
    (nextAssetId: string, nextDirection: 'above' | 'below') => {
      form.reset(
        buildPriceAlertDefaults(
          nextAssetId,
          useMarketStore.getState().snapshots,
          nextDirection,
        ),
      );
    },
    [form],
  );

  useEffect(() => {
    resetTriggerForm(initialAssetId, 'above');
  }, [initialAssetId, resetTriggerForm]);

  return (
    <Card className="surface p-5">
      <SectionHeading
        action={
          triggeredAlerts.length > 0 ? (
            <Button
              onClick={() => {
                triggeredAlerts.forEach((alert) => rearmStoredAlert(alert.id));
                pushToast({
                  tone: 'info',
                  title: 'Triggers re-armed',
                  description: `Reactivated ${triggeredAlerts.length} trigger${triggeredAlerts.length === 1 ? '' : 's'}.`,
                });
              }}
              size="sm"
              variant="secondary"
            >
              <RotateCcw className="h-4 w-4" />
              Re-arm triggered
            </Button>
          ) : null
        }
        eyebrow="Triggers"
        title="Price triggers"
        description="Create clean above or below price rules and let the live market stream notify you when levels break."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="surface-subtle rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
            Live
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
            {triggerSummary.liveTriggers}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Active levels waiting on the stream
          </p>
        </div>
        <div className="surface-subtle rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
            Triggered
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
            {triggerSummary.triggeredCount}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Ready to review or re-arm
          </p>
        </div>
        <div className="surface-subtle rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
            Coverage
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
            {triggerSummary.coveredAssetCount}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Assets with active trigger coverage
          </p>
        </div>
        <div className="surface-subtle rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
            Nearest live
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {triggerSummary.nearestLiveTrigger
              ? formatPrice(triggerSummary.nearestLiveTrigger.targetPrice)
              : '--'}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {triggerSummary.nearestLiveTrigger
              ? `${getFallbackAssetMeta(triggerSummary.nearestLiveTrigger.assetId).symbol} ${formatDistancePercent(triggerSummary.nearestLiveTriggerDistancePercent)}`
              : 'No live triggers configured'}
          </p>
        </div>
      </div>

      <form
        className="mt-6 grid gap-4 md:grid-cols-2"
        onSubmit={form.handleSubmit((values) => {
          const trimmedLabel = values.label?.trim();
          const normalizedLabel =
            trimmedLabel === '' ? undefined : trimmedLabel;
          const asset =
            assetLookup[values.assetId] ?? getFallbackAssetMeta(values.assetId);

          addAlert({
            ...values,
            label: normalizedLabel,
          });
          pushToast({
            tone: 'success',
            title: 'Trigger created',
            description: `${asset.symbol} will notify when price moves ${values.direction} ${formatPrice(values.targetPrice)}.`,
          });
          resetTriggerForm(values.assetId, values.direction);
        })}
      >
        <input type="hidden" {...form.register('assetId')} />
        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Asset
          <AssetSelect
            ariaLabel="Alert asset selector"
            assets={assets}
            onChange={(nextAssetId) =>
              form.setValue('assetId', nextAssetId, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            value={selectedFormAssetId}
          />
          <p className="text-xs text-[var(--text-faint)]">
            Choose the market you want to monitor.
          </p>
          {errors.assetId?.message ? (
            <p className="text-xs text-stone-600">{errors.assetId.message}</p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Direction
          <Select {...form.register('direction')}>
            <option value="above">Crosses above</option>
            <option value="below">Crosses below</option>
          </Select>
          {errors.direction?.message ? (
            <p className="text-xs text-stone-600">{errors.direction.message}</p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Trigger price
          <Input step="0.01" type="number" {...form.register('targetPrice')} />
          <p className="text-xs text-[var(--text-faint)]">
            {selectedSnapshot
              ? `Live spot ${formatPrice(selectedSnapshot.price)}`
              : 'Waiting for live market data'}
          </p>
          {errors.targetPrice?.message ? (
            <p className="text-xs text-stone-600">
              {errors.targetPrice.message}
            </p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Label
          <Input
            maxLength={80}
            placeholder="Breakout, hedge zone, profit target..."
            {...form.register('label')}
          />
          <p className="text-xs text-[var(--text-faint)]">
            Internal note for quick context
          </p>
          {errors.label?.message ? (
            <p className="text-stone-600] text-xs">{errors.label.message}</p>
          ) : null}
        </label>

        <div className="surface-subtle grid gap-4 rounded-2xl p-5 sm:grid-cols-2 md:col-span-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
              Selected market
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
              {selectedAsset.name}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {selectedAsset.symbol} / USD
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
              Distance to trigger
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
              {formatDistancePercent(selectedTriggerMetrics.distancePercent)}
            </p>
            <p className="mt-1 text-sm text-stone-600">
              {selectedTriggerMetrics.currentPrice
                ? `${formatPrice(selectedTargetPrice)} vs ${formatPrice(selectedTriggerMetrics.currentPrice)}`
                : 'Will update once a live quote arrives'}
            </p>
          </div>
        </div>

        <div className="gap-15 flex gap-20 md:col-span-2">
          <Button
            className="transform-gpu hover:scale-[1.06] hover:shadow-[var(--shadow-floating)]"
            type="submit"
          >
            Create trigger
          </Button>
          <Button
            className="transform-gpu hover:scale-[1.06] hover:shadow-[var(--shadow-floating)]"
            onClick={() =>
              resetTriggerForm(selectedFormAssetId, selectedDirection)
            }
            type="button"
            variant="secondary"
          >
            Clear Fields
          </Button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="surface-subtle rounded-2xl p-5">
            <p className="font-semibold text-[var(--text-primary)]">
              No triggers yet
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Create a simple above or below level and Metricoin will monitor it
              against the live market stream.
            </p>
          </div>
        ) : null}

        {filteredAlerts.map((alert) => {
          const asset =
            assetLookup[alert.assetId] ?? getFallbackAssetMeta(alert.assetId);
          const metrics = getPriceTriggerMetrics(
            alert,
            snapshots[alert.assetId],
          );
          const statusTimestamp = alert.triggeredAt ?? alert.createdAt;

          return (
            <div
              className={classNames(
                'surface-subtle flex flex-col gap-4 rounded-2xl p-4',
                alert.triggered &&
                  'border-[var(--positive-border)] bg-[var(--positive-bg)]',
              )}
              key={alert.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AssetIcon asset={asset} size="md" />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={classNames(
                          'font-semibold',
                          alert.triggered
                            ? 'text-[var(--positive-text)]'
                            : 'text-[var(--text-primary)]',
                        )}
                      >
                        {asset.name}{' '}
                        {alert.direction === 'above' ? 'above' : 'below'}{' '}
                        {formatPrice(alert.targetPrice)}
                      </p>
                      <Badge tone={alert.triggered ? 'positive' : 'default'}>
                        {alert.triggered ? 'Triggered' : 'Live'}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">
                      {alert.label ?? 'Custom price trigger'}
                    </p>
                  </div>
                </div>
                {!alert.triggered ? (
                  <div className="tone-accent flex h-10 w-10 items-center justify-center rounded-2xl border">
                    <BellRing className="h-4.5 w-4.5" />
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Spot
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                    {metrics.currentPrice
                      ? formatPrice(metrics.currentPrice)
                      : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Distance
                  </p>
                  <p
                    className={classNames(
                      'mt-1 text-sm font-semibold',
                      alert.triggered
                        ? 'text-[var(--positive-text)]'
                        : 'text-[var(--text-primary)]',
                    )}
                  >
                    {alert.triggered
                      ? 'Level hit'
                      : formatDistancePercent(metrics.distancePercent)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Status time
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                    {formatTimestamp(statusTimestamp, true)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {alert.triggered ? 'Triggered' : 'Created'}{' '}
                    {formatTimestamp(statusTimestamp)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {alert.triggered ? (
                  <Button
                    onClick={() => {
                      rearmStoredAlert(alert.id);
                      pushToast({
                        tone: 'info',
                        title: 'Trigger re-armed',
                        description: `${asset.symbol} trigger is live again at ${formatPrice(alert.targetPrice)}.`,
                      });
                    }}
                    size="sm"
                    variant="secondary"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Re-arm
                  </Button>
                ) : null}
                <Button
                  onClick={() => {
                    deleteAlert(alert.id);
                    pushToast({
                      tone: 'warning',
                      title: 'Trigger deleted',
                      description: `${asset.symbol} ${alert.direction} ${formatPrice(alert.targetPrice)} was removed.`,
                    });
                  }}
                  size="sm"
                  variant="danger"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
