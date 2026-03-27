import { startTransition, useEffect, useRef } from 'react';

import { activeMarketDataProvider } from '@/api/market';
import { useAppStore } from '@/app';
import { useMarketStore } from '@/entities/market';
import { TRACKED_ASSETS } from '@/shared/constants';
import type { StreamConnectionStatus } from '@/shared/types';

const STREAM_ASSET_IDS = TRACKED_ASSETS.map((asset) => asset.id);

export const useMarketTickerStream = () => {
  const setConnectionStatus = useMarketStore((state) => state.setConnectionStatus);
  const setLastError = useMarketStore((state) => state.setLastError);
  const ingestTickerBatch = useMarketStore((state) => state.ingestTickerBatch);
  const previousConnectionStatusRef = useRef<StreamConnectionStatus>('idle');

  useEffect(() => {
    const stream = activeMarketDataProvider.createStream(STREAM_ASSET_IDS, {
      onBatch: (messages) => {
        startTransition(() => {
          ingestTickerBatch(messages);
        });
      },
      onStatus: (status) => {
        setConnectionStatus(status);

        if (status === 'connected' && previousConnectionStatusRef.current === 'reconnecting') {
          useAppStore.getState().pushToast({
            title: 'Live stream restored',
            description: 'Real-time pricing is fully synced again.',
            tone: 'success',
          });
        }

        if (status === 'reconnecting' && previousConnectionStatusRef.current === 'connected') {
          useAppStore.getState().pushToast({
            title: 'Reconnecting to market feed',
            description: 'Holding the last known prices while the socket recovers.',
            tone: 'warning',
          });
        }

        previousConnectionStatusRef.current = status;
      },
      onError: (message) => {
        setLastError(message);
        useAppStore.getState().pushToast({
          title: 'Live stream issue',
          description: message,
          tone: 'error',
        });
      },
    });

    stream.connect();
    return () => stream.disconnect();
  }, [ingestTickerBatch, setConnectionStatus, setLastError]);
};

