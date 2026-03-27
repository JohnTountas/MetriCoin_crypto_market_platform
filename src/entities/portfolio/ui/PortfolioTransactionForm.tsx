import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useMarketStore } from '@/entities/market';
import { DEFAULT_ASSET_ID } from '@/shared/constants';
import { AssetSelect, Button, Card, Input, SectionHeading, Select } from '@/shared';
import {
  portfolioTransactionFormSchema,
  type PortfolioTransactionFormValues,
  usePortfolioStore,
} from '../model';

type PortfolioTransactionFormProps = {
  assetId?: string;
};

type PortfolioTransactionFormDefaultsOverrides = Partial<
  Pick<PortfolioTransactionFormValues, 'price' | 'fee' | 'assetId' | 'side' | 'quantity' | 'note'>
>;

const formatDateTimeInputValue = (value: string) => value.slice(0, 16);

const buildTransactionFormDefaults = (
  initialAssetId: string,
  overrides: PortfolioTransactionFormDefaultsOverrides = {},
): PortfolioTransactionFormValues => ({
  assetId: overrides.assetId ?? initialAssetId,
  side: overrides.side ?? 'buy',
  quantity: overrides.quantity ?? 0.25,
  price: overrides.price ?? 85_000,
  fee: overrides.fee ?? 12,
  executedAt: formatDateTimeInputValue(new Date().toISOString()),
  note: overrides.note ?? '',
});

export const PortfolioTransactionForm = ({ assetId }: PortfolioTransactionFormProps) => {
  const assets = useMarketStore((state) => state.assets);
  const transactions = usePortfolioStore((state) => state.transactions);
  const editingTransactionId = usePortfolioStore((state) => state.editingTransactionId);
  const addTransaction = usePortfolioStore((state) => state.addTransaction);
  const updateTransaction = usePortfolioStore((state) => state.updateTransaction);
  const setEditingTransactionId = usePortfolioStore((state) => state.setEditingTransactionId);

  const editingTransaction = transactions.find((transaction) => transaction.id === editingTransactionId);
  const initialAssetId = assetId ?? DEFAULT_ASSET_ID;

  const form = useForm<PortfolioTransactionFormValues>({
    resolver: zodResolver(portfolioTransactionFormSchema),
    defaultValues: buildTransactionFormDefaults(initialAssetId),
  });
  const selectedFormAssetId = form.watch('assetId');

  useEffect(() => {
    if (editingTransaction) {
      form.reset({
        assetId: editingTransaction.assetId,
        side: editingTransaction.side,
        quantity: editingTransaction.quantity,
        price: editingTransaction.price,
        fee: editingTransaction.fee,
        executedAt: formatDateTimeInputValue(editingTransaction.executedAt),
        note: editingTransaction.note ?? '',
      });
      return;
    }

    form.reset(buildTransactionFormDefaults(initialAssetId));
  }, [editingTransaction, form, initialAssetId]);

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

          form.reset(
            buildTransactionFormDefaults(assetId ?? values.assetId, {
              price: values.price,
              fee: values.fee,
            }),
          );
        })}
      >
        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Asset
          <AssetSelect
            assets={assets}
            onChange={(nextAssetId) =>
              form.setValue('assetId', nextAssetId, {
                shouldDirty: true,
                shouldValidate: true,
              })}
            value={selectedFormAssetId}
          />
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Side
          <Select {...form.register('side')}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </Select>
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Quantity
          <Input
            step="0.0001"
            type="number"
            {...form.register('quantity')}
          />
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Execution price
          <Input
            step="0.01"
            type="number"
            {...form.register('price')}
          />
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Fee paid
          <Input
            step="0.01"
            type="number"
            {...form.register('fee')}
          />
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Executed at
          <Input
            type="datetime-local"
            {...form.register('executedAt')}
          />
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)] md:col-span-2">
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
              onClick={() => setEditingTransactionId(undefined)}
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

