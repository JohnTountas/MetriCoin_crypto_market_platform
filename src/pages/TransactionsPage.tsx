// TransactionsPage is the dedicated ledger maintenance route for users working trade-by-trade.
// Splitting it from the broader portfolio page keeps editing workflows easier to focus on.
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

    <div className="grid gap-6 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
      <PortfolioTransactionForm />
      <PortfolioTransactionHistory />
    </div>
  </div>
);

export default TransactionsPage;
