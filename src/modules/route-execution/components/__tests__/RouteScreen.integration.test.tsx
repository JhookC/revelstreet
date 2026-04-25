import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouteScreen } from '../RouteScreen';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import { routeKeys } from '@/modules/route-execution';
import { MOCK_ROUTE } from '@/mock/route';

function makeQueryClient() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(routeKeys.byId(MOCK_ROUTE.id), MOCK_ROUTE);
  return client;
}

function setup() {
  const user = userEvent.setup();
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <ThemeProvider>
        <RouteScreen />
      </ThemeProvider>
    </QueryClientProvider>,
  );
  return { user };
}

describe('RouteScreen — happy path', () => {
  it('renders all stop labels on load', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Sunset Tacos', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Marina Sushi', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Apt 3B — Patel', level: 3 })).toBeInTheDocument();
  });

  it('starts at 0 / 5 complete', () => {
    setup();
    expect(screen.getByText('0 / 5 complete')).toBeInTheDocument();
  });

  it('advances stop 1 through arrived → departed → success', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('button', { name: /mark arrived/i }));
    await user.click(screen.getByRole('button', { name: /mark departed/i }));
    await user.click(screen.getByRole('button', { name: /picked up/i }));

    expect(screen.getByText('1 / 5 complete')).toBeInTheDocument();
  });

  it('shows undo toast after a status change', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /mark arrived/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
  });

  it('undo reverts the last status change', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /mark arrived/i }));
    await user.click(screen.getByRole('button', { name: /undo/i }));
    expect(screen.getByRole('button', { name: /mark arrived/i })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('dismiss closes the undo toast without reverting', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /mark arrived/i }));
    await user.click(screen.getByRole('button', { name: /dismiss notification/i }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark arrived/i })).not.toBeInTheDocument();
  });
});
