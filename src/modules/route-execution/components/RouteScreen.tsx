import { useCallback } from 'react';
import { RouteProvider, useRoute } from '../context/RouteContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { StopStatus } from '../types';
import { ProgressHeader } from './ProgressHeader';
import { StopList } from './StopList';
import { UndoToast } from './UndoToast';
import { MapView } from '@/modules/map-view';

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
  const { isLoading, isError, route } = useRoute();

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
    <div className="min-h-dvh bg-surface">
      <ProgressHeader onBack={onBack} />

      {/*
        Mobile/tablet: map above list (collapsible feel, fixed height).
        Desktop lg+: side-by-side — map fills left, stop list scrolls right.
      */}
      <div className="lg:flex lg:h-[calc(100dvh-var(--header-h,140px))]">
        {/* Map panel */}
        <div className="h-52 flex-shrink-0 sm:h-64 lg:h-full lg:w-[45%] lg:border-r lg:border-border">
          <MapView
            stops={route.stops}
            drone={route.drone}
            className="h-full w-full"
          />
        </div>

        {/* Stop list panel */}
        {/* padding clears the fixed UndoToast (≈56px tall + 16px offset + buffer) */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-24">
          <StopList />
        </main>
      </div>

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
