import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createMemoryHistory,
} from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { RouteProvider, routeKeys } from '@/modules/route-execution';
import type { Route } from '@/modules/route-execution';
import { MOCK_ROUTE } from '@/mock/route';
import { ThemeProvider } from '@/shared/context/ThemeContext';

interface RenderWithRouteOptions extends RenderOptions {
  initialRoute?: Route;
}

function makeQueryClient(initialRoute: Route) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  // Pre-populate cache so components render immediately without a network fetch.
  client.setQueryData(routeKeys.byId(initialRoute.id), initialRoute);
  return client;
}

function Providers({
  children,
  initialRoute,
}: {
  children: ReactElement;
  initialRoute: Route;
}) {
  return (
    <QueryClientProvider client={makeQueryClient(initialRoute)}>
      <ThemeProvider>
        <RouteProvider routeId={initialRoute.id}>{children}</RouteProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export function renderWithRoute(
  ui: ReactElement,
  { initialRoute = MOCK_ROUTE, ...options }: RenderWithRouteOptions = {},
) {
  return render(<Providers initialRoute={initialRoute}>{ui}</Providers>, options);
}

export async function renderWithRouter(ui: ReactElement, options?: RenderOptions) {
  const rootRoute = createRootRoute({ component: () => <>{ui}</> });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  return render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
    options,
  );
}

export * from '@testing-library/react';
