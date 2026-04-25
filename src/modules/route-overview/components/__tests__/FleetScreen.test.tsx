import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createMemoryHistory,
} from '@tanstack/react-router';
import { describe, it, expect } from 'vitest';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import { MOCK_FLEET } from '@/mock/fleet';
import { fleetKeys } from '../../api';
import { FleetScreen } from '../FleetScreen';

async function renderFleet(initialData?: typeof MOCK_FLEET) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  if (initialData) qc.setQueryData(fleetKeys.all, initialData);

  const rootRoute = createRootRoute({ component: FleetScreen });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();

  return render(
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('FleetScreen', () => {
  it('renders the Fleet Overview heading', async () => {
    await renderFleet(MOCK_FLEET);
    expect(screen.getByText('Fleet Overview')).toBeInTheDocument();
  });

  it('renders a card for each route', async () => {
    await renderFleet(MOCK_FLEET);
    expect(screen.getByText('op-fox-7')).toBeInTheDocument();
    expect(screen.getByText('op-echo-3')).toBeInTheDocument();
    expect(screen.getByText('op-victor-2')).toBeInTheDocument();
  });

  it('shows loading state when no data is cached', async () => {
    await renderFleet();
    expect(screen.getByText('Loading fleet…')).toBeInTheDocument();
  });
});
