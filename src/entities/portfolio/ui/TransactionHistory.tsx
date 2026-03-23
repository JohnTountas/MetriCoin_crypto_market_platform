import { Pencil, Trash2 } from 'lucide-react';

import { usePortfolioStore } from '@/entities/portfolio/model/portfolioStore';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { SectionHeading } from '@/shared/components/ui/SectionHeading';
import { ASSET_LOOKUP } from '@/shared/constants/assets';
import { formatPrice,formatQuantity, formatTimestamp } from '@/shared/lib/formatters';

type TransactionHistoryProps = {
  assetId?: string;
  limit?: number;
  compact?: boolean;
};

export const TransactionHistory = ({ assetId, limit, compact = false }: TransactionHistoryProps) => {
  const transactions = usePortfolioStore((state) => state.transactions);
  const deleteTransaction = usePortfolioStore((state) => state.deleteTransaction);
  const startEditingTransaction = usePortfolioStore((state) => state.startEditingTransaction);

  const filteredTransactions = transactions
    .filter((transaction) => !assetId || transaction.assetId === assetId)
    .slice(0, limit ?? transactions.length);

  if (filteredTransactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Start by logging your first Bitcoin or altcoin fill. Live portfolio analytics will populate instantly."
      />
    );
  }

  return (
    <Card className="surface p-5">
      <SectionHeading
        eyebrow="Ledger"
        title="Transaction history"
        description="A clean execution log with edit and delete controls for fast portfolio maintenance."
      />

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="pb-3 font-medium">Asset</th>
              <th className="pb-3 font-medium">Side</th>
              <th className="pb-3 font-medium">Quantity</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium">Fee</th>
              <th className="pb-3 font-medium">Executed</th>
              {!compact ? <th className="pb-3 font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="py-4">
                  <div>
                    <p className="font-semibold text-white">{ASSET_LOOKUP[transaction.assetId]?.name}</p>
                    <p className="text-slate-500">{transaction.note ?? transaction.assetId}</p>
                  </div>
                </td>
                <td className="py-4">
                  <Badge tone={transaction.side === 'buy' ? 'positive' : 'warning'}>
                    {transaction.side}
                  </Badge>
                </td>
                <td className="py-4 text-slate-300">
                  {formatQuantity(transaction.assetId, transaction.quantity)}
                </td>
                <td className="py-4 text-slate-300">{formatPrice(transaction.price)}</td>
                <td className="py-4 text-slate-300">{formatPrice(transaction.fee)}</td>
                <td className="py-4 text-slate-400">{formatTimestamp(transaction.executedAt)}</td>
                {!compact ? (
                  <td className="py-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startEditingTransaction(transaction.id)}
                        size="sm"
                        variant="secondary"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => deleteTransaction(transaction.id)}
                        size="sm"
                        variant="danger"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

