import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { RouteOverlay } from '../RouteOverlay';
import { renderWithRoute } from '@/test/utils';
import { MOCK_ROUTE } from '@/mock/route';

describe('RouteOverlay', () => {
  it('shows route id and operatorId', () => {
    renderWithRoute(<RouteOverlay />);
    expect(screen.getByText(MOCK_ROUTE.id)).toBeInTheDocument();
    expect(screen.getByText(MOCK_ROUTE.operatorId)).toBeInTheDocument();
  });

  it('renders the back button and calls onBack when clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderWithRoute(<RouteOverlay onBack={onBack} />);
    const btn = screen.getByRole('button', { name: /back to fleet/i });
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('does not render back button when onBack is not provided', () => {
    renderWithRoute(<RouteOverlay />);
    expect(screen.queryByRole('button', { name: /back to fleet/i })).not.toBeInTheDocument();
  });

  it('renders the theme toggle button', () => {
    renderWithRoute(<RouteOverlay />);
    expect(
      screen.getByRole('button', { name: /switch to (light|dark) mode/i }),
    ).toBeInTheDocument();
  });
});
