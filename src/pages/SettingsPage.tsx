// SettingsPage keeps user-owned preferences and operational tooling on one route.
// It stays intentionally small so settings growth can happen inside focused panels.
import { Helmet } from 'react-helmet-async';

import { OperationsPanel, PreferencesPanel } from '@/features';

const SettingsPage = () => (
  <div className="space-y-6">
    <Helmet>
      <title>Settings | Metricoin</title>
    </Helmet>

    <PreferencesPanel />
    <OperationsPanel />
  </div>
);

export default SettingsPage;
