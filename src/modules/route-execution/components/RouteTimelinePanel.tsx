import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '@heroui/react';
import type {
  DronePosition,
  FailureReason,
  Stop,
  StopStatus,
} from '../types';
import { calculateEtaMinutes } from '../utils/eta';
import { FailureReasonSheet } from './FailureReasonSheet';

interface Props {
  routeId: string;
  stops: Stop[];
  drone: DronePosition | null;
  /** When true, weather alert grounds the drone (no actions allowed). */
  grounded?: boolean;
  /** Provide to enable inline action buttons on the active row (RouteScreen). */
  onMarkStatus?: (
    stopId: string,
    status: StopStatus,
    reason?: FailureReason,
  ) => void;
  /** Provide to make rows clickable as a whole (FleetScreen → open route). */
  onRowOpen?: (stopId: string) => void;
  /** Header CTA — useful in FleetScreen preview mode. */
  headerCta?: { label: string; onPress: () => void };
  /** Optional dimensions when used as a fixed-position landscape panel. */
  className?: string;
  style?: CSSProperties;
  /** Skip the .glass-pane container styling — useful when nested inside another glass surface. */
  bare?: boolean;
}

const TERMINAL: ReadonlySet<StopStatus> = new Set(['success', 'failed']);

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const formatReason = (r: FailureReason) =>
  r.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const STATUS_LABEL: Record<StopStatus, string> = {
  pending: 'Pending',
  arrived: 'Arrived',
  departed: 'En route',
  success: 'Done',
  failed: 'Failed',
};

