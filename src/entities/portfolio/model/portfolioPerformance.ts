import Decimal from 'decimal.js';

import type { MarketCandle, PortfolioPerformancePoint, PortfolioTransaction } from '@/shared/types';

type PortfolioPerformanceInput = {
  transactions: PortfolioTransaction[];
  candlesByAssetId: Record<string, MarketCandle[]>;
};

const getTimelineSeconds = (
  transactions: PortfolioTransaction[],
  candlesByAssetId: Record<string, MarketCandle[]>,
) => {
  // We merge transaction timestamps with candle timestamps so the curve reacts
  // immediately to fills and then keeps following the market between them.
  const transactionTimes = transactions.map((transaction) =>
    Math.floor(new Date(transaction.executedAt).getTime() / 1000),
  );
  const candleTimes = Object.values(candlesByAssetId).flatMap((candles) =>
    candles.map((candle) => candle.time),
  );

  return Array.from(new Set([...transactionTimes, ...candleTimes])).sort((left, right) => left - right);
};

const updatePositionState = (
  quantitiesByAssetId: Map<string, Decimal>,
  costBasisByAssetId: Map<string, Decimal>,
  latestTradePriceByAssetId: Map<string, Decimal>,
  transaction: PortfolioTransaction,
) => {
  const currentQuantity = quantitiesByAssetId.get(transaction.assetId) ?? new Decimal(0);
  const currentCostBasis = costBasisByAssetId.get(transaction.assetId) ?? new Decimal(0);
  const transactionQuantity = new Decimal(transaction.quantity);
  const transactionValue = transactionQuantity.mul(transaction.price);
  const transactionFee = new Decimal(transaction.fee);

  latestTradePriceByAssetId.set(transaction.assetId, new Decimal(transaction.price));

  if (transaction.side === 'buy') {
    quantitiesByAssetId.set(transaction.assetId, currentQuantity.plus(transactionQuantity));
    costBasisByAssetId.set(transaction.assetId, currentCostBasis.plus(transactionValue).plus(transactionFee));
    return;
  }

  const quantityToRemove = Decimal.min(currentQuantity, transactionQuantity);
  const averageCostPerUnit = currentQuantity.equals(0)
    ? new Decimal(0)
    : currentCostBasis.div(currentQuantity);

  quantitiesByAssetId.set(transaction.assetId, currentQuantity.minus(quantityToRemove));
  costBasisByAssetId.set(
    transaction.assetId,
    currentCostBasis.minus(averageCostPerUnit.mul(quantityToRemove)),
  );
};

export const calculatePortfolioPerformancePoints = ({
  transactions,
  candlesByAssetId,
}: PortfolioPerformanceInput): PortfolioPerformancePoint[] => {
  if (transactions.length === 0) {
    return [];
  }

  const orderedTransactions = [...transactions].sort(
    (left, right) => new Date(left.executedAt).getTime() - new Date(right.executedAt).getTime(),
  );
  const assetIds = Array.from(new Set(orderedTransactions.map((transaction) => transaction.assetId)));
  const orderedTimelineSeconds = getTimelineSeconds(orderedTransactions, candlesByAssetId);
  const quantitiesByAssetId = new Map<string, Decimal>();
  const costBasisByAssetId = new Map<string, Decimal>();
  const latestTradePriceByAssetId = new Map<string, Decimal>();
  const historyIndexesByAssetId = new Map<string, number>();
  const latestHistoryPriceByAssetId = new Map<string, Decimal>();
  const performancePoints: PortfolioPerformancePoint[] = [];
  let transactionIndex = 0;

  for (const timelineSecond of orderedTimelineSeconds) {
    const timelineTimestamp = timelineSecond * 1000;

    // First apply every trade that happened up to this point in time so the
    // portfolio curve reflects the ledger before the market price is sampled.
    while (
      transactionIndex < orderedTransactions.length &&
      new Date(orderedTransactions[transactionIndex].executedAt).getTime() <= timelineTimestamp
    ) {
      updatePositionState(
        quantitiesByAssetId,
        costBasisByAssetId,
        latestTradePriceByAssetId,
        orderedTransactions[transactionIndex],
      );
      transactionIndex += 1;
    }

    let currentValue = new Decimal(0);
    let investedCapital = new Decimal(0);

    for (const assetId of assetIds) {
      const candles = candlesByAssetId[assetId] ?? [];
      const nextHistoryIndex = historyIndexesByAssetId.get(assetId) ?? 0;
      let resolvedHistoryIndex = nextHistoryIndex;

      while (resolvedHistoryIndex < candles.length && candles[resolvedHistoryIndex].time <= timelineSecond) {
        latestHistoryPriceByAssetId.set(assetId, new Decimal(candles[resolvedHistoryIndex].close));
        resolvedHistoryIndex += 1;
      }

      historyIndexesByAssetId.set(assetId, resolvedHistoryIndex);

      const quantity = quantitiesByAssetId.get(assetId) ?? new Decimal(0);
      const costBasis = costBasisByAssetId.get(assetId) ?? new Decimal(0);

      if (quantity.lessThanOrEqualTo(0) && costBasis.lessThanOrEqualTo(0)) {
        continue;
      }

      const price =
        latestHistoryPriceByAssetId.get(assetId) ??
        latestTradePriceByAssetId.get(assetId) ??
        new Decimal(0);

      currentValue = currentValue.plus(quantity.mul(price));
      investedCapital = investedCapital.plus(costBasis);
    }

    if (
      currentValue.equals(0) &&
      investedCapital.equals(0) &&
      transactionIndex >= orderedTransactions.length
    ) {
      // Once the book is flat and there are no future trades, later candle data
      // would only extend the chart with zeros, so we stop here.
      break;
    }

    performancePoints.push({
      time: timelineSecond,
      value: Number(currentValue.toDecimalPlaces(2).toString()),
      investedCapital: Number(investedCapital.toDecimalPlaces(2).toString()),
      unrealizedPnL: Number(currentValue.minus(investedCapital).toDecimalPlaces(2).toString()),
    });
  }

  return performancePoints;
};
