# Metricoin

Metricoin is a crypto market intelligence workspace built as a product-quality frontend application with a deliberately small local backend. It combines live market monitoring, portfolio analytics, alerting, workspace portability, and operational visibility in a single codebase.

The project is designed to demonstrate more than UI polish. It shows how a modern React application can be structured around clear domain boundaries, reliable financial calculations, lightweight backend support, and practical testing.

## Project Overview

Metricoin is best understood as a local-first analytics and portfolio workspace, not a trading engine. The browser owns the user-facing portfolio, watchlist, and preferences, while a compact Node.js operations server supports the workflows that benefit from backend responsibility, such as alert delivery, notification persistence, and telemetry capture.

From a product perspective, the app is organized around seven main surfaces:

- Dashboard for live market context, portfolio rollups, alerts, and watchlist visibility
- Markets for browsing the tracked crypto universe with live spot, 24h movement, volume, and spread context
- Asset details for charting, price analytics, market context, and asset-specific portfolio activity
- Portfolio for open positions, allocation, historical performance, CSV import, and transaction entry
- Transactions for managing the portfolio ledger with edit and delete flows
- Watchlist for pinned assets and price trigger management
- Settings for portfolio assumptions, workspace import/export, theme preferences, and operations monitoring

## What The Application Does

- Streams live market updates for supported USD-denominated crypto pairs
- Bootstraps market snapshots and historical candles through a provider abstraction
- Tracks portfolio transactions with fee-aware and slippage-aware calculations
- Computes open positions, cost basis, unrealized PnL, ROI, allocation, and break-even levels
- Prevents invalid sell activity by validating the transaction ledger over time
- Imports portfolio activity from CSV with header alias support and row validation
- Reconstructs historical portfolio value from ledger events plus market candles
- Lets users create above/below price triggers and re-arm or remove them later
- Syncs local alerts to a local ops server for background monitoring and delivery
- Stores a server-backed in-app notification feed and supports optional webhook forwarding
- Captures lightweight product analytics and browser-side error telemetry
- Exports and restores versioned workspace snapshots
- Persists portfolio state, favorites, and theme preferences between sessions
- Supports keyboard-driven search, responsive navigation, and light/dark/system theming

## Architecture

Metricoin is intentionally split into two runtime layers.

### Frontend application

The frontend is a React single-page application built with Vite and TypeScript. It handles:

- route composition and page rendering
- real-time market presentation
- portfolio state management
- form workflows and validation
- client-side alert evaluation
- local persistence for user-owned state

The frontend follows a domain-oriented structure:

- `src/api` contains external and internal API clients plus runtime configuration
- `src/app` contains bootstrap code, providers, layout, global UI state, and workspace snapshot utilities
- `src/entities` contains market and portfolio domain logic
- `src/features` contains page-level product panels assembled from entities
- `src/pages` keeps route components thin and composition-focused
- `src/shared` contains reusable UI, constants, utilities, and types

### Backend application

### Local ops server

The backend is a lightweight Node.js server implemented with native modules instead of a larger framework. It is intentionally small, but it has meaningful responsibility:

- mirrors client-defined alerts so monitoring can continue outside the watchlist surface
- evaluates alerts against live market prices
- stores recent notifications for the UI inbox
- persists notification delivery settings
- accepts analytics and error telemetry from the client
- exposes health and summary data for the settings panel

Server persistence is file-based rather than database-backed. Runtime data is stored as JSON in the ignored `server/data/` area so the project remains simple to run locally while still demonstrating backend persistence patterns.

### Data ownership model

One of the strongest architectural choices in the repo is the separation of ownership:

- the browser is the source of truth for transactions, portfolio settings, favorites, theme preference, and alert definitions
- the ops server mirrors alerts and owns server-side deliveries, persisted notifications, and telemetry history
- market data comes from a provider abstraction that can switch between live market sources and mock data

That split keeps the product easy to run locally while still showing realistic client/server coordination.

## Technology Stack

| Area                           | Technologies                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------- |
| Frontend                       | React 18, TypeScript, Vite 6                                                 |
| Routing and metadata           | React Router, React Helmet Async                                             |
| Server state and data fetching | TanStack Query, React Query Devtools in development                          |
| Client state and persistence   | Zustand with persisted stores                                                |
| Forms and validation           | React Hook Form, Zod, `@hookform/resolvers`                                  |
| Financial calculation layer    | `decimal.js` for precise arithmetic                                          |
| Styling                        | Tailwind CSS, PostCSS, Autoprefixer, custom design tokens in CSS             |
| Visualization                  | `lightweight-charts` for asset and portfolio charting                        |
| Icons and UI polish            | `lucide-react`                                                               |
| Local backend                  | Node.js ESM with native `http`, `fs`, `url`, and timer-based background work |
| Testing                        | Vitest, React Testing Library, Playwright                                    |
| Code quality                   | ESLint, Prettier, `prettier-plugin-tailwindcss`                              |

## Market Data And External Integrations

The application uses a provider abstraction rather than hard-coding market behavior directly into the UI. In practice, that means:

- live mode can load supported assets from the active market provider
- the same provider fetches market snapshots and historical candles
- a streaming channel delivers real-time ticker updates
- mock mode can replace the live provider for demos, smoke tests, or isolated development

The tracked asset catalog is broader than a single-coin demo and is filtered against provider support when live mode is enabled. If a live lookup fails, the app falls back gracefully where possible instead of collapsing the whole experience.

## Servers And Runtime Services

There are effectively three runtime roles in the project:

### 1. Frontend development/build server

Used during local development and production preview. It serves the React application, handles bundling, and proxies app-to-server communication in development.

