import { z } from 'zod';

export const portfolioTransactionFormSchema = z.object({
  assetId: z.string().min(1),
  side: z.enum(['buy', 'sell']),
  quantity: z.coerce.number().positive(),
  price: z.coerce.number().positive(),
  fee: z.coerce.number().min(0),
  executedAt: z.string().min(1),
  note: z.string().max(160).optional().or(z.literal('')),
});

export type PortfolioTransactionFormValues = z.infer<typeof portfolioTransactionFormSchema>;

export const priceAlertFormSchema = z.object({
  assetId: z.string().min(1),
  direction: z.enum(['above', 'below']),
  targetPrice: z.coerce.number().positive(),
  label: z.string().max(80).optional().or(z.literal('')),
});

export type PriceAlertFormValues = z.infer<typeof priceAlertFormSchema>;

export const portfolioSettingsSchema = z.object({
  estimatedFeeRate: z.coerce.number().min(0).max(5),
  estimatedSlippageRate: z.coerce.number().min(0).max(5),
});

export type PortfolioSettingsFormValues = z.infer<typeof portfolioSettingsSchema>;
