import { Helmet } from 'react-helmet-async';

import { PortfolioPositionsGrid, PortfolioTransactionForm, PortfolioTransactionHistory } from '@/entities/portfolio';
import { PortfolioSummaryGrid } from '@/features/dashboard';
import { usePortfolioOverview } from '@/hooks/portfolio';
import { PortfolioAllocationChart, Card, SectionHeading } from '@/shared';

const PortfolioPage = () => {
  const { summary, positions, bestPerformer, worstPerformer } = usePortfolioOverview();

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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <PortfolioPositionsGrid positions={positions} />
        <Card className="surface p-5">
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

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <PortfolioTransactionForm />
        <PortfolioTransactionHistory />
      </div>
    </div>
  );
};

export default PortfolioPage;

