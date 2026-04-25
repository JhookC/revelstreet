import { useCallback } from 'react';
import { MOCK_ROUTE } from '@/mock/route';
import { RouteProvider } from '../context/RouteContext';
import { useRoute } from '../context/RouteContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { Route, StopStatus } from '../types';
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

interface Props {
  initialRoute?: Route;
}

export function RouteScreen({ initialRoute = MOCK_ROUTE }: Props) {
  return (
    <RouteProvider initialRoute={initialRoute}>
      <KeyboardController />
      <div className="min-h-full">
        <ProgressHeader />
        <main className="pb-32">
          <StopList />
        </main>
        <UndoToast />
      </div>
    </RouteProvider>
  );
}
