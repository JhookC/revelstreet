import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';

function Bomb(): never {
  throw new Error('Test explosion');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('shows error fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test explosion')).toBeInTheDocument();
  });

  it('shows a "Reset and reload" button in the fallback', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('button', { name: /reset and reload/i })).toBeInTheDocument();
  });

  it('clears revelstreet query cache from localStorage when reset is clicked', async () => {
    const user = userEvent.setup();
    localStorage.setItem('revelstreet:query-cache', '{"data":"test"}');

    const origLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...origLocation, reload: vi.fn() },
      writable: true,
      configurable: true,
    });

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    await user.click(screen.getByRole('button', { name: /reset and reload/i }));

    expect(localStorage.getItem('revelstreet:query-cache')).toBeNull();
    Object.defineProperty(window, 'location', { value: origLocation, configurable: true });
  });
});
