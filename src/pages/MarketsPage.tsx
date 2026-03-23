import { Helmet } from 'react-helmet-async';

import { MarketsTable } from '@/features/markets/ui/MarketsTable';
import { Card } from '@/shared/components/ui/Card';
import { SectionHeading } from '@/shared/components/ui/SectionHeading';

const MarketsPage = () => (
  <div className="space-y-6">
    <Helmet>
      <title>Markets | MetaSignal</title>
      <meta
        content="Track live crypto market snapshots, spreads, volume, and market-cap context with MetaSignal's premium Bitcoin-first UI."
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
