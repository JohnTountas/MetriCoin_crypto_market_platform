// These schemas define the payload shapes Metricoin is willing to trust from Coinbase.
// Tight validation here keeps provider quirks from leaking into stores and UI components.
import { z } from 'zod';

export const coinbaseTickerResponseSchema = z.object({
  trade_id: z.number().optional(),
  price: z.string(),
  size: z.string().optional(),
  bid: z.string().optional(),
  ask: z.string().optional(),
  volume: z.string().optional(),
  time: z.string().optional(),
});

export const coinbaseProductStatsSchema = z.object({
  open: z.string(),
  high: z.string(),
  low: z.string(),
  last: z.string().optional(),
  volume: z.string(),
  volume_30day: z.string().optional(),
});

export const coinbaseCandleSchema = z.array(
  z.tuple([z.number(), z.number(), z.number(), z.number(), z.number(), z.number()]),
);

export const coinbaseProductsSchema = z.array(
  z.object({
    id: z.string(),
    base_currency: z.string(),
    quote_currency: z.string(),
    display_name: z.string().optional(),
    status: z.string().optional(),
    trading_disabled: z.boolean().optional(),
    base_increment: z.string().optional(),
  }),
);

export const coinbaseWsTickerMessageSchema = z.object({
  type: z.literal('ticker'),
  product_id: z.string(),
  price: z.string(),
  best_bid: z.string().optional(),
  best_ask: z.string().optional(),
  volume_24h: z.string().optional(),
  time: z.string().optional(),
});

export const coinbaseWsErrorSchema = z.object({
  type: z.literal('error'),
  message: z.string().optional(),
});
