# Metricoin

Metricoin is a premium crypto market intelligence workspace built to showcase production-minded frontend engineering with a lightweight local backend. The project combines a React/Vite trading dashboard with a small Node-based ops server that handles server-side alert delivery, notification persistence, analytics ingestion, and client error monitoring.

The result is not just a market dashboard. It is a portfolio-grade product surface with real-time pricing, typed portfolio calculations, CSV trade import, historical portfolio performance, server-backed alert monitoring, and operational visibility.

## What The Project Does

Metricoin helps a user:

- monitor live crypto market prices and intraday context
- track a portfolio with cost basis, ROI, break-even, and fee-aware calculations
- create price alerts and keep them monitored by a server-side polling process
- import external trades from CSV into the portfolio ledger
- review historical portfolio value over time using ledger positions plus historical candles
- inspect server-side notifications, webhook delivery attempts, analytics events, and captured errors

## Core Product Features

- Real-time Coinbase REST and WebSocket market data
- Bitcoin-first dashboard with expandable multi-asset architecture
- Decimal-based portfolio engine for precise financial math
- Portfolio positions, allocation, transaction history, and alert management
- CSV trade import with validation against the existing ledger
- Historical portfolio performance chart rebuilt from transactions and market candles
- Versioned workspace snapshot export and validated import
- Server-side alert delivery with optional webhook forwarding
- In-app notification feed persisted by the ops server
- Browser error monitoring and lightweight product analytics
- Theme support, command palette, skeletons, and polished UI states

## Architecture

### Frontend

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

### Ops Server

- Node.js HTTP server using native modules
- JSON-backed local persistence under `server/data/`
- Coinbase REST polling for server-side alert delivery
- Telemetry ingestion endpoints for analytics and error tracking
- Notification inbox and webhook delivery management

## Key Technical Ideas

### 1. Domain-first structure

- `api/` owns external and internal API clients
- `entities/market` owns market state and market-specific behavior
- `entities/portfolio` owns transactions, alerts, calculations, CSV import, and performance logic
- `features/` compose domain logic into product-facing panels
- `pages/` stay thin and mostly orchestrate route composition

### 2. Clear split between browser and server responsibilities

- The browser remains the source of truth for user-created alerts and workspace state
- The ops server mirrors alert definitions so it can keep monitoring them in the background
- The browser sends telemetry events, while the server stores and summarizes them
- The browser renders notifications, while the server owns notification persistence and webhook attempts

### 3. Calculation reliability

- `decimal.js` is used for money-sensitive portfolio math
- CSV imports reuse the same ledger validation rules as manual transactions
- Historical performance is derived from both transaction events and historical candle prices

## Project Structure

```text
src/
  api/
    core/
    market/
    operations/
  app/
    layout/
    providers/
    workspaceSnapshot.ts
  entities/
    market/
    portfolio/
      model/
      ui/
  features/
    asset-details/
    dashboard/
    settings/
    watchlist/
  hooks/
    app/
    market/
    portfolio/
    shared/
  pages/
  shared/
    components/
    constants/
    types/
    utils/
  test/
    setup/
    unit/
server/
  data/
  lib/
tools/
e2e/
```

## Internal Server Capabilities

The local ops server is intentionally small but meaningful:

- `GET /api/health`
  Returns server health and current monitoring counts
- `POST /api/alerts/sync`
  Syncs browser alert definitions to the backend
- `GET /api/notifications`
  Returns the latest persisted server notifications
- `GET /api/notification-settings`
  Reads alert polling and webhook settings
- `POST /api/notification-settings`
  Updates delivery settings
- `POST /api/telemetry/events`
  Stores analytics and client error events
- `GET /api/telemetry/summary`
  Returns aggregated operational data for the settings panel

## Environment Variables

Copy `.env.example` to `.env.local` if needed.

```bash
VITE_USE_MOCK_DATA=false
VITE_MARKET_REST_URL=https://api.exchange.coinbase.com
VITE_MARKET_WS_URL=wss://ws-feed.exchange.coinbase.com
VITE_APP_API_BASE_URL=/api
```

Optional server-side values:

```bash
PORT=4174
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the frontend only:

```bash
npm run dev
```

Run the ops server only:

```bash
npm run server:dev
```

Run the full local stack:

```bash
npm run dev:stack
```

## Available Scripts

```bash
npm run dev
npm run dev:stack
npm run server
npm run server:dev
npm run build
npm run preview
npm run lint
npm run type-check
npm run test
npm run test:e2e
npm run format
```

## CSV Import Format

Metricoin accepts CSV headers with common aliases, but the clearest format is:

```csv
asset,side,quantity,price,fee,executedAt,note
BTC-USD,buy,0.25,64000,12,2026-04-10T10:00:00.000Z,Core position
ETH,buy,2,3200,6,2026-04-12T14:30:00.000Z,Rotation add
```

Supported ideas:

- `asset`, `asset_id`, `symbol`, `ticker`
- `executedAt`, `date`, `timestamp`, `time`
- `fee` is optional and defaults to `0`
- raw symbols such as `BTC` are normalized to `BTC-USD`

## Operational Monitoring

The settings page now includes an operations surface where you can:

- confirm whether the ops server is reachable
- inspect recent alert deliveries
- inspect recent client-side errors
- see analytics and notification totals
- enable or disable server-side alert polling
- enable or disable the in-app notification feed
- configure an optional webhook target for alert delivery

## Testing

Verified locally on April 20, 2026:

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:e2e`
- local ops server health check via `GET /api/health`

Playwright smoke tests use a helper stack that runs both the preview server and the ops server together.

## Technologies Used

- React 18 for the UI
- TypeScript for typed application and domain logic
- Vite for development and build tooling
- TanStack Query for async market and ops data
- Zustand for app and portfolio state
- React Hook Form + Zod for validated workflows
- Tailwind CSS for styling
- Lightweight Charts for market and portfolio visualizations
- Node.js native HTTP server for backend operations
- Vitest + React Testing Library for unit tests
- Playwright for browser smoke coverage

## Why This Project Is Strong

Metricoin demonstrates more than component work. It shows:

- real-time data handling
- financial calculation discipline
- backend-backed alert workflows
- operational telemetry thinking
- test coverage over both pure logic and browser flows
- a codebase organized for scale, debugging, and maintenance

## Next Logical Upgrades

If you want to keep pushing this project toward a fuller product, the best next steps are:

- authenticated cloud sync with Supabase or Firebase
- email or SMS delivery providers behind the webhook abstraction
- CSV presets for specific exchanges
- deeper portfolio benchmarks and drawdown analytics
- historical notification audit trails per alert
- multi-user monitoring and shared workspaces
