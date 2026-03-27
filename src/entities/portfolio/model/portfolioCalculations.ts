import Decimal from 'decimal.js';

import type { MarketSnapshot } from '@/shared/types';
import type {
  CalculatorSettings,
  PortfolioSummary,
  PortfolioTransaction,
  PositionMetrics,
} from '@/shared/types';

type PositionAccumulator = {
  quantity: Decimal;
  costBasis: Decimal;
  feesPaid: Decimal;
};

export const calculateOpenPositions = (
  transactions: PortfolioTransaction[],
  snapshots: Record<string, MarketSnapshot>,
  settings: CalculatorSettings,
) => {
  const positionAccumulatorsByAssetId = new Map<string, PositionAccumulator>();
  const orderedTransactions = [...transactions].sort(
    (left, right) => new Date(left.executedAt).getTime() - new Date(right.executedAt).getTime(),
  );

  orderedTransactions.forEach((transaction) => {
    const positionAccumulator = positionAccumulatorsByAssetId.get(transaction.assetId) ?? {
      quantity: new Decimal(0),
      costBasis: new Decimal(0),
      feesPaid: new Decimal(0),
    };
    const quantity = new Decimal(transaction.quantity);
    const transactionValue = quantity.mul(transaction.price);
    const fee = new Decimal(transaction.fee);

    if (transaction.side === 'buy') {
      positionAccumulator.quantity = positionAccumulator.quantity.plus(quantity);
      positionAccumulator.costBasis = positionAccumulator.costBasis.plus(transactionValue).plus(fee);
      positionAccumulator.feesPaid = positionAccumulator.feesPaid.plus(fee);
    } else if (positionAccumulator.quantity.greaterThan(0)) {
      const averageCostPerUnit = positionAccumulator.costBasis.div(positionAccumulator.quantity);
      const quantityToRemove = Decimal.min(positionAccumulator.quantity, quantity);
      positionAccumulator.costBasis = positionAccumulator.costBasis.minus(averageCostPerUnit.mul(quantityToRemove));
      positionAccumulator.quantity = positionAccumulator.quantity.minus(quantityToRemove);
      positionAccumulator.feesPaid = positionAccumulator.feesPaid.plus(fee);
    }

    positionAccumulatorsByAssetId.set(transaction.assetId, positionAccumulator);
  });

  const positions = Array.from(positionAccumulatorsByAssetId.entries())
    .filter(([, position]) => position.quantity.greaterThan(0))
    .map(([assetId, position]) => {
      const snapshot = snapshots[assetId];
      const currentPrice = new Decimal(snapshot?.price ?? 0);
      const currentValue = position.quantity.mul(currentPrice);
      const averageCost = position.quantity.equals(0) ? new Decimal(0) : position.costBasis.div(position.quantity);
      const modeledExitRate = new Decimal(settings.estimatedFeeRate + settings.estimatedSlippageRate).div(100);
      const breakEvenPrice = averageCost.mul(new Decimal(1).plus(modeledExitRate));
      const unrealizedPnL = currentValue.minus(position.costBasis);

      return {
        assetId,
        quantity: Number(position.quantity.toFixed(8)),
        averageCost: Number(averageCost.toDecimalPlaces(2).toString()),
        currentPrice: Number(currentPrice.toDecimalPlaces(2).toString()),
        investedCapital: Number(position.costBasis.toDecimalPlaces(2).toString()),
        currentValue: Number(currentValue.toDecimalPlaces(2).toString()),
        unrealizedPnL: Number(unrealizedPnL.toDecimalPlaces(2).toString()),
        roiPercent: position.costBasis.equals(0)
          ? 0
          : Number(unrealizedPnL.div(position.costBasis).mul(100).toDecimalPlaces(2).toString()),
        feesPaid: Number(position.feesPaid.toDecimalPlaces(2).toString()),
        breakEvenPrice: Number(breakEvenPrice.toDecimalPlaces(2).toString()),
        allocationPercent: 0,
      } satisfies PositionMetrics;
    });

  const totalValue = positions.reduce((sum, position) => sum + position.currentValue, 0);

  return positions.map((position) => ({
    ...position,
    allocationPercent: totalValue === 0 ? 0 : Number(((position.currentValue / totalValue) * 100).toFixed(2)),
  }));
};

export const calculatePortfolioSummary = (
  positions: PositionMetrics[],
  settings: CalculatorSettings,
): PortfolioSummary => {
  const investedCapital = positions.reduce((sum, position) => sum + position.investedCapital, 0);
  const currentValue = positions.reduce((sum, position) => sum + position.currentValue, 0);
  const unrealizedPnL = positions.reduce((sum, position) => sum + position.unrealizedPnL, 0);
  const totalFeesPaid = positions.reduce((sum, position) => sum + position.feesPaid, 0);
  const breakEvenValue = positions.reduce(
    (sum, position) => sum + position.breakEvenPrice * position.quantity,
    0,
  );
  const exitImpact = currentValue * ((settings.estimatedFeeRate + settings.estimatedSlippageRate) / 100);

  return {
    investedCapital: Number(investedCapital.toFixed(2)),
    currentValue: Number(currentValue.toFixed(2)),
    unrealizedPnL: Number(unrealizedPnL.toFixed(2)),
    roiPercent: investedCapital === 0 ? 0 : Number(((unrealizedPnL / investedCapital) * 100).toFixed(2)),
    totalFeesPaid: Number((totalFeesPaid + exitImpact).toFixed(2)),
    breakEvenValue: Number(breakEvenValue.toFixed(2)),
    exposureCount: positions.length,
  };
};

