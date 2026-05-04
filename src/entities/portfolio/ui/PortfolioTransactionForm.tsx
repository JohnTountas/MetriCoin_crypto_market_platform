// PortfolioTransactionForm handles both create and edit flows while protecting ledger integrity.
// If manual portfolio entry starts behaving strangely, this is the first form to inspect.
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useAppStore } from '@/app';
import { useMarketStore } from '@/entities/market';
import {
  AssetSelect,
  Button,
  Card,
  classNames,
  formatCurrency,
  formatPrice,
  formatQuantity,
  formatSignedCurrency,
  getFallbackAssetMeta,
  Input,
  SectionHeading,
  Select,
} from '@/shared';
import { DEFAULT_ASSET_ID } from '@/shared/constants';

import {
  getAvailableAssetQuantityAt,
  portfolioTransactionFormSchema,
  type PortfolioTransactionFormValues,
  usePortfolioStore,
  validateTransactionLedger,
} from '../model';

type PortfolioTransactionFormProps = {
  assetId?: string;
};

type PortfolioTransactionFormDefaultsOverrides = Partial<
  Pick<
    PortfolioTransactionFormValues,
    'price' | 'fee' | 'assetId' | 'side' | 'quantity' | 'note'
  >
>;

/**
 * formatDateTimeInputValue trims an ISO timestamp down to the precision expected by datetime-local inputs.
 * This keeps edit mode stable because the native control does not accept seconds or timezone markers.
 */
const formatDateTimeInputValue = (value: string) => value.slice(0, 16);

/**
 * buildTransactionFormDefaults seeds the form with realistic values for faster data entry.
 * The optional overrides let edit and post-submit flows preserve the fields users usually want to reuse.
 */
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

/**
 * PortfolioTransactionForm captures ledger writes and blocks edits that would break sell history.
 * The responsive layout keeps all financial context visible even when the form collapses to one column.
 */
