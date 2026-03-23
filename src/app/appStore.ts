import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ThemePreference, Toast } from '@/shared/types/app';

type AppState = {
  themePreference: ThemePreference;
  favoriteAssetIds: string[];
  commandPaletteOpen: boolean;
  mobileNavOpen: boolean;
  toasts: Toast[];
  setThemePreference: (themePreference: ThemePreference) => void;
  toggleFavoriteAsset: (assetId: string) => void;
  setCommandPaletteOpen: (commandPaletteOpen: boolean) => void;
  setMobileNavOpen: (mobileNavOpen: boolean) => void;
  pushToast: (toast: Omit<Toast, 'id'> & { id?: string }) => void;
  dismissToast: (toastId: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themePreference: 'system',
      favoriteAssetIds: ['BTC-USD', 'ETH-USD', 'SOL-USD'],
      commandPaletteOpen: false,
      mobileNavOpen: false,
      toasts: [],
      setThemePreference: (themePreference) => set({ themePreference }),
      toggleFavoriteAsset: (assetId) =>
        set((state) => ({
          favoriteAssetIds: state.favoriteAssetIds.includes(assetId)
            ? state.favoriteAssetIds.filter((item) => item !== assetId)
            : [...state.favoriteAssetIds, assetId],
        })),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      pushToast: (toast) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            {
              ...toast,
              id: toast.id ?? crypto.randomUUID(),
            },
          ],
        })),
      dismissToast: (toastId) =>
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== toastId),
        })),
    }),
    {
      name: 'metasignal-app',
      partialize: (state) => ({
        themePreference: state.themePreference,
        favoriteAssetIds: state.favoriteAssetIds,
      }),
    },
  ),
);
