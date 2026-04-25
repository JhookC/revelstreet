import { useRoute } from '../context/RouteContext';

export function ProgressHeader() {
  const { completedCount, totalCount, activeStopId, route } = useRoute();
  const pct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const activeStop = route.stops.find((s) => s.id === activeStopId);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur">
      <div className="mx-auto max-w-2xl px-5 py-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-base font-semibold text-[var(--color-content)]">
            Active route
          </h1>
          <span className="text-sm tabular-nums text-[var(--color-content-muted)]">
            {completedCount} / {totalCount} complete
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-sunken)]">
          <div
            className="h-full rounded-full bg-status-success transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-valuenow={completedCount}
            aria-label="Route progress"
          />
        </div>
        {activeStop ? (
          <p className="mt-2 text-xs text-[var(--color-content-soft)]">
            Next:{' '}
            <span className="font-medium text-[var(--color-content)]">
              {activeStop.label}
            </span>
          </p>
        ) : (
          <p className="mt-2 text-xs text-status-success font-medium">
            Route complete · all stops finalized
          </p>
        )}
      </div>
    </header>
  );
}
