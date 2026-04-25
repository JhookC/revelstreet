import { screen } from '@testing-library/react';
import { StopRow } from '../StopRow';
import { renderWithRoute } from '@/test/utils';
import { MOCK_ROUTE } from '@/mock/route';
import type { Route } from '../../types';

const base = MOCK_ROUTE.stops[0]!;

const routeWith = (overrides: Partial<(typeof MOCK_ROUTE.stops)[0]>): Route => ({
  ...MOCK_ROUTE,
  stops: MOCK_ROUTE.stops.map((s) =>
    s.id === base.id ? { ...s, ...overrides } : s,
  ),
});

describe('StopRow — action buttons', () => {
  it('shows "Mark Arrived" when active and pending', () => {
    renderWithRoute(<StopRow stop={base} isActive isLocked={false} />);
    expect(screen.getByRole('button', { name: /mark arrived/i })).toBeInTheDocument();
  });

  it('shows "Mark Departed" when active and arrived', () => {
    const stop = { ...base, status: 'arrived' as const };
    renderWithRoute(
      <StopRow stop={stop} isActive isLocked={false} />,
      { initialRoute: routeWith({ status: 'arrived' }) },
    );
    expect(screen.getByRole('button', { name: /mark departed/i })).toBeInTheDocument();
  });

  it('shows "Picked up" and "Failed…" when active, departed, and pickup type', () => {
    const stop = { ...base, status: 'departed' as const };
    renderWithRoute(
      <StopRow stop={stop} isActive isLocked={false} />,
      { initialRoute: routeWith({ status: 'departed' }) },
    );
    expect(screen.getByRole('button', { name: /picked up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /failed/i })).toBeInTheDocument();
  });

  it('shows "Delivered" and "Failed…" when active, departed, and delivery type', () => {
    const deliveryStop = MOCK_ROUTE.stops[2]!;
    const stop = { ...deliveryStop, status: 'departed' as const };
    const route: Route = {
      ...MOCK_ROUTE,
      stops: MOCK_ROUTE.stops.map((s) =>
        s.id === deliveryStop.id ? { ...s, status: 'departed' as const } : s,
      ),
    };
    renderWithRoute(
      <StopRow stop={stop} isActive isLocked={false} />,
      { initialRoute: route },
    );
    expect(screen.getByRole('button', { name: /delivered/i })).toBeInTheDocument();
  });

  it('shows no action buttons when locked', () => {
    renderWithRoute(<StopRow stop={base} isActive={false} isLocked />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows no action buttons when not active', () => {
    renderWithRoute(<StopRow stop={base} isActive={false} isLocked={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
