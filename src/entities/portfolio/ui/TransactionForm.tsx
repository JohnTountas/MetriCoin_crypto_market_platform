import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { usePortfolioStore } from '@/entities/portfolio/model/portfolioStore';
import {
  transactionFormSchema,
  type TransactionFormValues,
} from '@/entities/portfolio/model/schemas';
import { Button, Card, Input, SectionHeading, Select, TRACKED_ASSETS } from '@/shared';

type TransactionFormProps = {
  assetId?: string;
};

const toDateTimeLocalValue = (value: string) => value.slice(0, 16);

export const TransactionForm = ({ assetId }: TransactionFormProps) => {
  const transactions = usePortfolioStore((state) => state.transactions);
  const editingTransactionId = usePortfolioStore((state) => state.editingTransactionId);
  const addTransaction = usePortfolioStore((state) => state.addTransaction);
  const updateTransaction = usePortfolioStore((state) => state.updateTransaction);
  const startEditingTransaction = usePortfolioStore((state) => state.startEditingTransaction);

  const editingTransaction = transactions.find((transaction) => transaction.id === editingTransactionId);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      assetId: assetId ?? 'BTC-USD',
      side: 'buy',
      quantity: 0.25,
      price: 85_000,
      fee: 12,
      executedAt: toDateTimeLocalValue(new Date().toISOString()),
      note: '',
    },
  });

  useEffect(() => {
    if (editingTransaction) {
      form.reset({
        assetId: editingTransaction.assetId,
        side: editingTransaction.side,
        quantity: editingTransaction.quantity,
        price: editingTransaction.price,
        fee: editingTransaction.fee,
        executedAt: toDateTimeLocalValue(editingTransaction.executedAt),
        note: editingTransaction.note ?? '',
      });
      return;
    }

    form.reset({
      assetId: assetId ?? 'BTC-USD',
      side: 'buy',
      quantity: 0.25,
      price: 85_000,
      fee: 12,
      executedAt: toDateTimeLocalValue(new Date().toISOString()),
      note: '',
    });
  }, [assetId, editingTransaction, form]);

  return (
    <Card className="surface p-5">
      <SectionHeading
        eyebrow="Execution"
        title={editingTransaction ? 'Edit transaction' : 'Add transaction'}
        description="Capture cost basis precisely so live PnL, ROI, and break-even metrics stay accurate."
      />

      <form
        className="mt-6 grid gap-4 md:grid-cols-2"
        onSubmit={form.handleSubmit((values) => {
          const payload = {
            ...values,
            note: values.note ?? undefined,
            executedAt: new Date(values.executedAt).toISOString(),
          };

          if (editingTransactionId) {
            updateTransaction(editingTransactionId, payload);
          } else {
            addTransaction(payload);
          }

          form.reset({
            assetId: assetId ?? values.assetId,
            side: 'buy',
            quantity: 0.25,
            price: values.price,
            fee: values.fee,
            executedAt: toDateTimeLocalValue(new Date().toISOString()),
            note: '',
          });
        })}
      >
        <label className="space-y-2 text-sm text-slate-300">
          Asset
          <Select {...form.register('assetId')}>
            {TRACKED_ASSETS.map((asset) => (
              <option
                key={asset.id}
                value={asset.id}
              >
                {asset.name} ({asset.symbol})
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          Side
          <Select {...form.register('side')}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </Select>
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          Quantity
          <Input
            step="0.0001"
            type="number"
            {...form.register('quantity')}
          />
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          Execution price
          <Input
            step="0.01"
            type="number"
            {...form.register('price')}
          />
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          Fee paid
          <Input
            step="0.01"
            type="number"
            {...form.register('fee')}
          />
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          Executed at
          <Input
            type="datetime-local"
            {...form.register('executedAt')}
          />
        </label>

        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          Notes
          <Input
            placeholder="Optional trade context, thesis, or execution note."
            {...form.register('note')}
          />
        </label>

        <div className="md:col-span-2 flex flex-wrap gap-3">
          <Button type="submit">{editingTransaction ? 'Save changes' : 'Add transaction'}</Button>
          {editingTransaction ? (
            <Button
              onClick={() => startEditingTransaction(undefined)}
              variant="secondary"
            >
              Cancel edit
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
};
