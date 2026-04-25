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

  it('shows empty state when the fleet has no routes', async () => {
    await renderFleet([]);
    expect(screen.getByText('No routes assigned.')).toBeInTheDocument();
  });

  it('sorts routes so in-progress appears before not-started', async () => {
    await renderFleet(MOCK_FLEET); // order: not-started, in-progress, not-started
    const cards = screen.getAllByRole('link'); // RouteCard renders a Link
    // route-002 (in-progress) should come before route-001 and route-003 (not-started)
    const positions = ['op-echo-3', 'op-fox-7', 'op-victor-2'].map((op) =>
      cards.findIndex((c) => c.textContent?.includes(op)),
    );
    expect(positions[0]).toBeLessThan(positions[1]);
    expect(positions[0]).toBeLessThan(positions[2]);
  });
});
