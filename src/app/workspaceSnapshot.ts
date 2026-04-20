import { z } from 'zod';

import type {
  CalculatorSettings,
  PortfolioTransaction,
  PriceAlert,
  ThemePreference,
} from '@/shared/types';

const isoTimestampSchema = z
  .string()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Expected a valid ISO timestamp.');

const themePreferenceSchema = z.enum(['dark', 'light', 'system']);

const calculatorSettingsSnapshotSchema = z.object({
  estimatedFeeRate: z.number().min(0).max(5),
  estimatedSlippageRate: z.number().min(0).max(5),
  preferredCurrency: z.literal('USD'),
});

const portfolioTransactionSnapshotSchema = z.object({
  id: z.string().min(1),
  assetId: z.string().min(1),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive(),
  price: z.number().positive(),
  fee: z.number().min(0),
  executedAt: isoTimestampSchema,
  note: z.string().max(160).optional(),
});

const priceAlertSnapshotSchema = z.object({
  id: z.string().min(1),
  assetId: z.string().min(1),
  direction: z.enum(['above', 'below']),
  targetPrice: z.number().positive(),
  label: z.string().max(80).optional(),
  triggered: z.boolean(),
  createdAt: isoTimestampSchema,
  triggeredAt: isoTimestampSchema.optional(),
});

const workspaceSnapshotShape = {
  exportedAt: isoTimestampSchema,
  themePreference: themePreferenceSchema,
  favoriteAssetIds: z.array(z.string().min(1)),
  settings: calculatorSettingsSnapshotSchema,
  transactions: z.array(portfolioTransactionSnapshotSchema),
  alerts: z.array(priceAlertSnapshotSchema),
};

const versionedWorkspaceSnapshotSchema = z.object({
  version: z.literal(1),
  ...workspaceSnapshotShape,
});

const legacyWorkspaceSnapshotSchema = z
  .object({
    exportedAt: workspaceSnapshotShape.exportedAt,
    favoriteAssetIds: workspaceSnapshotShape.favoriteAssetIds,
    settings: workspaceSnapshotShape.settings,
    transactions: workspaceSnapshotShape.transactions,
    alerts: workspaceSnapshotShape.alerts,
    themePreference: workspaceSnapshotShape.themePreference.optional(),
  })
  .transform((snapshot) => ({
    version: 1 as const,
    exportedAt: snapshot.exportedAt,
    themePreference: snapshot.themePreference ?? 'system',
    favoriteAssetIds: snapshot.favoriteAssetIds,
    settings: snapshot.settings,
    transactions: snapshot.transactions,
    alerts: snapshot.alerts,
  }));

export const workspaceSnapshotSchema = z.union([
  versionedWorkspaceSnapshotSchema,
  legacyWorkspaceSnapshotSchema,
]);

export type WorkspaceSnapshot = z.output<typeof workspaceSnapshotSchema>;

type CreateWorkspaceSnapshotInput = {
  themePreference: ThemePreference;
  favoriteAssetIds: string[];
  settings: CalculatorSettings;
  transactions: PortfolioTransaction[];
  alerts: PriceAlert[];
};

export const createWorkspaceSnapshot = ({
  themePreference,
  favoriteAssetIds,
  settings,
  transactions,
  alerts,
}: CreateWorkspaceSnapshotInput): WorkspaceSnapshot => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  themePreference,
  favoriteAssetIds: Array.from(new Set(favoriteAssetIds)),
  settings,
  transactions,
  alerts,
});
