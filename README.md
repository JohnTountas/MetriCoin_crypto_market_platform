# Metricoin

Metricoin is a premium Bitcoin-first crypto market dashboard built with React, Vite, TypeScript, TanStack Query, Zustand, Tailwind CSS, React Hook Form, Zod, and Lightweight Charts. The app is designed to feel like a polished trading terminal rather than a tutorial demo, with real-time market streaming, live portfolio calculations, responsive layouts, theme support, alerts, and portfolio-quality visual polish.

## Highlights

- Real-time websocket market updates with reconnect handling and connection status badges
- Metricoin uses a Bitcoin-first dashboard architecture that scales cleanly to more assets
- Decimal-based portfolio math for cost basis, PnL, ROI, break-even, allocation, and fee impact
- React Router route split across Dashboard, Markets, Coin Details, Portfolio, Transactions, Watchlist, Settings, and 404
- TanStack Query for REST market data, Zustand for app and portfolio state, React Hook Form + Zod for typed forms
- Premium dark-first design with light/system theme support, ticker strip, toasts, command palette, skeletons, and empty states
- Unit tests with Vitest + React Testing Library and Playwright e2e smoke coverage

## Stack

- React 18
- Vite 6
- TypeScript
- React Router
- TanStack Query
- Zustand
- Tailwind CSS
- React Hook Form
- Zod
- Lightweight Charts
- ESLint + Prettier
- Vitest + React Testing Library
- Playwright

## Project structure

```text
src/
  api/
    core/
    market/
  app/
    App.tsx
    appStore.ts
    layout/
    providers/
  entities/
    market/
      model/
    portfolio/
      model/
      ui/
  features/
    coin-details/
      ui/
    dashboard/
      ui/
    markets/
      ui/
    settings/
      ui/
    watchlist/
      ui/
  hooks/
    app/
    market/
    portfolio/
    shared/
  pages/
  shared/
    components/
    constants/
    lib/
    types/
  test/
    setup/
    unit/
e2e/
```

## Architecture decisions

### 1. Domain boundaries first

- `entities/market` owns external market providers, REST normalization, websocket streaming, and live market store state.
- `entities/portfolio` owns transactions, alerts, calculator settings, and all reusable portfolio math.
- `features/*` compose domain data into product surfaces without duplicating core business logic.
- `pages/*` stay thin and mostly handle route composition and metadata.

### 2. Right state in the right place

- TanStack Query handles REST-driven market overview and candle series.
- Zustand stores app preferences, favorites, toasts, command palette state, market snapshots, and portfolio state.
- React Hook Form + Zod handle local form workflows for transactions, alerts, and settings.

### 3. Provider abstraction

- `marketProvider` hides whether data comes from Coinbase or the built-in mock provider.
- REST and websocket logic are separated cleanly, so swapping providers later is straightforward.
- All API concerns now live under `src/api`, grouped by domain for easier debugging.

### 4. Centralized hooks

- Shared app, market, and portfolio hooks are centralized in `src/hooks`.
- This keeps data access and side-effect entry points easy to discover without hunting across feature folders.

### 5. Calculation engine

- Portfolio math uses `decimal.js` to avoid brittle floating-point behavior.
- Cost basis, fee tracking, unrealized PnL, ROI, allocation, and break-even logic are centralized in `entities/portfolio/model/calculations.ts`.

### 6. Production-minded UX

- Dark/light/system theming
- Reconnection toasts
- Alert monitor tied to live price stream
- Route-based code splitting
- Loading skeletons and empty states
- Command palette with `Ctrl/Cmd + K`

## Data providers

### Live mode

- REST: Coinbase Exchange product endpoints
- WebSocket: Coinbase Exchange ticker feed

### Mock mode

- Enable `VITE_USE_MOCK_DATA=true`
- Useful for demos, tests, and local development without depending on live external feeds

## Environment variables

Copy `.env.example` to `.env.local` if you want to customize providers.

```bash
VITE_USE_MOCK_DATA=false
VITE_MARKET_REST_URL=https://api.exchange.coinbase.com
VITE_MARKET_WS_URL=wss://ws-feed.exchange.coinbase.com
```

## Setup

```bash
npm install
npm run dev
```

## Available scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run type-check
npm run test
npm run test:e2e
npm run format
```

## Important reusable pieces

- `src/api/market/marketSocket.ts`: typed websocket streaming with reconnection and batched updates
- `src/api/market/marketRest.ts`: normalized REST market snapshots and candle series
- `src/hooks/market/useMarketStream.ts`: live websocket lifecycle orchestration for the app shell
- `src/hooks/portfolio/usePortfolioMetrics.ts`: centralized portfolio-derived state composition
- `src/entities/portfolio/model/calculations.ts`: centralized Decimal-based portfolio engine
- `src/entities/portfolio/model/portfolioStore.ts`: persistent portfolio, alerts, and settings state
- `src/shared/components/charts/MarketPriceChart.tsx`: professional chart wrapper for area/candle rendering
- `src/app/layout/AppShell.tsx`: global shell, theme sync, command palette, toasts, and market initialization

## Testing

- `src/test/unit/portfolio-calculations.test.ts` validates the core math engine
- `src/test/unit/dashboard-hero.test.tsx` checks critical dashboard rendering
- `e2e/dashboard.spec.ts` gives a Playwright smoke flow over dashboard and markets routes

## Deployment notes

Any static host that supports Vite builds will work:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages with a static deployment workflow

Deployment flow:

1. Set the Vite environment variables.
2. Run `npm run build`.
3. Deploy the `dist/` folder.

## Verification completed locally

- Production build: `npm run build`
- Lint: `npm run lint`

The app is ready for local development and portfolio presentation, with mock mode available for stable demos and test runs.
