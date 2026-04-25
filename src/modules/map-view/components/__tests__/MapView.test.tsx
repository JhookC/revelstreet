import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MapView } from '../MapView';
import { MOCK_ROUTE } from '@/mock/route';

// mapbox-gl requires WebGL which jsdom cannot provide.
// VITE_MAPBOX_TOKEN is not set in the test environment, so MapPlaceholder
// is always rendered — the real map path is covered by e2e tests.
vi.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}));
vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn(),
    Marker: vi.fn(),
    Popup: vi.fn(),
    NavigationControl: vi.fn(),
    AttributionControl: vi.fn(),
    accessToken: '',
  },
}));

describe('MapView', () => {
  it('renders the placeholder when no token is set', () => {
    render(<MapView stops={MOCK_ROUTE.stops} className="h-64" />);
    expect(screen.getByRole('img', { name: /map unavailable/i })).toBeInTheDocument();
  });

  it('shows setup instructions in the placeholder', () => {
    render(<MapView stops={MOCK_ROUTE.stops} />);
    expect(screen.getByText('VITE_MAPBOX_TOKEN')).toBeInTheDocument();
  });
});
