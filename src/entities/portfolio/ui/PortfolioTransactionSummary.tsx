import { ArrowDownCircle, ArrowUpCircle, ReceiptText, WalletCards } from 'lucide-react';

import { formatCurrency, formatSignedCurrency, formatTimestamp, StatCard } from '@/shared';

import { calculateTransactionActivitySummary, usePortfolioStore } from '../model';

export const PortfolioTransactionSummary = () => {
  const transactions = usePortfolioStore((state) => state.transactions);
  const summary = calculateTransactionActivitySummary(transactions);
  const netCashFlowTone =
    summary.netCashFlow > 0
      ? 'positive'
      : summary.netCashFlow < 0
        ? 'negative'
        : 'neutral';

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        detail={
          summary.totalTransactions === 0
            ? 'No fills logged yet'
            : `${summary.buyTransactions} buys / ${summary.sellTransactions} sells`
        }
        icon={<ReceiptText className="h-5 w-5" />}
        label="Transactions"
        value={summary.totalTransactions.toString()}
      />
      <StatCard
        detail={
          summary.totalTransactions === 0
            ? 'Capital deployed appears here'
            : `${summary.activeAssetCount} tracked assets`
        }
        icon={<ArrowDownCircle className="h-5 w-5" />}
        label="Buy notional"
        value={formatCurrency(summary.grossBuyValue)}
      />
      <StatCard
        detail={
          summary.lastExecutedAt
            ? `Last fill ${formatTimestamp(summary.lastExecutedAt, true)}`
            : 'Capital realized appears here'
        }
        icon={<ArrowUpCircle className="h-5 w-5" />}
        label="Sell notional"
        value={formatCurrency(summary.grossSellValue)}
      />
      <StatCard
        detail={`Fees ${formatCurrency(summary.totalFeesPaid)}`}
        icon={<WalletCards className="h-5 w-5" />}
        label="Net cash flow"
        tone={netCashFlowTone}
        value={formatSignedCurrency(summary.netCashFlow)}
      />
    </div>
  );
};
