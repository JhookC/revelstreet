import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  it('renders the pickup/delivery toggle', async () => {
    await renderFleet(MOCK_FLEET);
    expect(screen.getByRole('button', { name: 'Pickups' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Deliveries' })).toBeInTheDocument();
  });

  it('defaults to pickups view in the drawer peek', async () => {
    await renderFleet(MOCK_FLEET);
    expect(screen.getByText('Pickup routes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pickups' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches to deliveries view when the toggle is clicked', async () => {
    const user = userEvent.setup();
    await renderFleet(MOCK_FLEET);
    await user.click(screen.getByRole('button', { name: 'Deliveries' }));
    expect(screen.getByText('Delivery routes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Deliveries' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows loading state in the drawer peek when no data is cached', async () => {
    await renderFleet();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows empty state in the drawer peek when the fleet has no routes', async () => {
    await renderFleet([]);
    expect(screen.getByText('No routes assigned')).toBeInTheDocument();
  });

});
