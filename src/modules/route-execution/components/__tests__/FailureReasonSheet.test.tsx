import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import { FailureReasonSheet } from '../FailureReasonSheet';

function setup(open: boolean) {
  const onPick = vi.fn();
  const onClose = vi.fn();
  const user = userEvent.setup();
  render(
    <ThemeProvider>
      <FailureReasonSheet open={open} onPick={onPick} onClose={onClose} />
    </ThemeProvider>,
  );
  return { onPick, onClose, user };
}

describe('FailureReasonSheet', () => {
  it('renders the dialog when open', () => {
    setup(true);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders all four failure reason buttons when open', () => {
    setup(true);
    expect(screen.getByText('Refused')).toBeInTheDocument();
    expect(screen.getByText('Wrong address')).toBeInTheDocument();
    expect(screen.getByText('No recipient')).toBeInTheDocument();
    expect(screen.getByText('Damaged')).toBeInTheDocument();
  });

  it('calls onPick with the correct reason when a reason is clicked', async () => {
    const { onPick, user } = setup(true);
    await user.click(screen.getByText('Refused'));
    expect(onPick).toHaveBeenCalledWith('refused');
  });

  it('calls onPick with "wrong-address" when that reason is clicked', async () => {
    const { onPick, user } = setup(true);
    await user.click(screen.getByText('Wrong address'));
    expect(onPick).toHaveBeenCalledWith('wrong-address');
  });
});
