import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTheme } from '@/shared/context/ThemeContext';
import type { Route } from '@/modules/route-execution';
import { RouteTimelinePanel } from '@/modules/route-execution';
import { FleetMapView } from '@/modules/map-view';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { useIsLandscape } from '@/shared/hooks/useIsLandscape';
import { CameraFeedPip } from '@/shared/components/CameraFeedPip';
import { CommandCard } from '@/shared/components/CommandCard';
import { CameraIcon, DroneIcon } from '@/shared/components/icons';
import { useFleetQuery, useFleetTelemetryQuery } from '../api';
import { FleetDrawer } from './FleetDrawer';

const STATUS_ORDER: Record<string, number> = {
  'in-progress': 0,
  'not-started': 1,
  complete: 2,
};

const TERMINAL = new Set(['success', 'failed'] as const);

function routeStatusKey(route: Route): string {
  const stops = route.stops;
  if (stops.every((s) => s.status === 'pending')) return 'not-started';
  if (stops.every((s) => TERMINAL.has(s.status as 'success' | 'failed'))) return 'complete';
  return 'in-progress';
}

type ViewMode = 'pickups' | 'deliveries';

export function FleetScreen() {
  const { data: fleet } = useFleetQuery();
  const { data: telemetry = [] } = useFleetTelemetryQuery();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const isLandscape = useIsLandscape();
  const [viewMode, setViewMode] = useState<ViewMode>('pickups');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [layersOn, setLayersOn] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const sortedFleet = useMemo(
    () =>
      fleet
        ? [...fleet].sort(
            (a, b) => STATUS_ORDER[routeStatusKey(a)]! - STATUS_ORDER[routeStatusKey(b)]!,
          )
        : fleet,
    [fleet],
  );

  const handleSelectRoute = (routeId: string) => {
    void navigate({ to: '/routes/$routeId', params: { routeId } });
  };

  const focusRoute: Route | null =
    sortedFleet?.find((r) => routeStatusKey(r) === 'in-progress') ??
    sortedFleet?.[0] ??
    null;
  const focusDrone =
    (focusRoute && telemetry.find((t) => t.routeId === focusRoute.id)?.drone) ?? null;

  const batteryPct = focusDrone?.batteryPct ?? null;
  const batteryColorClass =
    batteryPct === null
      ? 'text-white/30'
      : batteryPct >= 50
        ? 'text-status-success'
        : batteryPct >= 20
          ? 'text-status-arrived'
          : 'text-status-failed';
  const altitudeM = focusDrone ? Math.round(focusDrone.altitude) : null;

  return (
    <div className="relative h-dvh bg-surface">
      <FleetMapView
        fleet={sortedFleet ?? []}
        telemetry={telemetry}
        onSelectRoute={handleSelectRoute}
        stopFilter={viewMode}
        className="h-full w-full"
      />

      {/* Floating top overlay */}
      <div
        className={[
          'fixed left-5 right-5 z-[31] flex items-start justify-between',
          !isOnline ? 'top-14' : 'top-5',
        ].join(' ')}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCameraOpen((v) => !v)}
            aria-label={cameraOpen ? 'Close camera feed' : 'Open live camera feed'}
            aria-pressed={cameraOpen}
            className={[
              'glass-chip flex size-10 items-center justify-center rounded-full text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              cameraOpen ? '!bg-status-failed/80' : 'hover:bg-white/10',
            ].join(' ')}
          >
            <CameraIcon size={18} />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="glass-chip flex size-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div
            role="group"
            aria-label="Filter routes by stop type"
            className="glass-chip inline-flex rounded-full p-1"
          >
            <button
              type="button"
              onClick={() => setViewMode('pickups')}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                viewMode === 'pickups'
                  ? 'bg-status-arrived text-white shadow'
                  : 'text-white/65 hover:text-white',
              ].join(' ')}
              aria-pressed={viewMode === 'pickups'}
            >
              Pickups
            </button>
            <button
              type="button"
              onClick={() => setViewMode('deliveries')}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                viewMode === 'deliveries'
                  ? 'bg-status-departed text-white shadow'
                  : 'text-white/65 hover:text-white',
              ].join(' ')}
              aria-pressed={viewMode === 'deliveries'}
            >
              Deliveries
            </button>
          </div>

          {/* Route badge — portrait only */}
          {!isLandscape && focusRoute && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open route timeline"
              className="glass-chip flex items-center gap-2 rounded-full px-3 py-2 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <DroneIcon size={13} className="shrink-0 text-white/55" />
              <span className="text-xs font-semibold text-white">
                {focusRoute.id.toUpperCase()}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Landscape: persistent right-side timeline */}
      {isLandscape && focusRoute && (
        <RouteTimelinePanel
          routeId={focusRoute.id}
          stops={focusRoute.stops}
          drone={focusDrone}
          onRowOpen={() => handleSelectRoute(focusRoute.id)}
          className="fixed right-5 top-20 bottom-32 z-30 w-[22rem] max-w-[24rem]"
        />
      )}

      {/* Bottom command card */}
      <div
        className={[
          'fixed bottom-6 z-30',
          isLandscape ? 'left-6' : 'left-1/2 -translate-x-1/2',
        ].join(' ')}
      >
        <CommandCard
          leftIcon={
            <span className="flex flex-col items-center leading-none">
              <span className="text-sm font-bold tabular-nums text-white">
                {focusDrone ? `${Math.round(focusDrone.speedMs)}` : '—'}
              </span>
              <span className="text-[8px] font-semibold uppercase tracking-wide text-white/50">
                m/s
              </span>
            </span>
          }
          leftLabel="Open route list"
          onLeftPress={() => setDrawerOpen(true)}
          centerValue={batteryPct !== null ? String(Math.round(batteryPct)) : '—'}
          centerUnit="%"
          centerProgressPct={batteryPct ?? 0}
          centerColorClass={batteryColorClass}
          rightIcon={
            <span className="flex flex-col items-center leading-none">
              <span className="text-sm font-bold tabular-nums text-white">
                {altitudeM !== null ? `${altitudeM}m` : '—'}
              </span>
              <span className="text-[8px] font-semibold uppercase tracking-wide text-white/50">
                alt
              </span>
            </span>
          }
          rightLabel={layersOn ? 'Hide map layers' : 'Show map layers'}
          onRightPress={() => setLayersOn((v) => !v)}
          stats={focusDrone ? [
            { label: 'Range', value: `~${Math.round((focusDrone.batteryPct / 100) * 8)} km` },
            { label: 'Service', value: '12 h' },
            { label: 'Signal', value: 'Strong' },
            { label: 'Wind', value: '8 km/h' },
          ] : undefined}
          topTabAction={!focusDrone && !isLandscape ? () => setDrawerOpen(true) : undefined}
        />
      </div>

      <CameraFeedPip
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        altitude={focusDrone?.altitude}
        speedMs={focusDrone?.speedMs}
      />

      {/* Portrait: drawer modal */}
      {!isLandscape && (
        <FleetDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          route={focusRoute}
          drone={focusDrone}
          onOpenRoute={handleSelectRoute}
        />
      )}
    </div>
  );
}
