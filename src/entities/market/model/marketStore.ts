import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { ASSET_LOOKUP, DEFAULT_ASSET_ID } from '@/shared/constants';
import type {
  MarketSnapshot,
  MarketTickerMessage,
  StreamConnectionStatus,
  Timeframe,
} from '@/shared/types';

type MarketState = {
  selectedAssetId: string;
  activeTimeframe: Timeframe;
  snapshots: Record<string, MarketSnapshot>;
  connectionStatus: StreamConnectionStatus;
  lastError?: string;
  setSelectedAssetId: (selectedAssetId: string) => void;
  setActiveTimeframe: (timeframe: Timeframe) => void;
  setConnectionStatus: (connectionStatus: StreamConnectionStatus) => void;
  setLastError: (lastError?: string) => void;
  bootstrapSnapshots: (snapshots: MarketSnapshot[]) => void;
  ingestTickerBatch: (messages: MarketTickerMessage[]) => void;
};

const createFallbackSnapshot = (assetId: string, price: number, lastUpdated: number): MarketSnapshot => {
  const asset = ASSET_LOOKUP[assetId];

  return {
    assetId,
    price,
    change24h: 0,
    changePercent24h: 0,
    volume24h: 0,
    high24h: price,
    low24h: price,
    open24h: price,
    marketCap: asset?.circulatingSupply ? asset.circulatingSupply * price : undefined,
    bid: undefined,
    ask: undefined,
    spread: undefined,
    lastUpdated,
    direction: 'flat',
  };
};

export const useMarketStore = create<MarketState>()(
  persist(
    (set) => ({
      selectedAssetId: DEFAULT_ASSET_ID,
      activeTimeframe: '24H',
      snapshots: {},
      connectionStatus: 'idle',
      lastError: undefined,
      setSelectedAssetId: (selectedAssetId) => set({ selectedAssetId }),
      setActiveTimeframe: (activeTimeframe) => set({ activeTimeframe }),
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
      setLastError: (lastError) => set({ lastError }),
      bootstrapSnapshots: (incomingSnapshots) =>
        set((state) => ({
          snapshots: incomingSnapshots.reduce<Record<string, MarketSnapshot>>((accumulator, snapshot) => {
            const previous = state.snapshots[snapshot.assetId];
            accumulator[snapshot.assetId] = {
              ...snapshot,
              direction:
                previous && snapshot.price > previous.price
                  ? 'up'
                  : previous && snapshot.price < previous.price
                    ? 'down'
                    : 'flat',
            };
            return accumulator;
          }, { ...state.snapshots }),
        })),
      ingestTickerBatch: (messages) =>
        set((state) => {
          const snapshots = { ...state.snapshots };

          messages.forEach((message) => {
            const currentSnapshot =
              snapshots[message.assetId] ??
              createFallbackSnapshot(message.assetId, message.price, message.lastUpdated);
            const nextSnapshot: MarketSnapshot = {
              ...currentSnapshot,
              price: message.price,
              bid: message.bid ?? currentSnapshot.bid,
              ask: message.ask ?? currentSnapshot.ask,
              spread:
                message.bid !== undefined && message.ask !== undefined
                  ? message.ask - message.bid
                  : currentSnapshot.spread,
              volume24h: message.volume24h ?? currentSnapshot.volume24h,
              change24h: message.price - currentSnapshot.open24h,
              changePercent24h:
                currentSnapshot.open24h === 0
                  ? 0
                  : ((message.price - currentSnapshot.open24h) / currentSnapshot.open24h) * 100,
              marketCap: ASSET_LOOKUP[message.assetId]?.circulatingSupply
                ? message.price * (ASSET_LOOKUP[message.assetId]?.circulatingSupply ?? 0)
                : currentSnapshot.marketCap,
              lastUpdated: message.lastUpdated,
              direction:
                message.price > currentSnapshot.price
                  ? 'up'
                  : message.price < currentSnapshot.price
                    ? 'down'
                    : 'flat',
            };

            snapshots[message.assetId] = nextSnapshot;
          });

          return { snapshots };
        }),
    }),
    {
      name: 'metricoin-market',
      partialize: (state) => ({
        selectedAssetId: state.selectedAssetId,
        activeTimeframe: state.activeTimeframe,
      }),
    },
  ),
);
