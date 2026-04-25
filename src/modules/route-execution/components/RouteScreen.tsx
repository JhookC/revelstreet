import { useCallback } from 'react';
import { RouteProvider, useRoute } from '../context/RouteContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { StopStatus } from '../types';
import { ProgressHeader } from './ProgressHeader';
import { StopList } from './StopList';
import { UndoToast } from './UndoToast';

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

interface BodyProps {
  onBack?: () => void;
}

function RouteScreenBody({ onBack }: BodyProps) {
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
      <ProgressHeader onBack={onBack} />
      <main className="pb-32">
        <StopList />
      </main>
      <UndoToast />
    </div>
  );
}

interface Props {
  routeId: string;
  onBack?: () => void;
}

export function RouteScreen({ routeId, onBack }: Props) {
  return (
    <RouteProvider routeId={routeId}>
      <KeyboardController />
      <RouteScreenBody onBack={onBack} />
    </RouteProvider>
  );
}
