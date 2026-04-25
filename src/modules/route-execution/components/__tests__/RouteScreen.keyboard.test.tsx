import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { RouteScreen } from '../RouteScreen';
import { ThemeProvider } from '@/shared/context/ThemeContext';

function setup() {
  const user = userEvent.setup();
  render(
    <ThemeProvider>
      <RouteScreen />
    </ThemeProvider>,
  );
  return { user };
}

describe('RouteScreen — keyboard shortcuts', () => {
  it('A key marks active stop as arrived', async () => {
    const { user } = setup();
    await user.keyboard('a');
    expect(screen.getByRole('button', { name: /mark departed/i })).toBeInTheDocument();
  });

  it('A then D advances stop to departed', async () => {
    const { user } = setup();
    await user.keyboard('a');
    await user.keyboard('d');
    // departed → shows success/fail buttons
    expect(screen.getByRole('button', { name: /picked up/i })).toBeInTheDocument();
  });

  it('A D S completes the first stop', async () => {
    const { user } = setup();
    await user.keyboard('a');
    await user.keyboard('d');
    await user.keyboard('s');
    expect(screen.getByText('1 / 5 complete')).toBeInTheDocument();
  });

  it('shortcut does nothing when no active stop', async () => {
    const { user } = setup();
    // complete all 5 stops via keyboard
    for (let i = 0; i < 5; i++) {
      await user.keyboard('a');
      await user.keyboard('d');
      await user.keyboard('s');
    }
    expect(screen.getByText('5 / 5 complete')).toBeInTheDocument();
    // pressing A again should be a no-op
    await user.keyboard('a');
    expect(screen.getByText('5 / 5 complete')).toBeInTheDocument();
  });
});
