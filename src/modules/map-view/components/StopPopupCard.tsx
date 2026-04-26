import type { ReactNode } from 'react';
import type { DronePosition, Stop } from '@/modules/route-execution';
import { haversineMeters } from '@/modules/route-execution/utils/eta';

/** Fallback cruise speed when the drone is stationary (m/s). */
const CRUISE_SPEED_MS = 12;

const TYPE_INFO: Record<
  Stop['type'],
  { label: string; accent: string; textAccent: string }
> = {
  pickup: {
    label: 'Pickup',
    accent: 'bg-status-arrived',
    textAccent: 'text-status-arrived',
  },
  delivery: {
    label: 'Delivery',
    accent: 'bg-status-departed',
    textAccent: 'text-status-departed',
  },
};

const STATUS_LABEL: Record<Stop['status'], string> = {
  pending: 'Pending',
  arrived: 'Arrived',
  departed: 'Departed',
  success: 'Completed',
  failed: 'Failed',
};

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

function formatEta(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

interface Props {
  stop: Stop;
  drone?: DronePosition | null;
}

export function StopPopupCard({ stop, drone }: Props) {
  const info = TYPE_INFO[stop.type];
  const statusLabel = STATUS_LABEL[stop.status];

  let etaSection: ReactNode = null;
  if (drone) {
    const meters = haversineMeters(
      { lat: drone.lat, lng: drone.lng },
      stop.coordinates,
    );
    const speed = drone.speedMs > 0.5 ? drone.speedMs : CRUISE_SPEED_MS;
    const minutes = Math.max(1, Math.round(meters / speed / 60));
    const usingCruise = drone.speedMs <= 0.5;

    etaSection = (
      <div
        className={`mt-3 flex items-baseline justify-between gap-3 rounded-2xl ${info.accent} p-3 text-white shadow-md`}
      >
        <div>
          <div className="text-lg font-bold leading-none tabular-nums">
            {formatEta(minutes)}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-wide opacity-85">
            ETA{usingCruise ? ' · est.' : ''}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold tabular-nums">
            {formatDistance(meters)}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-wide opacity-85">
            Distance
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-pane min-w-[240px] rounded-2xl p-4">
      <div
        className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${info.textAccent}`}
      >
        <span>{info.label}</span>
        <span className="opacity-50">·</span>
        <span className="text-white/50">Stop #{stop.order}</span>
      </div>
      <h3 className="mt-1 text-base font-semibold text-white">{stop.label}</h3>
      <p className="mt-0.5 text-xs text-white/55">{stop.address}</p>

      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-xs">
        <span className="text-white/55">Status</span>
        <span className="font-semibold text-white">{statusLabel}</span>
      </div>

      {etaSection}
    </div>
  );
}
