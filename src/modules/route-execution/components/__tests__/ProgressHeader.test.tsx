import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ProgressHeader } from '../ProgressHeader';
import { renderWithRoute } from '@/test/utils';
import { MOCK_ROUTE } from '@/mock/route';
import type { Route } from '../../types';

describe('ProgressHeader', () => {
  it('shows the route operatorId and id as the header title', () => {
    renderWithRoute(<ProgressHeader />);
    expect(screen.getByRole('heading', { name: MOCK_ROUTE.operatorId })).toBeInTheDocument();
    expect(screen.getByText(MOCK_ROUTE.id)).toBeInTheDocument();
  });

  it('shows "0 / 5 complete" for a fresh route', () => {
    renderWithRoute(<ProgressHeader />);
    expect(screen.getByText('0 / 5 complete')).toBeInTheDocument();
  });

  it('shows the first stop as "Next:"', () => {
    renderWithRoute(<ProgressHeader />);
    expect(screen.getByText('Sunset Tacos')).toBeInTheDocument();
  });

  it('progress bar starts at 0%', () => {
    renderWithRoute(<ProgressHeader />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '5');
  });

  it('shows "Route complete" when all stops are final', () => {
    const doneRoute: Route = {
      ...MOCK_ROUTE,
      stops: MOCK_ROUTE.stops.map((s) => ({ ...s, status: 'success' as const })),
    };
    renderWithRoute(<ProgressHeader />, { initialRoute: doneRoute });
    expect(screen.getByText(/route complete/i)).toBeInTheDocument();
  });

  it('shows correct count after stops complete', () => {
    const partialRoute: Route = {
      ...MOCK_ROUTE,
      stops: MOCK_ROUTE.stops.map((s, i) =>
        i < 2 ? { ...s, status: 'success' as const } : s,
      ),
    };
    renderWithRoute(<ProgressHeader />, { initialRoute: partialRoute });
    expect(screen.getByText('2 / 5 complete')).toBeInTheDocument();
  });

  it('shows "No stops assigned" when route has no stops', () => {
    const emptyRoute: Route = { ...MOCK_ROUTE, stops: [] };
    renderWithRoute(<ProgressHeader />, { initialRoute: emptyRoute });
    expect(screen.getByText('No stops assigned')).toBeInTheDocument();
  });

  it('renders the back button and calls onBack when clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderWithRoute(<ProgressHeader onBack={onBack} />);
    const backBtn = screen.getByRole('button', { name: /back to fleet/i });
    expect(backBtn).toBeInTheDocument();
    await user.click(backBtn);
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('does not render the back button when onBack is not provided', () => {
    renderWithRoute(<ProgressHeader />);
    expect(screen.queryByRole('button', { name: /back to fleet/i })).not.toBeInTheDocument();
  });
});
