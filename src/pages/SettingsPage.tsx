import { Helmet } from 'react-helmet-async';

import { PreferencesPanel } from '@/features/settings/ui/PreferencesPanel';

const SettingsPage = () => (
  <div className="space-y-6">
    <Helmet>
      <title>Settings | MetaSignal</title>
    </Helmet>

    <PreferencesPanel />
  </div>
);

export default SettingsPage;
