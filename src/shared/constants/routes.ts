// Central route map plus navigation metadata for the main product surfaces.
// Keeping paths here makes refactors safer than scattering string literals through the UI.
export const ROUTES = {
  dashboard: '/',
  markets: '/markets',
  coinDetails: '/markets/:assetId',
  portfolio: '/portfolio',
  transactions: '/transactions',
  watchlist: '/watchlist',
  settings: '/settings',
} as const;

export const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.dashboard },
  { label: 'Markets', path: ROUTES.markets },
  { label: 'Portfolio', path: ROUTES.portfolio },
  { label: 'Transactions', path: ROUTES.transactions },
  { label: 'Watchlist', path: ROUTES.watchlist },
  { label: 'Settings', path: ROUTES.settings },
];
