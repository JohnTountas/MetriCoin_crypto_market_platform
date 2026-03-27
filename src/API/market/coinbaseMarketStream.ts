import type { MarketTickerMessage } from '@/shared/types';

import type { MarketStream, MarketStreamHandlers } from './marketDataProvider';
import { coinbaseWsErrorSchema, coinbaseWsTickerMessageSchema } from './coinbaseMarketSchemas';

export const createCoinbaseMarketStream = (
  assetIds: string[],
  handlers: MarketStreamHandlers,
): MarketStream => {
  let socket: WebSocket | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;
  let reconnectAttempt = 0;
  let manuallyClosed = false;
  let flushHandle = 0;
  const pendingMessages = new Map<string, MarketTickerMessage>();

  const flushPendingMessages = () => {
    flushHandle = 0;
    if (pendingMessages.size === 0) return;
    handlers.onBatch(Array.from(pendingMessages.values()));
    pendingMessages.clear();
  };

  const scheduleFlush = () => {
    if (flushHandle !== 0) return;
    flushHandle = window.requestAnimationFrame(flushPendingMessages);
  };

  const connect = () => {
    handlers.onStatus(reconnectAttempt > 0 ? 'reconnecting' : 'connecting');
    socket = new WebSocket('wss://ws-feed.exchange.coinbase.com');

    socket.addEventListener('open', () => {
      reconnectAttempt = 0;
      handlers.onStatus('connected');
      socket?.send(
        JSON.stringify({
          type: 'subscribe',
          product_ids: assetIds,
          channels: ['ticker'],
        }),
      );
    });

    socket.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(event.data as string) as unknown;
        const tickerCandidate = coinbaseWsTickerMessageSchema.safeParse(payload);
        if (tickerCandidate.success) {
          pendingMessages.set(tickerCandidate.data.product_id, {
            assetId: tickerCandidate.data.product_id,
            price: Number(tickerCandidate.data.price),
            bid: tickerCandidate.data.best_bid ? Number(tickerCandidate.data.best_bid) : undefined,
            ask: tickerCandidate.data.best_ask ? Number(tickerCandidate.data.best_ask) : undefined,
            volume24h: tickerCandidate.data.volume_24h
              ? Number(tickerCandidate.data.volume_24h)
              : undefined,
            lastUpdated: tickerCandidate.data.time
              ? Date.parse(tickerCandidate.data.time)
              : Date.now(),
          });
          scheduleFlush();
          return;
        }

        const errorCandidate = coinbaseWsErrorSchema.safeParse(payload);
        if (errorCandidate.success) {
          handlers.onError(errorCandidate.data.message ?? 'The market stream provider returned an error.');
        }
      } catch {
        handlers.onError('Unable to parse websocket payload.');
      }
    });

    socket.addEventListener('close', () => {
      handlers.onStatus(manuallyClosed ? 'disconnected' : 'reconnecting');
      if (!manuallyClosed) {
        reconnectAttempt += 1;
        const delay = Math.min(15_000, 1_000 * 2 ** reconnectAttempt);
        reconnectTimeout = setTimeout(connect, delay);
      }
    });

    socket.addEventListener('error', () => {
      handlers.onStatus('error');
      handlers.onError('Live market stream encountered a network issue.');
      socket?.close();
    });
  };

  return {
    connect: () => {
      manuallyClosed = false;
      connect();
    },
    disconnect: () => {
      manuallyClosed = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (flushHandle !== 0) {
        window.cancelAnimationFrame(flushHandle);
      }
      socket?.close();
    },
  };
};

