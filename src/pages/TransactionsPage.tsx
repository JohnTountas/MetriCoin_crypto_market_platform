import { Helmet } from 'react-helmet-async';

import {
  PortfolioTransactionForm,
  PortfolioTransactionHistory,
  PortfolioTransactionSummary,
} from '@/entities/portfolio';

const TransactionsPage = () => (
  <div className="space-y-6">
    <Helmet>
      <title>Transactions | Metricoin</title>
    </Helmet>

    <PortfolioTransactionSummary />

    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <PortfolioTransactionForm />
      <PortfolioTransactionHistory />
    </div>
  </div>
);

export default TransactionsPage;
