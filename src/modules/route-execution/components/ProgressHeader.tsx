import { Button, ProgressBar } from '@heroui/react';
import { useRoute } from '../context/RouteContext';
import { useTheme } from '@/shared/context/ThemeContext';

interface Props {
  onBack?: () => void;
}

export function ProgressHeader({ onBack }: Props) {
  const { completedCount, totalCount, activeStop, route } = useRoute();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto max-w-2xl px-5 py-4">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-sm text-content-muted transition hover:text-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-label="Back to fleet"
              >
                ← Fleet
              </button>
            )}
            <div>
              <h1 className="text-base font-semibold leading-tight text-content">
                {route.operatorId}
              </h1>
              <p className="text-xs text-content-muted">{route.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm tabular-nums text-content-muted">
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
          <ProgressBar.Track className="h-2 overflow-hidden rounded-full bg-surface-sunken">
            <ProgressBar.Fill className="h-full rounded-full bg-status-success transition-all duration-300 ease-out" />
          </ProgressBar.Track>
        </ProgressBar>
        {totalCount === 0 ? (
          <p className="mt-2 text-xs text-content-muted">
            No stops assigned
          </p>
        ) : activeStop ? (
          <p className="mt-2 text-xs text-content-soft">
            Next:{' '}
            <span className="font-medium text-content">
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
