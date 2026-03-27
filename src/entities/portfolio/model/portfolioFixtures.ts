import type { CalculatorSettings, PortfolioTransaction, PriceAlert } from '@/shared/types';

export const sampleTransactions: PortfolioTransaction[] = [
  {
    id: 'tx-btc-1',
    assetId: 'BTC-USD',
    side: 'buy',
    quantity: 0.62,
    price: 62_400,
    fee: 46.8,
    executedAt: '2025-10-14T09:15:00.000Z',
    note: 'Core treasury accumulation.',
  },
  {
    id: 'tx-btc-2',
    assetId: 'BTC-USD',
    side: 'buy',
    quantity: 0.18,
    price: 71_320,
    fee: 18.5,
    executedAt: '2026-01-08T15:10:00.000Z',
    note: 'Momentum add after breakout confirmation.',
  },
  {
    id: 'tx-eth-1',
    assetId: 'ETH-USD',
    side: 'buy',
    quantity: 4.2,
    price: 3_840,
    fee: 21.5,
    executedAt: '2025-11-19T10:45:00.000Z',
    note: 'L2 beta exposure.',
  },
  {
    id: 'tx-sol-1',
    assetId: 'SOL-USD',
    side: 'buy',
    quantity: 62,
    price: 148,
    fee: 12.4,
    executedAt: '2025-12-22T13:05:00.000Z',
    note: 'High-beta satellite sleeve.',
  },
];

export const samplePriceAlerts: PriceAlert[] = [
  {
    id: 'alert-btc-above',
    assetId: 'BTC-USD',
    direction: 'above',
    targetPrice: 90_000,
    label: 'Breakout trigger',
    triggered: false,
    createdAt: '2026-03-01T12:00:00.000Z',
  },
  {
    id: 'alert-btc-below',
    assetId: 'BTC-USD',
    direction: 'below',
    targetPrice: 82_000,
    label: 'Risk trim zone',
    triggered: false,
    createdAt: '2026-03-05T08:30:00.000Z',
  },
];

export const defaultPortfolioSettings: CalculatorSettings = {
  estimatedFeeRate: 0.12,
  estimatedSlippageRate: 0.08,
  preferredCurrency: 'USD',
};

