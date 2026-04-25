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
  const { isLoading, isError } = useRoute();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-content-muted">
        Loading route…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-base font-semibold text-content">Route not found</p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-content-muted underline hover:text-content"
          >
            ← Back to fleet
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <ProgressHeader onBack={onBack} />
      {/* padding clears the fixed UndoToast (≈56px tall + 16px offset + buffer) */}
      <main className="pb-24">
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
