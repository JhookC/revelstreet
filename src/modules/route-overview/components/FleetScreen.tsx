import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTheme } from '@/shared/context/ThemeContext';
import { Button } from '@heroui/react';
import type { Route } from '@/modules/route-execution';
import { FleetMapView } from '@/modules/map-view';
import { useFleetQuery, useFleetTelemetryQuery } from '../api';
import { RouteCard } from './RouteCard';

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

export function FleetScreen() {
  const { data: fleet, isLoading, isError } = useFleetQuery();
  const { data: telemetry = [] } = useFleetTelemetryQuery();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

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

  return (
    <div className="flex h-dvh flex-col bg-surface">
      <header className="sticky top-0 z-30 flex-none border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-full items-center justify-between px-5 py-4 lg:max-w-none">
          <h1 className="text-base font-semibold text-content">Fleet Overview</h1>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </Button>
        </div>
      </header>

      {/* Full-height content area — stacked on mobile, side-by-side on lg */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Map panel */}
        <div className="h-52 flex-none sm:h-64 lg:h-full lg:w-[45%] lg:border-r lg:border-border">
          <FleetMapView
            fleet={sortedFleet ?? []}
            telemetry={telemetry}
            onSelectRoute={handleSelectRoute}
            className="h-full w-full"
          />
        </div>

        {/* Route list panel */}
        <main className="flex-1 overflow-y-auto px-5 pb-16 pt-6">
          <div className="mx-auto max-w-2xl">
            {isLoading && (
              <div className="flex min-h-[40vh] items-center justify-center text-content-muted">
                Loading fleet…
              </div>
            )}

            {isError && (
              <div className="flex min-h-[40vh] items-center justify-center text-status-failed">
                Failed to load fleet data.
              </div>
            )}

            {sortedFleet?.length === 0 && (
              <div className="flex min-h-[40vh] items-center justify-center text-content-muted">
                No routes assigned.
              </div>
            )}

            {sortedFleet && sortedFleet.length > 0 && (
              <ul className="flex flex-col gap-3">
                {sortedFleet.map((route) => (
                  <li key={route.id}>
                    <RouteCard route={route} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
