import { useCallback } from 'react';
import { RouteProvider, useRoute } from '../context/RouteContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { StopStatus } from '../types';
import { ProgressHeader } from './ProgressHeader';
import { StopList } from './StopList';
import { UndoToast } from './UndoToast';

const ROUTE_ID = 'route-001';

function KeyboardController() {
  const { activeStopId, markStatus } = useRoute();

  const handleAction = useCallback(
    (status: StopStatus) => {
      if (!activeStopId) return;
      markStatus(activeStopId, status);
    },
    [activeStopId, markStatus],
  );

  useKeyboardShortcuts({ onAction: handleAction, enabled: !!activeStopId });

  return null;
}

function RouteScreenBody() {
  const { isLoading } = useRoute();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[var(--color-content-muted)]">
        Loading route…
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <ProgressHeader />
      <main className="pb-32">
        <StopList />
      </main>
      <UndoToast />
    </div>
  );
}

export function RouteScreen() {
  return (
    <RouteProvider routeId={ROUTE_ID}>
      <KeyboardController />
      <RouteScreenBody />
    </RouteProvider>
  );
}