export const PortfolioTransactionForm = ({
  assetId,
}: PortfolioTransactionFormProps) => {
  const assets = useMarketStore((state) => state.assets);
  const assetLookup = useMarketStore((state) => state.assetLookup);
  const snapshots = useMarketStore((state) => state.snapshots);
  const transactions = usePortfolioStore((state) => state.transactions);
  const editingTransactionId = usePortfolioStore(
    (state) => state.editingTransactionId,
  );
  const addTransaction = usePortfolioStore((state) => state.addTransaction);
  const updateTransaction = usePortfolioStore(
    (state) => state.updateTransaction,
  );
  const setEditingTransactionId = usePortfolioStore(
    (state) => state.setEditingTransactionId,
  );
  const pushToast = useAppStore((state) => state.pushToast);

  const editingTransaction = transactions.find(
    (transaction) => transaction.id === editingTransactionId,
  );
  const initialAssetId = assetId ?? DEFAULT_ASSET_ID;

  const form = useForm<PortfolioTransactionFormValues>({
    resolver: zodResolver(portfolioTransactionFormSchema),
    defaultValues: buildTransactionFormDefaults(initialAssetId),
  });
  const selectedFormAssetId = form.watch('assetId');
  const selectedSide = form.watch('side');
  const watchedQuantity = Number(form.watch('quantity') ?? 0);
  const watchedPrice = Number(form.watch('price') ?? 0);
  const watchedFee = Number(form.watch('fee') ?? 0);
  const selectedQuantity = Number.isFinite(watchedQuantity)
    ? watchedQuantity
    : 0;
  const selectedPrice = Number.isFinite(watchedPrice) ? watchedPrice : 0;
  const selectedFee = Number.isFinite(watchedFee) ? watchedFee : 0;
  const selectedExecutedAt = form.watch('executedAt');
  const selectedAsset =
    assetLookup[selectedFormAssetId] ??
    getFallbackAssetMeta(selectedFormAssetId);
  const selectedAssetIsTracked = Boolean(assetLookup[selectedFormAssetId]);
  const selectedSnapshot = snapshots[selectedFormAssetId];
  const availableToSell =
    selectedSide === 'sell'
      ? getAvailableAssetQuantityAt(
          transactions,
          selectedFormAssetId,
          selectedExecutedAt,
          editingTransactionId,
        )
      : 0;
  const sellQuantityExceeded =
    selectedSide === 'sell' && selectedQuantity > availableToSell + 0.00000001;
  const notionalValue = selectedQuantity * selectedPrice;
  const netCashImpact =
    selectedSide === 'buy'
      ? -(notionalValue + selectedFee)
      : notionalValue - selectedFee;
  const { errors } = form.formState;

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

  useEffect(() => {
    if (errors.quantity?.type === 'manual') {
      form.clearErrors('quantity');
    }
  }, [
    errors.quantity?.type,
    form,
    selectedExecutedAt,
    selectedFormAssetId,
    selectedQuantity,
    selectedSide,
  ]);

  return (
    <Card className="surface p-4 sm:p-5">
      <SectionHeading
        eyebrow="Execution"
        title={editingTransaction ? 'Edit transaction' : 'Add transaction'}
        description="Capture cost basis precisely so live PnL, ROI, and break-even metrics stay accurate."
      />

      <form
        className="mt-6 grid gap-4 md:grid-cols-2"
        onSubmit={form.handleSubmit((values) => {
          const executedAtDate = new Date(values.executedAt);
          const trimmedNote = values.note?.trim();
          const normalizedNote = trimmedNote === '' ? undefined : trimmedNote;

          if (Number.isNaN(executedAtDate.getTime())) {
            form.setError('executedAt', {
              type: 'manual',
              message: 'Enter a valid execution time.',
            });
            return;
          }

          const payload = {
            ...values,
            note: normalizedNote,
            executedAt: executedAtDate.toISOString(),
          };
          const draftTransactionId =
            editingTransactionId ?? 'draft-transaction';
          const candidateTransaction = {
            ...payload,
            id: draftTransactionId,
          };
          const candidateTransactions = editingTransactionId
            ? transactions.map((transaction) =>
                transaction.id === editingTransactionId
                  ? candidateTransaction
                  : transaction,
              )
            : [...transactions, candidateTransaction];
          const validation = validateTransactionLedger(candidateTransactions);

          if (!validation.isValid) {
            const invalidAsset =
              assetLookup[validation.issue.assetId] ??
              getFallbackAssetMeta(validation.issue.assetId);
            const message =
              validation.issue.transactionId === draftTransactionId
                ? `Only ${formatQuantity(validation.issue.assetId, validation.issue.availableQuantity)} ${invalidAsset.symbol} was available at that time.`
                : `This change would make a later ${invalidAsset.symbol} sell invalid.`;

            form.setError('quantity', {
              type: 'manual',
              message,
            });
            pushToast({
              tone: 'error',
              title: 'Transaction rejected',
              description:
                validation.issue.transactionId === draftTransactionId
                  ? message
                  : `Adjust the size or timestamp so the ${invalidAsset.symbol} ledger never drops below zero.`,
            });
            return;
          }

          const savedAsset =
            assetLookup[payload.assetId] ??
            getFallbackAssetMeta(payload.assetId);

          if (editingTransactionId) {
            updateTransaction(editingTransactionId, payload);
            pushToast({
              tone: 'success',
              title: 'Transaction updated',
              description: `Saved ${payload.side} ${formatQuantity(payload.assetId, payload.quantity)} ${savedAsset.symbol} at ${formatPrice(payload.price)}.`,
            });
          } else {
            addTransaction(payload);
            pushToast({
              tone: 'success',
              title: 'Transaction added',
              description: `Logged ${payload.side} ${formatQuantity(payload.assetId, payload.quantity)} ${savedAsset.symbol} at ${formatPrice(payload.price)}.`,
            });
          }

          form.reset(
            buildTransactionFormDefaults(payload.assetId, {
              price: values.price,
              fee: values.fee,
              assetId: payload.assetId,
            }),
          );
        })}
      >
        <input type="hidden" {...form.register('assetId')} />
        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Asset
          <AssetSelect
            ariaLabel="Transaction asset selector"
            assets={assets}
            onChange={(nextAssetId) =>
              form.setValue('assetId', nextAssetId, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            value={selectedFormAssetId}
          />
          <p className="text-xs text-[var(--text-faint)]">
            {assetId
              ? 'Preselected from this page, but you can change it before saving.'
              : 'Choose the coin this fill belongs to.'}
          </p>
          {errors.assetId?.message ? (
            <p className="text-xs text-[var(--negative-text)]">
              {errors.assetId.message}
            </p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Side
          <Select {...form.register('side')}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </Select>
          {errors.side?.message ? (
            <p className="text-xs text-[var(--negative-text)]">
              {errors.side.message}
            </p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Quantity
          <Input step="0.0001" type="number" {...form.register('quantity')} />
          <p
            className={classNames(
              'text-xs',
              sellQuantityExceeded
                ? 'text-[var(--negative-text)]'
                : 'text-[var(--text-faint)]',
            )}
          >
            {selectedSide === 'sell'
              ? `Available at that time: ${formatQuantity(selectedFormAssetId, availableToSell)} ${selectedAsset.symbol}`
              : selectedAssetIsTracked
                ? `Precision follows ${selectedAsset.symbol} market increments.`
                : `Using default precision for ${selectedAsset.symbol} until market metadata is available.`}
          </p>
          {errors.quantity?.message ? (
            <p className="text-xs text-[var(--negative-text)]">
              {errors.quantity.message}
            </p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Execution price
          <Input step="0.01" type="number" {...form.register('price')} />
          <p className="text-xs text-[var(--text-faint)]">
            {selectedSnapshot
              ? `Live spot ${formatPrice(selectedSnapshot.price)}`
              : 'Live spot price will appear when market data is available.'}
          </p>
          {errors.price?.message ? (
            <p className="text-xs text-[var(--negative-text)]">
              {errors.price.message}
            </p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Fee paid
          <Input step="0.01" type="number" {...form.register('fee')} />
          {errors.fee?.message ? (
            <p className="text-xs text-[var(--negative-text)]">
              {errors.fee.message}
            </p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)]">
          Executed at
          <Input type="datetime-local" {...form.register('executedAt')} />
          {errors.executedAt?.message ? (
            <p className="text-xs text-[var(--negative-text)]">
              {errors.executedAt.message}
            </p>
          ) : (
            <p className="text-xs text-[var(--text-faint)]">
              Ledger validation uses this timestamp to preserve the order of
              buys and sells.
            </p>
          )}
        </label>

        <label className="space-y-2 text-sm text-[var(--text-secondary)] md:col-span-2">
          Notes
          <Input
            maxLength={160}
            placeholder="Optional trade context, thesis, or execution note."
            {...form.register('note')}
          />
          {errors.note?.message ? (
            <p className="text-xs text-[var(--negative-text)]">
              {errors.note.message}
            </p>
          ) : (
            <p className="text-xs text-[var(--text-faint)]">
              Optional and capped at 160 characters.
            </p>
          )}
        </label>

        <div className="surface-subtle grid gap-4 rounded-2xl p-4 sm:grid-cols-2 md:col-span-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
              Notional
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
              {formatCurrency(notionalValue)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
              Net cash impact
            </p>
            <p
              className={classNames(
                'mt-1 text-lg font-semibold',
                netCashImpact > 0
                  ? 'text-[var(--positive-text)]'
                  : netCashImpact < 0
                    ? 'text-[var(--negative-text)]'
                    : 'text-[var(--text-primary)]',
              )}
            >
              {formatSignedCurrency(netCashImpact)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 xs:flex-row xs:flex-wrap md:col-span-2">
          <Button
            className="w-full xs:w-auto"
            disabled={sellQuantityExceeded}
            type="submit"
          >
            {editingTransaction ? 'Save changes' : 'Add transaction'}
          </Button>
          {editingTransaction ? (
            <Button
              className="w-full xs:w-auto"
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
