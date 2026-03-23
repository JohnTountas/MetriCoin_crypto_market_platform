import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  CalculatorSettings,
  PortfolioTransaction,
  PriceAlert,
} from '@/shared/types';

import { defaultCalculatorSettings, demoAlerts, demoTransactions } from './fixtures';

type PortfolioState = {
  transactions: PortfolioTransaction[];
  alerts: PriceAlert[];
  settings: CalculatorSettings;
  editingTransactionId?: string;
  addTransaction: (transaction: Omit<PortfolioTransaction, 'id'>) => void;
  updateTransaction: (transactionId: string, transaction: Omit<PortfolioTransaction, 'id'>) => void;
  deleteTransaction: (transactionId: string) => void;
  startEditingTransaction: (transactionId?: string) => void;
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void;
  deleteAlert: (alertId: string) => void;
  markAlertTriggered: (alertId: string) => void;
  resetAlerts: () => void;
  setSettings: (settings: Partial<CalculatorSettings>) => void;
  seedDemoPortfolio: () => void;
  clearPortfolio: () => void;
};

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      transactions: demoTransactions,
      alerts: demoAlerts,
      settings: defaultCalculatorSettings,
      editingTransactionId: undefined,
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            {
              ...transaction,
              id: crypto.randomUUID(),
            },
            ...state.transactions,
          ],
          editingTransactionId: undefined,
        })),
      updateTransaction: (transactionId, transaction) =>
        set((state) => ({
          transactions: state.transactions.map((existingTransaction) =>
            existingTransaction.id === transactionId
              ? { ...transaction, id: transactionId }
              : existingTransaction,
          ),
          editingTransactionId: undefined,
        })),
      deleteTransaction: (transactionId) =>
        set((state) => ({
          transactions: state.transactions.filter((transaction) => transaction.id !== transactionId),
        })),
      startEditingTransaction: (editingTransactionId) => set({ editingTransactionId }),
      addAlert: (alert) =>
        set((state) => ({
          alerts: [
            {
              ...alert,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              triggered: false,
            },
            ...state.alerts,
          ],
        })),
      deleteAlert: (alertId) =>
        set((state) => ({
          alerts: state.alerts.filter((alert) => alert.id !== alertId),
        })),
      markAlertTriggered: (alertId) =>
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === alertId ? { ...alert, triggered: true } : alert,
          ),
        })),
      resetAlerts: () =>
        set((state) => ({
          alerts: state.alerts.map((alert) => ({ ...alert, triggered: false })),
        })),
      setSettings: (settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings,
          },
        })),
      seedDemoPortfolio: () =>
        set({
          transactions: demoTransactions,
          alerts: demoAlerts,
        }),
      clearPortfolio: () =>
        set({
          transactions: [],
          alerts: [],
          editingTransactionId: undefined,
        }),
    }),
    {
      name: 'metricoin-portfolio',
    },
  ),
);
