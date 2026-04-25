import { useTheme } from '@/shared/context/ThemeContext';
import { Button } from '@heroui/react';
import { useFleetQuery } from '../api';
import { RouteCard } from './RouteCard';

export function FleetScreen() {
  const { data: fleet, isLoading, isError } = useFleetQuery();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-full bg-[var(--color-surface)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <h1 className="text-base font-semibold text-[var(--color-content)]">Fleet Overview</h1>
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

      <main className="mx-auto max-w-2xl px-5 pb-16 pt-6">
        {isLoading && (
          <div className="flex min-h-[40vh] items-center justify-center text-[var(--color-content-muted)]">
            Loading fleet…
          </div>
        )}

        {isError && (
          <div className="flex min-h-[40vh] items-center justify-center text-status-failed">
            Failed to load fleet data.
          </div>
        )}

        {fleet?.length === 0 && (
          <div className="flex min-h-[40vh] items-center justify-center text-[var(--color-content-muted)]">
            No routes assigned.
          </div>
        )}

        {fleet && fleet.length > 0 && (
          <ul className="flex flex-col gap-3">
            {fleet.map((route) => (
              <li key={route.id}>
                <RouteCard route={route} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
