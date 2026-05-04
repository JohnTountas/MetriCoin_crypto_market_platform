// PortfolioTransactionHistory shows the audit-friendly ledger plus the maintenance actions around it.
// Editing and delete behavior stays here so the rest of the portfolio UI can remain read-focused.
import { Pencil, Trash2 } from 'lucide-react';

import { useAppStore } from '@/app';
import { useMarketStore } from '@/entities/market';
import {
  AssetIcon,
  Badge,
  Button,
  Card,
  EmptyState,
  formatCurrency,
  formatPrice,
  formatQuantity,
  formatTimestamp,
  getFallbackAssetMeta,
  SectionHeading,
} from '@/shared';

import { sortTransactionsByExecutedAt, usePortfolioStore } from '../model';

type PortfolioTransactionHistoryProps = {
  assetId?: string;
  limit?: number;
  compact?: boolean;
};

/**
 * PortfolioTransactionHistory keeps the ledger readable on both compact mobile cards and a full desktop table.
 * The two layouts share the same transaction list so filtering and actions stay consistent everywhere.
 */
export const PortfolioTransactionHistory = ({
  assetId,
  limit,
  compact = false,
}: PortfolioTransactionHistoryProps) => {
  const assetLookup = useMarketStore((state) => state.assetLookup);
  const transactions = usePortfolioStore((state) => state.transactions);
  const deleteTransaction = usePortfolioStore(
    (state) => state.deleteTransaction,
  );
  const setEditingTransactionId = usePortfolioStore(
    (state) => state.setEditingTransactionId,
  );
  const pushToast = useAppStore((state) => state.pushToast);

  const filteredTransactions = sortTransactionsByExecutedAt(
    transactions.filter(
      (transaction) => !assetId || transaction.assetId === assetId,
    ),
  ).slice(0, limit ?? transactions.length);

  if (filteredTransactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Start by logging your first Bitcoin or altcoin fill. Live portfolio analytics will populate instantly."
      />
    );
  }

  return (
    <Card className="surface p-4 sm:p-5">
      <SectionHeading
        eyebrow="Ledger"
        title="Transaction history"
        description="A clean execution log with edit and delete controls for fast portfolio maintenance."
      />

      <div className="mt-6 grid gap-4 md:hidden">
        {filteredTransactions.map((transaction) => {
          const asset =
            assetLookup[transaction.assetId] ??
            getFallbackAssetMeta(transaction.assetId);

          return (
            <div
              className="surface-subtle rounded-[1.5rem] p-4"
              key={transaction.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <AssetIcon asset={asset} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--text-primary)]">
                      {asset.name}
                    </p>
                    <p className="truncate text-sm text-[var(--text-faint)]">
                      {transaction.note ?? `${asset.symbol} execution`}
                    </p>
                  </div>
                </div>
                <Badge
                  tone={transaction.side === 'buy' ? 'positive' : 'warning'}
                >
                  {transaction.side}
                </Badge>
              </div>

              <div className="mt-5 grid gap-3 xs:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Quantity
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                    {formatQuantity(transaction.assetId, transaction.quantity)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Price
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                    {formatPrice(transaction.price)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Value
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                    {formatCurrency(transaction.quantity * transaction.price)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Fee
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                    {formatPrice(transaction.fee)}
                  </p>
                </div>
                <div className="xs:col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Executed
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                    {formatTimestamp(transaction.executedAt)}
                  </p>
                </div>
              </div>

              {!compact ? (
                <div className="mt-5 flex flex-col gap-3 xs:flex-row">
                  <Button
                    className="w-full xs:w-auto"
                    onClick={() => setEditingTransactionId(transaction.id)}
                    size="sm"
                    variant="secondary"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    className="w-full xs:w-auto"
                    onClick={() => {
                      deleteTransaction(transaction.id);
                      pushToast({
                        tone: 'warning',
                        title: 'Transaction deleted',
                        description: `Removed ${transaction.side} ${formatQuantity(transaction.assetId, transaction.quantity)} ${asset.symbol} from the ledger.`,
                      });
                    }}
                    size="sm"
                    variant="danger"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="min-w-[920px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-[var(--text-faint)]">
            <tr>
              <th className="pb-3 font-medium">Asset</th>
              <th className="pb-3 font-medium">Side</th>
              <th className="pb-3 font-medium">Quantity</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium">Value</th>
              <th className="pb-3 font-medium">Fee</th>
              <th className="pb-3 font-medium">Executed</th>
              {!compact ? <th className="pb-3 font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredTransactions.map((transaction) => {
              const asset =
                assetLookup[transaction.assetId] ??
                getFallbackAssetMeta(transaction.assetId);

              return (
                <tr key={transaction.id}>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <AssetIcon asset={asset} size="sm" />
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">
                          {asset.name}
                        </p>
                        <p className="text-[var(--text-faint)]">
                          {transaction.note ?? `${asset.symbol} execution`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge
                      tone={transaction.side === 'buy' ? 'positive' : 'warning'}
                    >
                      {transaction.side}
                    </Badge>
                  </td>
                  <td className="py-4 text-[var(--text-secondary)]">
                    {formatQuantity(transaction.assetId, transaction.quantity)}
                  </td>
                  <td className="py-4 text-[var(--text-secondary)]">
                    {formatPrice(transaction.price)}
                  </td>
                  <td className="py-4 text-[var(--text-secondary)]">
                    {formatCurrency(transaction.quantity * transaction.price)}
                  </td>
                  <td className="py-4 text-[var(--text-secondary)]">
                    {formatPrice(transaction.fee)}
                  </td>
                  <td className="py-4 text-[var(--text-muted)]">
                    {formatTimestamp(transaction.executedAt)}
                  </td>
                  {!compact ? (
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            setEditingTransactionId(transaction.id)
                          }
                          size="sm"
                          variant="secondary"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => {
                            deleteTransaction(transaction.id);
                            pushToast({
                              tone: 'warning',
                              title: 'Transaction deleted',
                              description: `Removed ${transaction.side} ${formatQuantity(transaction.assetId, transaction.quantity)} ${asset.symbol} from the ledger.`,
                            });
                          }}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
