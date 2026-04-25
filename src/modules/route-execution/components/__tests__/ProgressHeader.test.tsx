import { screen } from '@testing-library/react';
import { ProgressHeader } from '../ProgressHeader';
import { renderWithRoute } from '@/test/utils';
import { MOCK_ROUTE } from '@/mock/route';
import type { Route } from '../../types';

describe('ProgressHeader', () => {
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
});
