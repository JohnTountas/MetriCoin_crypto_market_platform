import { Helmet } from 'react-helmet-async';

import { MarketsTable } from '@/features';
import { Card, SectionHeading } from '@/shared';

const MarketsPage = () => (
  <div className="space-y-6">
    <Helmet>
      <title>Markets | Metricoin</title>
      <meta
        content="Track live crypto market snapshots, spreads, volume, and market-cap context with Metricoin's premium Bitcoin-first UI."
        name="description"
      />
    </Helmet>

    <Card className="surface p-6">
      <SectionHeading
        eyebrow="Markets"
        title="Scalable market coverage"
        description="Bitcoin is the hero asset, but the provider architecture, websocket stream, and UI patterns are built to expand cleanly across more coins without rewriting the app."
      />
    </Card>

    <MarketsTable />
  </div>
);

export default MarketsPage;
