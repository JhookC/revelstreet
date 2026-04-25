import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { OfflineBanner } from '../OfflineBanner';

describe('OfflineBanner', () => {
  const originalOnline = Object.getOwnPropertyDescriptor(Navigator.prototype, 'onLine');

  function setOnline(value: boolean) {
    Object.defineProperty(navigator, 'onLine', { value, configurable: true });
  }

  afterEach(() => {
    if (originalOnline) {
      Object.defineProperty(Navigator.prototype, 'onLine', originalOnline);
    }
  });

  it('renders nothing when online', () => {
    setOnline(true);
    const { container } = render(<OfflineBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the banner when offline', () => {
    setOnline(false);
    render(<OfflineBanner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
  });

  it('appears when the browser goes offline', () => {
    setOnline(true);
    const { rerender } = render(<OfflineBanner />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    setOnline(false);
    fireEvent(window, new Event('offline'));
    rerender(<OfflineBanner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('disappears when the browser comes back online', () => {
    setOnline(false);
    const { rerender } = render(<OfflineBanner />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    setOnline(true);
    fireEvent(window, new Event('online'));
    rerender(<OfflineBanner />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('has aria-live="polite" for accessibility', () => {
    setOnline(false);
    render(<OfflineBanner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});
