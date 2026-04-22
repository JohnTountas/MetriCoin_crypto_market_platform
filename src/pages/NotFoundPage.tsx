import { ArrowLeft } from 'lucide-react';
// NotFoundPage is the catch-all route for invalid navigation paths.
// Even simple fallback pages are worth keeping explicit so routing behavior stays intentional.
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { Button, Card } from '@/shared';

const NotFoundPage = () => (
  <div className="grid min-h-[60vh] place-items-center">
    <Helmet>
      <title>404 | Metricoin</title>
    </Helmet>

    <Card className="surface max-w-xl p-8 text-center">
      <p className="eyebrow text-xs font-semibold uppercase tracking-[0.34em]">404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold text-[var(--text-primary)]">Signal lost on this route</h1>
      <p className="mt-4 text-base leading-8 text-[var(--text-muted)]">
        The page you requested does not exist, but your market stream is still intact. Head back to the dashboard to
        continue monitoring Bitcoin and your live portfolio.
      </p>
      <Link
        className="mt-6 inline-block"
        to="/"
      >
        <Button>
          <ArrowLeft className="h-4.5 w-4.5" />
          Return to dashboard
        </Button>
      </Link>
    </Card>
  </div>
);

export default NotFoundPage;
