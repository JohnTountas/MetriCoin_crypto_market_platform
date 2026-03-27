import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  CalculatorSettings,
  PortfolioTransaction,
  PriceAlert,
} from '@/shared/types';

import { defaultPortfolioSettings, samplePriceAlerts, sampleTransactions } from './portfolioFixtures';

type PortfolioState = {
  transactions: PortfolioTransaction[];
  alerts: PriceAlert[];
  settings: CalculatorSettings;
  editingTransactionId?: string;
  addTransaction: (transactionInput: Omit<PortfolioTransaction, 'id'>) => void;
  updateTransaction: (transactionId: string, transactionInput: Omit<PortfolioTransaction, 'id'>) => void;
  deleteTransaction: (transactionId: string) => void;
  setEditingTransactionId: (transactionId?: string) => void;
  addAlert: (newAlert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void;
  deleteAlert: (alertId: string) => void;
  markAlertTriggered: (alertId: string) => void;
  resetAlerts: () => void;
  setSettings: (settingsPatch: Partial<CalculatorSettings>) => void;
  restoreSamplePortfolio: () => void;
  clearPortfolioData: () => void;
};

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      transactions: sampleTransactions,
      alerts: samplePriceAlerts,
      settings: defaultPortfolioSettings,
      editingTransactionId: undefined,
      addTransaction: (transactionInput) =>
        set((state) => ({
          transactions: [
            {
              ...transactionInput,
              id: crypto.randomUUID(),
            },
            ...state.transactions,
          ],
          editingTransactionId: undefined,
        })),
      updateTransaction: (transactionId, transactionInput) =>
        set((state) => ({
          transactions: state.transactions.map((existingTransaction) =>
            existingTransaction.id === transactionId
              ? { ...transactionInput, id: transactionId }
              : existingTransaction,
          ),
          editingTransactionId: undefined,
        })),
      deleteTransaction: (transactionId) =>
        set((state) => ({
          transactions: state.transactions.filter((transaction) => transaction.id !== transactionId),
        })),
      setEditingTransactionId: (editingTransactionId) => set({ editingTransactionId }),
      addAlert: (newAlert) =>
        set((state) => ({
          alerts: [
            {
              ...newAlert,
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
      setSettings: (settingsPatch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...settingsPatch,
          },
        })),
      restoreSamplePortfolio: () =>
        set({
          transactions: sampleTransactions,
          alerts: samplePriceAlerts,
          editingTransactionId: undefined,
        }),
      clearPortfolioData: () =>
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


