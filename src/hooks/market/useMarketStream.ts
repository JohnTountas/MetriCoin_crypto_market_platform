import { startTransition, useEffect, useRef } from 'react';

import { marketProvider } from '@/API';
import { useAppStore } from '@/app';
import { useMarketStore } from '@/entities';
import { TRACKED_ASSETS } from '@/shared/constants';
import type { StreamConnectionStatus } from '@/shared/types';

export const useMarketStream = () => {
  const assetIds = TRACKED_ASSETS.map((asset) => asset.id);
  const setConnectionStatus = useMarketStore((state) => state.setConnectionStatus);
  const setLastError = useMarketStore((state) => state.setLastError);
  const ingestTickerBatch = useMarketStore((state) => state.ingestTickerBatch);
  const previousStatusRef = useRef<StreamConnectionStatus>('idle');

  useEffect(() => {
    const stream = marketProvider.createStream(assetIds, {
      onBatch: (messages) => {
        startTransition(() => {
          ingestTickerBatch(messages);
        });
      },
      onStatus: (status) => {
        setConnectionStatus(status);

        if (status === 'connected' && previousStatusRef.current === 'reconnecting') {
          useAppStore.getState().pushToast({
            title: 'Live stream restored',
            description: 'Real-time pricing is fully synced again.',
            tone: 'success',
          });
        }

        if (status === 'reconnecting' && previousStatusRef.current === 'connected') {
          useAppStore.getState().pushToast({
            title: 'Reconnecting to market feed',
            description: 'Holding the last known prices while the socket recovers.',
            tone: 'warning',
          });
        }

        previousStatusRef.current = status;
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
  }, [assetIds, ingestTickerBatch, setConnectionStatus, setLastError]);
};