### 2. Browser application runtime

This is where most product logic lives:

- live dashboards
- transaction workflows
- local alert state
- workspace preferences
- chart rendering
- command palette and toasts

### 3. Local ops server

This process exists to support operational features that are awkward or unreliable when left only in browser memory:

- mirrored alert monitoring
- notification persistence
- telemetry storage
- optional webhook-based alert forwarding
- operational health visibility

The repository also includes helper scripts that launch the app stack together for normal development and for Playwright-based end-to-end testing.

## Persistence Strategy

Metricoin uses a layered persistence model:

- market UI preferences such as selected asset and timeframe are persisted in the browser
- portfolio transactions, alerts, and calculator settings are persisted in the browser
- favorite assets and theme preference are persisted in the browser
- notification settings, server notifications, alert delivery history, and telemetry are persisted by the ops server in local JSON storage

This gives the project a realistic split between user-owned local state and server-owned operational state without requiring a full database setup.

## Key Product Features

### Live market experience

- real-time ticker updates with reconnect handling and status awareness
- snapshot bootstrapping for tracked assets
- per-asset analytics views with selectable timeframes
- area and candlestick chart modes
- market table with price, change, volume, spread, and update context

### Portfolio intelligence

- transaction ledger with add, edit, and delete flows
- fee-aware and slippage-aware cost basis calculations
- open position cards with PnL, ROI, allocation, and break-even values
- transaction activity summaries and portfolio rollups
- historical portfolio reconstruction from ledger plus price history
- CSV import support for trade history, including common header aliases and ledger validation

### Alerts and watchlist workflows

- favorite asset watchlist
- quick asset search through a global command palette
- configurable above/below price triggers
- client-side alert monitoring tied to live prices
- server-side mirrored alert monitoring for persisted delivery behavior
- re-arm and cleanup flows for triggered alerts

### Operations and observability

- in-app visibility into server health
- persisted notification inbox
- telemetry summary for analytics and captured client errors
- optional webhook delivery support for alert events
- notification settings managed from the UI

### Workspace portability

- sample/demo portfolio reset
- versioned workspace snapshot export
- validated workspace snapshot import
- snapshot coverage for transactions, alerts, favorites, theme preference, and calculator assumptions
- backward-compatible snapshot normalization for older exports

## Engineering Details Worth Calling Out

These are the parts of the codebase that make the project especially strong from an engineering perspective:

- Domain-first organization keeps market logic, portfolio logic, and UI composition clearly separated.
- Zod is used across client forms, API contracts, and workspace snapshot validation.
- `decimal.js` is used in money-sensitive calculations to avoid the common floating-point issues that hurt financial tooling.
- The CSV import path reuses ledger validation rules instead of inventing a second set of business rules.
- Historical performance is rebuilt from both transaction events and candle data rather than approximated from current holdings only.
- The local ops server demonstrates backend thinking without introducing unnecessary framework weight.
- The market layer supports both live and mock providers, which improves demo readiness and testability.

## Local Development

### Installation

1. Install dependencies with `npm install`.
2. Start the full local stack with `npm run dev:stack`.

### (Optional)

If you only want one side of the system running, the frontend and the ops server can also be started independently.

- Frontend starts with: 'npm run dev'
- Server starts with: 'npm run server:dev'

## Available Scripts

| Command                | Purpose                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| `npm run dev`          | Start the frontend development server                                  |
| `npm run dev:stack`    | Start the frontend and local ops server together                       |
| `npm run server`       | Start the local ops server                                             |
| `npm run server:dev`   | Start the ops server in watch mode                                     |
| `npm run build`        | Run type-safe production build checks and create the production bundle |
| `npm run preview`      | Preview the built frontend locally                                     |
| `npm run lint`         | Run ESLint across the project                                          |
| `npm run type-check`   | Run TypeScript checks without building                                 |
| `npm run format`       | Format the repository with Prettier                                    |
| `npm run format:check` | Verify formatting without changing files                               |
| `npm run test`         | Run the unit test suite with Vitest                                    |
| `npm run test:watch`   | Run Vitest in watch mode                                               |
| `npm run test:e2e`     | Run Playwright end-to-end tests                                        |

## Environment Configuration

The repo intentionally avoids committing sensitive runtime values. Supported configuration falls into three groups:

- client-side switch between live market data and mock market data
- client-side overrides for the market REST source, streaming source, and app API base path
- server-side listen configuration for the local ops server

### Unit coverage includes

- portfolio calculations
- historical performance reconstruction
- CSV import parsing and validation
- transaction insight and ledger validation logic
- price trigger insight logic
- workspace snapshot export/import behavior
- market asset resolution and route behavior
- selected UI component rendering paths

### End-to-end coverage includes

- dashboard and market navigation smoke coverage
- theme switching stability
- price trigger creation workflow

In my opinion, these tests together cover the most important product flows, domain logic, and regression risks for the current scope of the app.

## Repository Layout

- `src/` - frontend application source
- `server/` - local Node.js operations server and storage helpers
- `e2e/` - Playwright browser tests
- `tools/` - helper scripts for running multi-process local stacks
- `public/` - static frontend assets
- `dist/` - built frontend output

## Why This Project Is Valuable

For developers, Metricoin is a good example of how to structure a medium-sized React codebase around domain logic instead of only pages and components.

It shows:

- strong product thinking beyond static UI work
- practical client/server responsibility splitting
- careful treatment of financial calculations
- typed validation at system boundaries
- real-time data handling
- operational observability features
- test coverage across logic and user flows

In short, Metricoin is a well-scoped engineering project that demonstrates frontend depth, backend awareness, and maintainable product architecture.
