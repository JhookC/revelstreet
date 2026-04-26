import { useEffect, useState, type Ref } from 'react';
import { Button } from '@heroui/react';
import type { FailureReason, Stop, StopStatus } from '../types';
import { useRoute } from '../context/RouteContext';
import { useWeatherQuery } from '../api';
import { StatusPill } from './StatusPill';
import { FailureReasonSheet } from './FailureReasonSheet';
import { PhotoProof } from './PhotoProof';

interface Props {
  stop: Stop;
  isActive: boolean;
  isLocked: boolean;
  ref?: Ref<HTMLLIElement>;
}

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const formatReason = (r: FailureReason) =>
  r.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function StopRow({ stop, isActive, isLocked, ref }: Props) {
  const { markStatus, addPhoto } = useRoute();
  const { data: weather } = useWeatherQuery();
  const isGrounded = weather?.level === 'grounded';
  const [pickerOpen, setPickerOpen] = useState(false);
  const lastEntry = stop.history.at(-1);
  const isTerminal = stop.status === 'success' || stop.status === 'failed';

  // Auto-close failure sheet if the stop's status changes out from under us
  // (e.g. an undo flips departed → arrived while the sheet is open).
  // Intentional setState-in-effect: deriving `pickerOpen && status === 'departed'` would
  // cause the sheet to auto-reopen if the user re-marks departed after an undo.
  useEffect(() => {
    if (stop.status !== 'departed') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPickerOpen(false);
    }
  }, [stop.status]);

  const handle = (status: StopStatus) => () => markStatus(stop.id, status);

  function activeActions() {
    if (isGrounded) {
      return (
        <p className="text-xs font-medium text-status-failed" role="status">
          🛑 Operations suspended — weather grounded
        </p>
      );
    }

    switch (stop.status) {
      case 'pending':
        return (
          <Button size="lg" onPress={handle('arrived')}>
            Mark Arrived
          </Button>
        );
      case 'arrived':
        return (
          <Button size="lg" onPress={handle('departed')}>
            Mark Departed
          </Button>
        );
      case 'departed':
        return (
          <>
            <Button
              size="lg"
              className="bg-status-success text-white hover:brightness-110"
              onPress={handle('success')}
            >
              {stop.type === 'pickup' ? 'Picked up' : 'Delivered'}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="bg-status-failed/10 text-status-failed ring-1 ring-inset ring-status-failed/30 hover:bg-status-failed/15"
              onPress={() => setPickerOpen(true)}
              aria-label="Mark stop failed and pick a reason"
            >
              Failed…
            </Button>
          </>
        );
      case 'success':
      case 'failed':
        return null;
      default: {
        const _exhaustive: never = stop.status;
        void _exhaustive;
        return null;
      }
    }
  }

  return (
    <li
      ref={ref}
      className={[
        'rounded-3xl border bg-surface-raised p-5 shadow-sm transition',
        isActive ? 'border-accent ring-2 ring-accent/30' : 'border-border',
        isLocked ? 'opacity-50' : '',
      ].join(' ')}
      aria-current={isActive ? 'step' : undefined}
    >
      <div className="flex items-start gap-4">
        <div
          className={[
            'flex size-10 shrink-0 items-center justify-center rounded-full text-base font-semibold',
            stop.type === 'pickup'
              ? 'bg-status-arrived/15 text-status-arrived'
              : 'bg-status-departed/15 text-status-departed',
          ].join(' ')}
          aria-hidden
        >
          {stop.order}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate text-lg font-semibold text-content">
              {stop.label}
            </h3>
            <StatusPill status={stop.status} stopType={stop.type} />
          </div>
          <p className="mt-1 truncate text-sm text-content-muted">
            {stop.address}
          </p>

          {lastEntry && (
            <p className="mt-2 text-xs text-content-soft">
              {lastEntry.status.charAt(0).toUpperCase() + lastEntry.status.slice(1)} at{' '}
              {formatTime(lastEntry.at)}
              {stop.failureReason ? ` • Reason: ${formatReason(stop.failureReason)}` : ''}
            </p>
          )}

          {isTerminal && (
            <PhotoProof
              photos={stop.photos}
              onAdd={(dataUrl) => addPhoto(stop.id, dataUrl)}
            />
          )}

          {isActive && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeActions()}
            </div>
          )}
        </div>
      </div>

      <FailureReasonSheet
        open={pickerOpen}
        onPick={(reason) => {
          markStatus(stop.id, 'failed', reason);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </li>
  );
}
