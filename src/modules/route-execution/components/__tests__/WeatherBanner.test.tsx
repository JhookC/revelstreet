import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect } from 'vitest';
import { WeatherBanner } from '../WeatherBanner';
import type { WeatherCondition } from '../../types';

function setup(condition: WeatherCondition | null) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  if (condition) {
    qc.setQueryData(['weather'], condition);
  }
  render(
    <QueryClientProvider client={qc}>
      <WeatherBanner routeId="route-001" />
    </QueryClientProvider>,
  );
}

describe('WeatherBanner', () => {
  it('renders nothing when condition is clear', () => {
    setup({ level: 'clear', summary: 'All good' });
    expect(screen.queryByText('All good')).not.toBeInTheDocument();
  });

  it('renders nothing when no weather data is available', () => {
    setup(null);
    expect(document.querySelector('[aria-label*="Weather"]')).toBeNull();
  });

  it('shows advisory summary', () => {
    setup({ level: 'advisory', summary: 'Gusts up to 28 km/h' });
    expect(screen.getByText('Gusts up to 28 km/h')).toBeInTheDocument();
  });

  it('shows warning summary', () => {
    setup({ level: 'warning', summary: 'Thunderstorm approaching' });
    expect(screen.getByText('Thunderstorm approaching')).toBeInTheDocument();
  });

  it('shows grounded summary', () => {
    setup({ level: 'grounded', summary: 'All flights suspended' });
    expect(screen.getByText('All flights suspended')).toBeInTheDocument();
  });

  it('has aria-live="polite" for accessibility', () => {
    setup({ level: 'advisory', summary: 'Gusty' });
    expect(screen.getByText('Gusty').closest('[aria-live]')).toHaveAttribute('aria-live', 'polite');
  });
});
