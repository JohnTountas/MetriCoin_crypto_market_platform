import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { DashboardHero } from '@/features/dashboard/ui/DashboardHero';
import type { MarketSnapshot } from '@/shared/types/market';
import type { PortfolioSummary } from '@/shared/types/portfolio';

const snapshot: MarketSnapshot = {
  assetId: 'BTC-USD',
  price: 88_500,
  change24h: 1_850,
  changePercent24h: 2.13,
  volume24h: 24_000_000_000,
  high24h: 89_100,
  low24h: 85_900,
  open24h: 86_650,
  marketCap: 1_760_000_000_000,
  bid: 88_498,
  ask: 88_501,
  spread: 3,
  lastUpdated: Date.now(),
  direction: 'up',
};

const summary: PortfolioSummary = {
  investedCapital: 52_000,
  currentValue: 61_400,
  unrealizedPnL: 9_400,
  roiPercent: 18.08,
  totalFeesPaid: 164,
  breakEvenValue: 53_100,
  exposureCount: 3,
};

describe('DashboardHero', () => {
  it('renders live market and portfolio context', () => {
    render(
      <MemoryRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <DashboardHero
          assetId="BTC-USD"
          snapshot={snapshot}
          summary={summary}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Premium crypto market intelligence with live portfolio math/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/\$88,500\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/\$61,400\.00/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open portfolio/i })).toBeInTheDocument();
  });
});
