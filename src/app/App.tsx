import { RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/app/providers/AppProviders';
import { router, routerFallback } from '@/app/router';

export const App = () => (
  <AppProviders>
    <RouterProvider
      router={router}
      fallbackElement={routerFallback}
    />
  </AppProviders>
);

