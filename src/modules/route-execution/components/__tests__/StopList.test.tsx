import { screen } from '@testing-library/react';
import { StopList } from '../StopList';
import { renderWithRoute } from '@/test/utils';
import { MOCK_ROUTE } from '@/mock/route';
import type { Route } from '../../types';

const allDoneRoute: Route = {
  ...MOCK_ROUTE,
  stops: MOCK_ROUTE.stops.map((s) => ({ ...s, status: 'success' as const })),
};

describe('StopList — sections', () => {
  it('renders a Pickups section', () => {
    renderWithRoute(<StopList />);
    expect(screen.getByRole('heading', { name: /pickups/i, level: 2 })).toBeInTheDocument();
  });

  it('renders a Deliveries section', () => {
    renderWithRoute(<StopList />);
    expect(screen.getByRole('heading', { name: /deliveries/i, level: 2 })).toBeInTheDocument();
  });

  it('shows correct done/total in section header for fresh route (0 / 2 pickups)', () => {
    renderWithRoute(<StopList />);
    const pickupsSection = screen.getByRole('heading', { name: /pickups/i, level: 2 }).closest('header')!;
    expect(pickupsSection.textContent).toContain('0 / 2');
  });

  it('shows "complete" badge in section header when all stops in section are done', () => {
    renderWithRoute(<StopList />, { initialRoute: allDoneRoute });
    const pickupsHeader = screen.getByRole('heading', { name: /pickups/i, level: 2 }).closest('header')!;
    expect(pickupsHeader.textContent).toContain('complete');
  });
});

describe('StopList — stop rendering', () => {
  it('renders all stop labels', () => {
    renderWithRoute(<StopList />);
    for (const stop of MOCK_ROUTE.stops) {
      expect(screen.getByRole('heading', { name: stop.label, level: 3 })).toBeInTheDocument();
    }
  });

  it('shows action buttons only on the active (first non-final) stop', () => {
    renderWithRoute(<StopList />);
    expect(screen.getByRole('button', { name: /mark arrived/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark departed/i })).not.toBeInTheDocument();
  });

  it('shows no status-action buttons when all stops are complete', () => {
    renderWithRoute(<StopList />, { initialRoute: allDoneRoute });
    expect(screen.queryByRole('button', { name: /mark arrived|mark departed|picked up|delivered|failed/i })).not.toBeInTheDocument();
  });
});