function StatusCircle({
  status,
  isActive,
}: {
  status: StopStatus;
  isActive: boolean;
}) {
  if (status === 'success') {
    return (
      <div
        aria-hidden
        className="flex size-6 items-center justify-center rounded-full bg-status-success text-[11px] font-bold text-white shadow-sm"
      >
        ✓
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div
        aria-hidden
        className="flex size-6 items-center justify-center rounded-full bg-status-failed text-[11px] font-bold text-white shadow-sm"
      >
        ✕
      </div>
    );
  }
  if (isActive) {
    return (
      <div
        aria-hidden
        className="relative flex size-6 items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/50 ring-4 ring-accent/40"
      >
        {/* Outer breath ring */}
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/40" />
        <span className="relative size-2 rounded-full bg-white" />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className="size-6 rounded-full border-2 border-white/40 bg-transparent"
    />
  );
}

interface RowProps {
  stop: Stop;
  isActive: boolean;
  isLast: boolean;
  /** True when the NEXT row in the list is the active stop — this row owns the "current segment" connector. */
  isNextActive: boolean;
  contextLine: string;
  onMarkStatus?: Props['onMarkStatus'];
  onRowOpen?: Props['onRowOpen'];
  grounded?: boolean;
}

function TimelineRow({
  stop,
  isActive,
  isLast,
  isNextActive,
  contextLine,
  onMarkStatus,
  onRowOpen,
  grounded,
}: RowProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const interactive = !!onMarkStatus;
  const clickable = !!onRowOpen;
  const isTerminal = TERMINAL.has(stop.status);

  const handle = (status: StopStatus) => () => onMarkStatus?.(stop.id, status);

  function actionRow() {
    if (!interactive || !isActive) return null;
    if (grounded) {
      return (
        <p
          role="status"
          className="mt-2 rounded-xl bg-status-failed/15 px-3 py-2 text-xs font-semibold text-status-failed"
        >
          🛑 Operations grounded — weather hold
        </p>
      );
    }
    switch (stop.status) {
      case 'pending':
        return (
          <Button
            size="sm"
            fullWidth
            className="mt-2 rounded-full bg-status-arrived/90 text-white shadow ring-1 ring-white/20"
            onPress={handle('arrived')}
          >
            Mark Arrived
          </Button>
        );
      case 'arrived':
        return (
          <Button
            size="sm"
            fullWidth
            className="mt-2 rounded-full bg-status-departed/90 text-white shadow ring-1 ring-white/20"
            onPress={handle('departed')}
          >
            Mark Departed
          </Button>
        );
      case 'departed':
        return (
          <div className="mt-2 flex flex-col gap-2">
            <Button
              size="sm"
              fullWidth
              className="rounded-full bg-status-success/90 text-white shadow ring-1 ring-white/20"
              onPress={handle('success')}
            >
              {stop.type === 'pickup' ? 'Picked up' : 'Delivered'}
            </Button>
            <Button
              size="sm"
              fullWidth
              className="rounded-full bg-status-failed/85 text-white shadow ring-1 ring-white/20"
              onPress={() => setPickerOpen(true)}
              aria-label="Mark stop failed and pick a reason"
            >
              Failed…
            </Button>
            <FailureReasonSheet
              open={pickerOpen}
              onPick={(reason) => {
                onMarkStatus?.(stop.id, 'failed', reason);
                setPickerOpen(false);
              }}
              onClose={() => setPickerOpen(false)}
            />
          </div>
        );
      default:
        return null;
    }
  }

  // The connector OWNED by this row goes down to the next row.
  // SOLID + bright when the next row is the active stop (current segment being travelled).
  // DASHED + muted otherwise (queued or historical segments).
  const connectorClass = isNextActive
    ? 'border-l-2 border-solid border-accent/80'
    : 'border-l-2 border-dashed border-white/25';

  const content = (
    <div className="flex-1 pb-4">
      <div className="flex items-baseline gap-2">
        <span aria-hidden className="text-base leading-none">
          {stop.type === 'pickup' ? '📦' : '🏠'}
        </span>
        <h3
          className={[
            'truncate text-sm font-semibold leading-tight',
            isTerminal ? 'text-white/45' : 'text-white',
          ].join(' ')}
        >
          {stop.label}
        </h3>
      </div>
      <p
        className={[
          'mt-0.5 truncate text-[11px]',
          isTerminal ? 'text-white/40' : 'text-white/70',
        ].join(' ')}
      >
        {stop.address}
      </p>
      <p
        className={[
          'mt-1 text-[11px] tabular-nums',
          isTerminal ? 'text-white/40' : 'text-white/55',
        ].join(' ')}
      >
        {contextLine}
      </p>
      {actionRow()}
    </div>
  );

  return (
    <li className="flex gap-3">
      <div className="flex w-6 shrink-0 flex-col items-center pt-1">
        <StatusCircle status={stop.status} isActive={isActive} />
        {!isLast && <div className={`mt-1 flex-1 ${connectorClass}`} />}
      </div>
      {clickable ? (
        <button
          type="button"
          onClick={() => onRowOpen?.(stop.id)}
          className="flex-1 cursor-pointer text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label={`Open ${stop.label}`}
        >
          {content}
        </button>
      ) : (
        content
      )}
    </li>
  );
}

export function RouteTimelinePanel({
  routeId,
  stops,
  drone,
  grounded,
  onMarkStatus,
  onRowOpen,
  headerCta,
  className = '',
  style,
  bare = false,
}: Props) {
  const sorted = [...stops].sort((a, b) => a.order - b.order);
  const activeStop = sorted.find((s) => !TERMINAL.has(s.status));
  const eta = calculateEtaMinutes(activeStop, drone ?? undefined);
  const completed = sorted.filter((s) => TERMINAL.has(s.status)).length;

  const rows = sorted.map((stop, idx) => {
    const isActive = stop.id === activeStop?.id;
    const isLast = idx === sorted.length - 1;
    const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;
    const isNextActive = !!next && next.id === activeStop?.id;
    const lastEntry = stop.history.at(-1);

    let contextLine: string;
    if (stop.status === 'success' || stop.status === 'failed') {
      const ts = lastEntry ? formatTime(lastEntry.at) : '—';
      const reason = stop.failureReason ? ` · ${formatReason(stop.failureReason)}` : '';
      contextLine = `${STATUS_LABEL[stop.status]} · ${ts}${reason}`;
    } else if (isActive) {
      const etaPart = eta != null ? `ETA ${eta} min` : 'Awaiting drone';
      const battPart = drone ? ` · ⚡ ${Math.round(drone.batteryPct)}%` : '';
      contextLine = `${etaPart}${battPart}`;
    } else {
      contextLine = `Stop ${stop.order} · queued`;
    }

    return (
      <TimelineRow
        key={stop.id}
        stop={stop}
        isActive={isActive}
        isLast={isLast}
        isNextActive={isNextActive}
        contextLine={contextLine}
        onMarkStatus={onMarkStatus}
        onRowOpen={onRowOpen}
        grounded={grounded}
      />
    );
  });

  return (
    <section
      aria-label={`Timeline for ${routeId}`}
      style={style}
      className={[
        bare ? '' : 'glass-pane rounded-3xl',
        'flex flex-col overflow-hidden text-white',
        className,
      ].join(' ')}
    >
      <header className="flex items-center justify-between gap-2 border-b border-white/15 px-5 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/55">
            Route
          </p>
          <p className="truncate text-sm font-semibold text-white">{routeId}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white">
            {completed}/{sorted.length}
          </span>
          {headerCta && (
            <Button
              size="sm"
              className="rounded-full bg-accent/90 text-white shadow ring-1 ring-white/20"
              onPress={headerCta.onPress}
            >
              {headerCta.label}
            </Button>
          )}
        </div>
      </header>

      <ul className="flex-1 overflow-y-auto px-5 py-4">
        {rows.length === 0 ? (
          <li className="flex h-full items-center justify-center text-xs text-white/55">
            No stops on this route.
          </li>
        ) : (
          rows
        )}
      </ul>
    </section>
  );
}
