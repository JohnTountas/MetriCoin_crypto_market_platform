// Price trigger helpers turn raw alerts plus snapshots into sortable, UI-friendly insights.
// The watchlist and dashboard both rely on these derived rules staying predictable.
import type { MarketSnapshot, PriceAlert } from '@/shared/types';

export type PriceTriggerMetrics = {
  currentPrice?: number;
  crossed: boolean;
  distanceValue?: number;
  distancePercent?: number;
};

export type PriceTriggerSummary = {
  totalTriggers: number;
  liveTriggers: number;
  triggeredCount: number;
  coveredAssetCount: number;
  nearestLiveTrigger?: PriceAlert;
  nearestLiveTriggerDistancePercent?: number;
};

export const getPriceTriggerMetrics = (
  alert: PriceAlert,
  snapshot?: MarketSnapshot,
): PriceTriggerMetrics => {
  const currentPrice = snapshot?.price;

  if (!currentPrice) {
    return {
      currentPrice: undefined,
      crossed: false,
      distanceValue: undefined,
      distancePercent: undefined,
    };
  }

  const crossed =
    alert.direction === 'above'
      ? currentPrice >= alert.targetPrice
      : currentPrice <= alert.targetPrice;
  const distanceValue = Math.abs(alert.targetPrice - currentPrice);
  const distancePercent =
    currentPrice === 0 ? 0 : Math.abs(((alert.targetPrice - currentPrice) / currentPrice) * 100);

  return {
    currentPrice,
    crossed,
    distanceValue,
    distancePercent,
  };
};

const compareAlertsByTimestampDesc = (left: PriceAlert, right: PriceAlert) =>
  new Date(right.triggeredAt ?? right.createdAt).getTime() -
  new Date(left.triggeredAt ?? left.createdAt).getTime();

export const sortPriceAlerts = (
  alerts: PriceAlert[],
  snapshots: Record<string, MarketSnapshot>,
) =>
  [...alerts].sort((left, right) => {
    if (left.triggered !== right.triggered) {
      return left.triggered ? 1 : -1;
    }

    if (!left.triggered && !right.triggered) {
      const leftDistance =
        getPriceTriggerMetrics(left, snapshots[left.assetId]).distancePercent ?? Number.POSITIVE_INFINITY;
      const rightDistance =
        getPriceTriggerMetrics(right, snapshots[right.assetId]).distancePercent ?? Number.POSITIVE_INFINITY;

      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }
    }

    return compareAlertsByTimestampDesc(left, right);
  });

export const calculatePriceTriggerSummary = (
  alerts: PriceAlert[],
  snapshots: Record<string, MarketSnapshot>,
): PriceTriggerSummary => {
  const liveTriggers = alerts.filter((alert) => !alert.triggered);
  const nearestLiveTrigger = sortPriceAlerts(liveTriggers, snapshots)[0];

  return {
    totalTriggers: alerts.length,
    liveTriggers: liveTriggers.length,
    triggeredCount: alerts.filter((alert) => alert.triggered).length,
    coveredAssetCount: new Set(alerts.map((alert) => alert.assetId)).size,
    nearestLiveTrigger,
    nearestLiveTriggerDistancePercent: nearestLiveTrigger
      ? getPriceTriggerMetrics(
          nearestLiveTrigger,
          snapshots[nearestLiveTrigger.assetId],
        ).distancePercent
      : undefined,
  };
};
