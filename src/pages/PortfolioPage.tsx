import { Helmet } from 'react-helmet-async';

import { PositionsOverview } from '@/entities/portfolio/ui/PositionsOverview';
import { TransactionForm } from '@/entities/portfolio/ui/TransactionForm';
import { TransactionHistory } from '@/entities/portfolio/ui/TransactionHistory';
import { PortfolioSummaryGrid } from '@/features/dashboard/ui/PortfolioSummaryGrid';
import { usePortfolioMetrics } from '@/hooks/portfolio/usePortfolioMetrics';
import { AllocationDonut } from '@/shared/components/charts/AllocationDonut';
import { Card } from '@/shared/components/ui/Card';
import { SectionHeading } from '@/shared/components/ui/SectionHeading';

const PortfolioPage = () => {
  const { summary, positions, bestPerformer, worstPerformer } = usePortfolioMetrics();

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
        <PositionsOverview positions={positions} />
        <Card className="surface p-5">
          <SectionHeading
            eyebrow="Allocation"
            title="Live portfolio mix"
            description="Current exposure distribution across your tracked crypto sleeve."
          />
          <div className="mt-6">
            <AllocationDonut positions={positions} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <TransactionForm />
        <TransactionHistory />
      </div>
    </div>
  );
};

export default PortfolioPage;
