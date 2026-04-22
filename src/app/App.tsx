// The root App stays intentionally thin so routing and provider concerns remain easy to swap,
// test, and reason about independently.
import { RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/app/providers';
import { router, routerFallback } from '@/app/router';

export const App = () => (
  <AppProviders>
    <RouterProvider
      router={router}
      fallbackElement={routerFallback}
    />
  </AppProviders>
);
