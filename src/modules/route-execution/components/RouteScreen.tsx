import { useCallback, useState } from 'react';
import { RouteProvider, useRoute } from '../context/RouteContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useTelemetryQuery, useWeatherQuery } from '../api';
import type { StopStatus } from '../types';
import { calculateEtaMinutes } from '../utils/eta';
import { CommandCard } from '@/shared/components/CommandCard';
import { FlagIcon, MapIcon } from '@/shared/components/icons';
import { useIsLandscape } from '@/shared/hooks/useIsLandscape';
import { CameraFeedPip } from '@/shared/components/CameraFeedPip';
import { ActiveStopPeek } from './ActiveStopPeek';
import { IncidentReportSheet, type IncidentReason } from './IncidentReportSheet';
import { PrimaryActionStack } from './PrimaryActionStack';
import { RouteOverlay } from './RouteOverlay';
import { RouteTimelinePanel } from './RouteTimelinePanel';
import { TimelineDrawer } from './TimelineDrawer';
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
  const { isLoading, isError, route, activeStop, completedCount, totalCount, markStatus } =
    useRoute();
  const { data: telemetryDrone } = useTelemetryQuery(route.id);
  const { data: weather } = useWeatherQuery();
  const drone = telemetryDrone ?? route.drone;
  const isLandscape = useIsLandscape();
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

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

  const eta = calculateEtaMinutes(activeStop, drone);
  const completionPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const centerValue = activeStop ? (eta != null ? String(eta) : '—') : '✓';
  const centerUnit = activeStop ? 'min' : 'done';

  const handleIncident = (reason: IncidentReason) => {
    // eslint-disable-next-line no-console
    console.warn('[incident-report]', { routeId: route.id, reason, at: Date.now() });
    setIncidentOpen(false);
  };

  return (
    <div className="relative h-dvh bg-surface">
      <MapView stops={route.stops} drone={drone} className="h-full w-full" />

      <RouteOverlay
        onBack={onBack}
        onCameraToggle={() => setCameraOpen((v) => !v)}
        cameraOpen={cameraOpen}
      />

      {/* Landscape: persistent right-side timeline with all stops + inline actions */}
      {isLandscape && (
        <RouteTimelinePanel
          routeId={route.id}
          stops={route.stops}
          drone={drone ?? null}
          grounded={weather?.level === 'grounded'}
          onMarkStatus={markStatus}
          className="fixed right-5 top-20 bottom-32 z-30 w-[22rem] max-w-[24rem]"
        />
      )}

      {/* Bottom command card. Portrait: centered with PrimaryActionStack
          stacked on top. Landscape: bottom-left, no stack (panel owns actions). */}
      <div
        className={[
          'fixed bottom-6 z-30 flex flex-col items-center gap-3',
          isLandscape ? 'left-6' : 'left-1/2 -translate-x-1/2',
        ].join(' ')}
      >
        {!isLandscape && <PrimaryActionStack />}
        {!isLandscape && <ActiveStopPeek onExpand={() => setTimelineOpen(true)} />}
        <CommandCard
          leftIcon={<MapIcon size={22} />}
          leftLabel="Open route timeline"
          onLeftPress={() => setTimelineOpen(true)}
          centerValue={centerValue}
          centerUnit={centerUnit}
          centerProgressPct={completionPct}
          rightIcon={<FlagIcon size={22} />}
          rightLabel="Report an issue"
          onRightPress={() => setIncidentOpen(true)}
          stats={drone ? [
            { label: 'Range', value: `~${Math.round((drone.batteryPct / 100) * 8)} km` },
            { label: 'Service', value: '12 h' },
            { label: 'Signal', value: 'Strong' },
            { label: 'Wind', value: '8 km/h' },
          ] : undefined}
        />
      </div>

      <TimelineDrawer open={timelineOpen} onClose={() => setTimelineOpen(false)} />
      <IncidentReportSheet
        open={incidentOpen}
        onPick={handleIncident}
        onClose={() => setIncidentOpen(false)}
      />

      <CameraFeedPip
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        altitude={drone?.altitude}
        speedMs={drone?.speedMs}
      />

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
