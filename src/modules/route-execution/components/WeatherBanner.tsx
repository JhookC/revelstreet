import { useWeatherQuery } from '../api';

const LEVEL_STYLES = {
  clear: null,
  advisory: 'bg-status-warning/15 border-status-warning text-status-warning',
  warning: 'bg-status-failed/15 border-status-failed text-status-failed',
  grounded: 'bg-status-failed border-status-failed text-white',
};

const LEVEL_ICONS = {
  clear: null,
  advisory: '⚠️',
  warning: '🌩️',
  grounded: '🛑',
};

export function WeatherBanner({ routeId }: { routeId: string }) {
  const { data } = useWeatherQuery();

  if (!data || data.level === 'clear') return null;

  const styles = LEVEL_STYLES[data.level];
  const icon = LEVEL_ICONS[data.level];

  return (
    <div
      aria-live="polite"
      aria-label={`Weather ${data.level}: ${data.summary}`}
      data-route-id={routeId}
      className={`flex items-center gap-2 border-b px-5 py-2 text-sm font-medium ${styles ?? ''}`}
    >
      <span aria-hidden>{icon}</span>
      <span>{data.summary}</span>
    </div>
  );
}
