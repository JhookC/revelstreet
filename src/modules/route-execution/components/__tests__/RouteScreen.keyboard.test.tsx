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
        <RouteScreen routeId={MOCK_ROUTE.id} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
  return { user };
}

describe('RouteScreen — keyboard shortcuts', () => {
  it('A key marks active stop as arrived', async () => {
    const { user } = setup();
    await user.keyboard('a');
    expect(screen.getByRole('button', { name: /mark departed/i })).toBeInTheDocument();
  });

  it('A then D advances stop to departed', async () => {
    const { user } = setup();
    await user.keyboard('a');
    await user.keyboard('d');
    expect(screen.getByRole('button', { name: /picked up/i })).toBeInTheDocument();
  });

  it('A D S completes the first stop', async () => {
    const { user } = setup();
    await user.keyboard('a');
    await user.keyboard('d');
    await user.keyboard('s');
    expect(screen.getByText('1 / 5 complete')).toBeInTheDocument();
  });

  it('shortcut does nothing when no active stop', async () => {
    const { user } = setup();
    for (let i = 0; i < 5; i++) {
      await user.keyboard('a');
      await user.keyboard('d');
      await user.keyboard('s');
    }
    expect(screen.getByText('5 / 5 complete')).toBeInTheDocument();
    await user.keyboard('a');
    expect(screen.getByText('5 / 5 complete')).toBeInTheDocument();
  });
});
