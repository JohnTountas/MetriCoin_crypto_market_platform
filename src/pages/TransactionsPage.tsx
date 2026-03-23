import { Helmet } from 'react-helmet-async';

import { TransactionForm } from '@/entities/portfolio/ui/TransactionForm';
import { TransactionHistory } from '@/entities/portfolio/ui/TransactionHistory';

const TransactionsPage = () => (
  <div className="space-y-6">
    <Helmet>
      <title>Transactions | MetaSignal</title>
    </Helmet>

    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <TransactionForm />
      <TransactionHistory />
    </div>
  </div>
);

export default TransactionsPage;
