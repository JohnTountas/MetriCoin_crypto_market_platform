export type TransactionSide = 'buy' | 'sell';

export type PortfolioTransaction = {
  id: string;
  assetId: string;
  side: TransactionSide;
  quantity: number;
  price: number;
  fee: number;
  executedAt: string;
  note?: string;
};

export type PositionMetrics = {
  assetId: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  investedCapital: number;
  currentValue: number;
  unrealizedPnL: number;
  roiPercent: number;
  feesPaid: number;
  breakEvenPrice: number;
  allocationPercent: number;
};

export type PortfolioSummary = {
  investedCapital: number;
  currentValue: number;
  unrealizedPnL: number;
  roiPercent: number;
  totalFeesPaid: number;
  breakEvenValue: number;
  exposureCount: number;
};

export type AlertDirection = 'above' | 'below';

export type PriceAlert = {
  id: string;
  assetId: string;
  direction: AlertDirection;
  targetPrice: number;
  label?: string;
  triggered: boolean;
  createdAt: string;
  triggeredAt?: string;
};

export type CalculatorSettings = {
  estimatedFeeRate: number;
  estimatedSlippageRate: number;
  preferredCurrency: 'USD';
};
