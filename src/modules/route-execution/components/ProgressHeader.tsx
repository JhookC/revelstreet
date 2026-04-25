import { Button, ProgressBar } from '@heroui/react';
import { useRoute } from '../context/RouteContext';
import { useTheme } from '@/shared/context/ThemeContext';

export function ProgressHeader() {
  const { completedCount, totalCount, activeStopId, route } = useRoute();
  const { theme, toggleTheme } = useTheme();
  const activeStop = route.stops.find((s) => s.id === activeStopId);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur">
      <div className="mx-auto max-w-2xl px-5 py-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-base font-semibold text-[var(--color-content)]">
            Active route
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm tabular-nums text-[var(--color-content-muted)]">
              {completedCount} / {totalCount} complete
            </span>
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
        </div>
        <ProgressBar
          aria-label="Route progress"
          value={completedCount}
          maxValue={totalCount}
          className="mt-2 w-full"
        >
          <ProgressBar.Track className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-sunken)]">
            <ProgressBar.Fill className="h-full rounded-full bg-status-success transition-all duration-300 ease-out" />
          </ProgressBar.Track>
        </ProgressBar>
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
