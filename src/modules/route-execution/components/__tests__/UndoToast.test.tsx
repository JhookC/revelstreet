import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRoute } from '../../context/RouteContext';
import { UndoToast } from '../UndoToast';
import { renderWithRoute } from '@/test/utils';
import { MOCK_ROUTE } from '@/mock/route';

function TriggerButton({ status }: { status: 'arrived' | 'departed' }) {
  const { markStatus, activeStopId } = useRoute();
  return (
    <button
      onClick={() => {
        if (activeStopId) markStatus(activeStopId, status);
      }}
    >
      trigger
    </button>
  );
}

function setup(status: 'arrived' | 'departed' = 'arrived') {
  const user = userEvent.setup();
  renderWithRoute(
    <>
      <TriggerButton status={status} />
      <UndoToast />
    </>,
  );
  return { user };
}

describe('UndoToast', () => {
  it('is not visible before any status change', () => {
    setup();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('appears with stop label after marking arrived', async () => {
    const { user } = setup('arrived');
    await user.click(screen.getByRole('button', { name: 'trigger' }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(MOCK_ROUTE.stops[0]!.label)).toBeInTheDocument();
  });

  it('shows "arrived" as the verb for an arrived status', async () => {
    const { user } = setup('arrived');
    await user.click(screen.getByRole('button', { name: 'trigger' }));
    expect(screen.getByRole('status').textContent).toMatch(/arrived/i);
  });

  it('undo button reverts the stop and hides the toast', async () => {
    const { user } = setup('arrived');
    await user.click(screen.getByRole('button', { name: 'trigger' }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /undo/i }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('dismiss button hides the toast', async () => {
    const { user } = setup('arrived');
    await user.click(screen.getByRole('button', { name: 'trigger' }));
    await user.click(screen.getByRole('button', { name: /dismiss notification/i }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
