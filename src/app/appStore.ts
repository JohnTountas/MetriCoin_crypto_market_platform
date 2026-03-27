import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_FAVORITE_ASSET_IDS } from '@/shared/constants';
import type { ThemePreference, Toast } from '@/shared/types';

type AppState = {
  themePreference: ThemePreference;
  favoriteAssetIds: string[];
  commandPaletteOpen: boolean;
  mobileNavOpen: boolean;
  toasts: Toast[];
  setThemePreference: (themePreference: ThemePreference) => void;
  toggleFavoriteAsset: (assetId: string) => void;
  setCommandPaletteOpen: (isCommandPaletteOpen: boolean) => void;
  setMobileNavOpen: (isMobileNavOpen: boolean) => void;
  pushToast: (toast: Omit<Toast, 'id'> & { id?: string }) => void;
  dismissToast: (toastId: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themePreference: 'system',
      favoriteAssetIds: [...DEFAULT_FAVORITE_ASSET_IDS],
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
      setCommandPaletteOpen: (isCommandPaletteOpen) => set({ commandPaletteOpen: isCommandPaletteOpen }),
      setMobileNavOpen: (isMobileNavOpen) => set({ mobileNavOpen: isMobileNavOpen }),
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
      name: 'metricoin-app',
      partialize: (state) => ({
        themePreference: state.themePreference,
        favoriteAssetIds: state.favoriteAssetIds,
      }),
    },
  ),
);
