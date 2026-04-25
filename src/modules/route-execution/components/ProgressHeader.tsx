import { Button, ProgressBar } from '@heroui/react';
import { useRoute } from '../context/RouteContext';
import { useTheme } from '@/shared/context/ThemeContext';

interface Props {
  onBack?: () => void;
}

export function ProgressHeader({ onBack }: Props) {
  const { completedCount, totalCount, activeStopId, route } = useRoute();
  const { theme, toggleTheme } = useTheme();
  const activeStop = route.stops.find((s) => s.id === activeStopId);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur">
      <div className="mx-auto max-w-2xl px-5 py-4">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-sm text-[var(--color-content-muted)] transition hover:text-[var(--color-content)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-label="Back to fleet"
              >
                ← Fleet
              </button>
            )}
            <div>
              <h1 className="text-base font-semibold leading-tight text-[var(--color-content)]">
                {route.operatorId}
              </h1>
              <p className="text-xs text-[var(--color-content-muted)]">{route.id}</p>
            </div>
          </div>
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
