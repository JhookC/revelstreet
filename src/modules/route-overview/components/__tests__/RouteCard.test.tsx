import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithRouter } from '@/test/utils';
import { MOCK_FLEET } from '@/mock/fleet';
import { RouteCard } from '../RouteCard';

const route001 = MOCK_FLEET[0]!;
const route002 = MOCK_FLEET[1]!;
const route003 = MOCK_FLEET[2]!;

describe('RouteCard', () => {
  it('shows route id and operatorId', async () => {
    await renderWithRouter(<RouteCard route={route001} />);
    expect(screen.getByText('route-001')).toBeInTheDocument();
    expect(screen.getByText('op-fox-7')).toBeInTheDocument();
  });

  it('shows "Not started" when all stops are pending', async () => {
    await renderWithRouter(<RouteCard route={route001} />);
    expect(screen.getByText('Not started')).toBeInTheDocument();
  });

  it('shows "In progress" when some stops are terminal and one is active', async () => {
    await renderWithRouter(<RouteCard route={route002} />);
    expect(screen.getByText('In progress')).toBeInTheDocument();
  });

  it('shows "Not started" for route-003', async () => {
    await renderWithRouter(<RouteCard route={route003} />);
    expect(screen.getByText('Not started')).toBeInTheDocument();
  });

  it('shows correct completed / total stop count', async () => {
    await renderWithRouter(<RouteCard route={route001} />);
    expect(screen.getByText('0 / 5 stops')).toBeInTheDocument();
  });

  it('shows in-progress stop count for route-002', async () => {
    await renderWithRouter(<RouteCard route={route002} />);
    expect(screen.getByText('2 / 4 stops')).toBeInTheDocument();
  });

  it('links to the correct route detail URL', async () => {
    await renderWithRouter(<RouteCard route={route001} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/routes/route-001');
  });

  it('shows "Next:" with the first pending stop label for a not-started route', async () => {
    await renderWithRouter(<RouteCard route={route001} />);
    expect(screen.getByText(/next:/i)).toBeInTheDocument();
    expect(screen.getByText('Sunset Tacos')).toBeInTheDocument();
  });

  it('shows "At:" with the arrived/departed stop label for in-progress route', async () => {
    await renderWithRouter(<RouteCard route={route002} />);
    // route-002 has stop s2-3 with status 'arrived'
    expect(screen.getByText(/at:/i)).toBeInTheDocument();
    expect(screen.getByText('Suite 202 — Lee')).toBeInTheDocument();
  });
});
