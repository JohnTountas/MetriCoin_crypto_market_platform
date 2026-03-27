import type { ComponentType } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AppShell } from '@/app/layout';
import { PageLoadingSkeleton } from '@/shared';

const loadRoute = <T extends { default: ComponentType }>(importPage: () => Promise<T>) => () =>
  importPage().then(({ default: Component }) => ({ Component }));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        lazy: loadRoute(() => import('@/pages/DashboardPage')),
      },
      {
        path: 'markets',
        lazy: loadRoute(() => import('@/pages/MarketsPage')),
      },
      {
        path: 'markets/:assetId',
        lazy: loadRoute(() => import('@/pages/AssetDetailsPage')),
      },
      {
        path: 'portfolio',
        lazy: loadRoute(() => import('@/pages/PortfolioPage')),
      },
      {
        path: 'transactions',
        lazy: loadRoute(() => import('@/pages/TransactionsPage')),
      },
      {
        path: 'watchlist',
        lazy: loadRoute(() => import('@/pages/WatchlistPage')),
      },
      {
        path: 'settings',
        lazy: loadRoute(() => import('@/pages/SettingsPage')),
      },
      {
        path: '*',
        lazy: loadRoute(() => import('@/pages/NotFoundPage')),
      },
    ],
  },
]);

export const routerFallback = <PageLoadingSkeleton />;


