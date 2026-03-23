import { ASSET_LOOKUP } from '@/shared/constants/assets';
import { formatLocalDateTime, formatShortTime } from '@/shared/lib/date';

export const formatCurrency = (value: number, compact = false) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    minimumFractionDigits: value >= 1_000 ? 0 : 2,
    maximumFractionDigits: value >= 1_000 ? 0 : 2,
  }).format(value);

export const formatSignedCurrency = (value: number) => {
  const formatted = formatCurrency(Math.abs(value));
  if (value === 0) return formatted;

  return `${value > 0 ? '+' : '-'}${formatted}`;
};

export const formatPercent = (value: number) =>
  `${value > 0 ? '+' : ''}${value.toFixed(Math.abs(value) >= 10 ? 1 : 2)}%`;

export const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);

export const formatQuantity = (assetId: string, value: number) => {
  const precision = ASSET_LOOKUP[assetId]?.quantityPrecision ?? 4;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  }).format(value);
};

export const formatTimestamp = (value: string | number, concise = false) =>
  concise ? formatShortTime(value) : formatLocalDateTime(value);

