// Transaction insight helpers keep ledger sorting, summaries, and sell validation in one place.
// That shared logic prevents page components from inventing slightly different ledger rules.
import Decimal from 'decimal.js';

import type { PortfolioTransaction } from '@/shared/types';

export type TransactionActivitySummary = {
  totalTransactions: number;
  buyTransactions: number;
  sellTransactions: number;
  grossBuyValue: number;
  grossSellValue: number;
  totalFeesPaid: number;
  netCashFlow: number;
  activeAssetCount: number;
  lastExecutedAt?: string;
};

export type TransactionLedgerIssue = {
  transactionId: string;
  assetId: string;
  availableQuantity: number;
  attemptedQuantity: number;
  executedAt: string;
};

export type TransactionLedgerValidationResult =
  | {
      isValid: true;
      issue?: undefined;
    }
  | {
      isValid: false;
      issue: TransactionLedgerIssue;
    };

const compareTransactionsByExecutedAt = (
  left: Pick<PortfolioTransaction, 'id' | 'executedAt'>,
  right: Pick<PortfolioTransaction, 'id' | 'executedAt'>,
) => {
  const timestampDifference =
    new Date(left.executedAt).getTime() - new Date(right.executedAt).getTime();

  if (timestampDifference !== 0) {
    return timestampDifference;
  }

  return left.id.localeCompare(right.id);
};

export const sortTransactionsByExecutedAt = (
  transactions: PortfolioTransaction[],
  direction: 'asc' | 'desc' = 'desc',
) =>
  [...transactions].sort((left, right) => {
    const comparison = compareTransactionsByExecutedAt(left, right);
    return direction === 'asc' ? comparison : comparison * -1;
  });

export const calculateTransactionActivitySummary = (
  transactions: PortfolioTransaction[],
): TransactionActivitySummary => {
  const orderedTransactions = sortTransactionsByExecutedAt(transactions, 'desc');

  const grossBuyValue = transactions.reduce((sum, transaction) => {
    if (transaction.side !== 'buy') {
      return sum;
    }

    return sum.plus(new Decimal(transaction.quantity).mul(transaction.price));
  }, new Decimal(0));

  const grossSellValue = transactions.reduce((sum, transaction) => {
    if (transaction.side !== 'sell') {
      return sum;
    }

    return sum.plus(new Decimal(transaction.quantity).mul(transaction.price));
  }, new Decimal(0));

  const totalFeesPaid = transactions.reduce(
    (sum, transaction) => sum.plus(transaction.fee),
    new Decimal(0),
  );

  const netCashFlow = transactions.reduce((sum, transaction) => {
    const notional = new Decimal(transaction.quantity).mul(transaction.price);
    const fee = new Decimal(transaction.fee);

    return transaction.side === 'buy'
      ? sum.minus(notional.plus(fee))
      : sum.plus(notional.minus(fee));
  }, new Decimal(0));

  return {
    totalTransactions: transactions.length,
    buyTransactions: transactions.filter((transaction) => transaction.side === 'buy').length,
    sellTransactions: transactions.filter((transaction) => transaction.side === 'sell').length,
    grossBuyValue: Number(grossBuyValue.toDecimalPlaces(2).toString()),
    grossSellValue: Number(grossSellValue.toDecimalPlaces(2).toString()),
    totalFeesPaid: Number(totalFeesPaid.toDecimalPlaces(2).toString()),
    netCashFlow: Number(netCashFlow.toDecimalPlaces(2).toString()),
    activeAssetCount: new Set(transactions.map((transaction) => transaction.assetId)).size,
    lastExecutedAt: orderedTransactions[0]?.executedAt,
  };
};

export const getAvailableAssetQuantityAt = (
  transactions: PortfolioTransaction[],
  assetId: string,
  executedAt: string,
  excludeTransactionId?: string,
) => {
  const targetTimestamp = new Date(executedAt).getTime();

  if (Number.isNaN(targetTimestamp)) {
    return 0;
  }

  const quantity = sortTransactionsByExecutedAt(
    transactions.filter(
      (transaction) =>
        transaction.assetId === assetId && transaction.id !== excludeTransactionId,
    ),
    'asc',
  ).reduce((runningQuantity, transaction) => {
    const transactionTimestamp = new Date(transaction.executedAt).getTime();

    if (transactionTimestamp > targetTimestamp) {
      return runningQuantity;
    }

    const nextQuantity =
      transaction.side === 'buy'
        ? runningQuantity.plus(transaction.quantity)
        : runningQuantity.minus(transaction.quantity);

    return nextQuantity.lessThan(0) ? new Decimal(0) : nextQuantity;
  }, new Decimal(0));

  return Number(quantity.toDecimalPlaces(8).toString());
};

export const validateTransactionLedger = (
  transactions: PortfolioTransaction[],
): TransactionLedgerValidationResult => {
  const availableQuantityByAssetId = new Map<string, Decimal>();

  for (const transaction of sortTransactionsByExecutedAt(transactions, 'asc')) {
    const availableQuantity =
      availableQuantityByAssetId.get(transaction.assetId) ?? new Decimal(0);
    const transactionQuantity = new Decimal(transaction.quantity);

    if (
      transaction.side === 'sell' &&
      availableQuantity.lessThan(transactionQuantity)
    ) {
      return {
        isValid: false,
        issue: {
          transactionId: transaction.id,
          assetId: transaction.assetId,
          availableQuantity: Number(
            availableQuantity.toDecimalPlaces(8).toString(),
          ),
          attemptedQuantity: transaction.quantity,
          executedAt: transaction.executedAt,
        },
      };
    }

    const nextQuantity =
      transaction.side === 'buy'
        ? availableQuantity.plus(transactionQuantity)
        : availableQuantity.minus(transactionQuantity);

    availableQuantityByAssetId.set(transaction.assetId, nextQuantity);
  }

  return { isValid: true };
};
