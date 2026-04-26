import { useRoute } from '../context/RouteContext';
import { useTheme } from '@/shared/context/ThemeContext';
import { useTelemetryQuery, useWeatherQuery } from '../api';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { CameraIcon } from '@/shared/components/icons';

interface Props {
  onBack?: () => void;
  onCameraToggle?: () => void;
  cameraOpen?: boolean;
}

export function RouteOverlay({ onBack, onCameraToggle, cameraOpen }: Props) {
  const { route } = useRoute();
  const { theme, toggleTheme } = useTheme();
  const { data: drone } = useTelemetryQuery(route.id);
  const { data: weather } = useWeatherQuery();
  const isOnline = useOnlineStatus();

  const isGrounded = weather?.level === 'grounded';
  const hasWeatherAlert = weather && weather.level !== 'clear';

  return (
    <div
      className={[
        'fixed left-5 right-5 z-[31] mx-auto flex max-w-2xl items-start justify-between gap-2',
        !isOnline ? 'top-14' : 'top-5',
      ].join(' ')}
    >
      {/* Left pill: back + route info */}
      <div className="glass-chip flex min-w-0 items-center gap-2 rounded-full px-3 py-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 text-sm font-medium text-white/70 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Back to fleet"
          >
            ←
          </button>
        )}
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold leading-tight text-white">
            {route.id}
          </p>
          <p className="truncate text-[10px] text-white/60">{route.operatorId}</p>
        </div>
      </div>

      {/* Right pill: status chips + theme toggle */}
      <div className="glass-chip flex shrink-0 items-center gap-1.5 rounded-full px-2 py-2">
        {hasWeatherAlert && (
          <span
            className={[
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              isGrounded
                ? 'bg-status-failed text-white'
                : weather?.level === 'warning'
                  ? 'bg-status-failed/30 text-status-failed'
                  : 'bg-status-arrived/30 text-status-arrived',
            ].join(' ')}
          >
            {weather?.level === 'grounded'
              ? '🛑 Grounded'
              : weather?.level === 'warning'
                ? '🌩️'
                : '⚠️'}
          </span>
        )}

        {drone && (
          <span className="tabular-nums rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-white">
            ⚡{Math.round(drone.batteryPct)}%
          </span>
        )}

        {onCameraToggle && (
          <button
            type="button"
            onClick={onCameraToggle}
            aria-label={cameraOpen ? 'Close camera feed' : 'Open live camera feed'}
            aria-pressed={cameraOpen}
            className={[
              'flex size-7 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              cameraOpen
                ? 'bg-status-failed/80 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white',
            ].join(' ')}
          >
            <CameraIcon size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          className="flex size-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </div>
  );
}
