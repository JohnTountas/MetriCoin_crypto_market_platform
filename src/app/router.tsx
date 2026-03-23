import type { ComponentType } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AppShell } from '@/app/layout/AppShell';
import { RouteSkeleton } from '@/shared/components/feedback/RouteSkeleton';

const lazyImport = <T extends { default: ComponentType }>(factory: () => Promise<T>) =>
  factory().then((module) => ({ Component: module.default }));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        lazy: () => lazyImport(() => import('@/pages/DashboardPage')),
      },
      {
        path: 'markets',
        lazy: () => lazyImport(() => import('@/pages/MarketsPage')),
      },
      {
        path: 'markets/:assetId',
        lazy: () => lazyImport(() => import('@/pages/CoinDetailsPage')),
      },
      {
        path: 'portfolio',
        lazy: () => lazyImport(() => import('@/pages/PortfolioPage')),
      },
      {
        path: 'transactions',
        lazy: () => lazyImport(() => import('@/pages/TransactionsPage')),
      },
      {
        path: 'watchlist',
        lazy: () => lazyImport(() => import('@/pages/WatchlistPage')),
      },
      {
        path: 'settings',
        lazy: () => lazyImport(() => import('@/pages/SettingsPage')),
      },
      {
        path: '*',
        lazy: () => lazyImport(() => import('@/pages/NotFoundPage')),
      },
    ],
  },
]);

export const routerFallback = <RouteSkeleton />;
