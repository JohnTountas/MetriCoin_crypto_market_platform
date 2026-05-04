// PortfolioPage is the full local-first workspace for holdings, allocation, imports, and history.
// It stitches together several portfolio features but keeps the underlying domain logic elsewhere.
import { Helmet } from 'react-helmet-async';

import {
  PortfolioCsvImportPanel,
  PortfolioPerformancePanel,
  PortfolioPositionsGrid,
  PortfolioTransactionForm,
  PortfolioTransactionHistory,
} from '@/entities/portfolio';
import { PortfolioSummaryGrid } from '@/features/dashboard';
import { usePortfolioOverview } from '@/hooks/portfolio/usePortfolioOverview';
import { Card, PortfolioAllocationChart, SectionHeading } from '@/shared';

const PortfolioPage = () => {
  const { summary, positions, bestPerformer, worstPerformer } =
    usePortfolioOverview();

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Portfolio | Metricoin</title>
      </Helmet>

      <PortfolioSummaryGrid
        bestPerformer={bestPerformer}
        summary={summary}
        worstPerformer={worstPerformer}
      />

      <PortfolioPerformancePanel />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <PortfolioPositionsGrid positions={positions} />
        <Card className="surface p-4 sm:p-5">
          <SectionHeading
            eyebrow="Allocation"
            title="Live portfolio mix"
            description="Current exposure distribution across your tracked crypto sleeve."
          />
          <div className="mt-6">
            <PortfolioAllocationChart positions={positions} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-6">
          <PortfolioCsvImportPanel />
          <PortfolioTransactionForm />
        </div>
        <PortfolioTransactionHistory />
      </div>
    </div>
  );
};

export default PortfolioPage;
