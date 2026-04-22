// Asset id helpers normalize route params and loosely formatted symbols into known product ids.
// This keeps navigation resilient when links come from user data instead of the market catalog.
import { DEFAULT_ASSET_ID } from '@/shared/constants';
import type { AssetMeta, MarketSnapshot, PortfolioTransaction, PriceAlert } from '@/shared/types';

const buildAssetIdCandidates = (requestedAssetId: string) => {
  const trimmedAssetId = requestedAssetId.trim();
  const upperAssetId = trimmedAssetId.toUpperCase();
  const normalizedSlashAssetId = upperAssetId.replace('/', '-');
  const normalizedUsdAssetId = normalizedSlashAssetId.endsWith('-USD')
    ? normalizedSlashAssetId
    : `${normalizedSlashAssetId}-USD`;

  return Array.from(
    new Set([
      trimmedAssetId,
      upperAssetId,
      normalizedSlashAssetId,
      normalizedUsdAssetId,
    ].filter(Boolean)),
  );
};

export const resolveAssetDetailsAssetId = ({
  requestedAssetId,
  assetLookup,
  transactions,
  alerts,
  snapshots = {},
}: {
  requestedAssetId?: string;
  assetLookup: Record<string, AssetMeta>;
  transactions: PortfolioTransaction[];
  alerts: PriceAlert[];
  snapshots?: Record<string, MarketSnapshot>;
}) => {
  if (!requestedAssetId?.trim()) {
    return DEFAULT_ASSET_ID;
  }

  const availableAssetIds = new Set<string>([
    ...Object.keys(assetLookup),
    ...transactions.map((transaction) => transaction.assetId),
    ...alerts.map((alert) => alert.assetId),
    ...Object.keys(snapshots),
  ]);

  const matchedAssetId = buildAssetIdCandidates(requestedAssetId).find((assetId) =>
    availableAssetIds.has(assetId),
  );

  return matchedAssetId ?? DEFAULT_ASSET_ID;
};
