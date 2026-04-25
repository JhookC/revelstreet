import { useEffect, useState, type Ref } from 'react';
import type { Stop, StopStatus } from '../types';
import { useRoute } from '../context/RouteContext';
import { StatusPill } from './StatusPill';
import { FailureReasonSheet } from './FailureReasonSheet';

interface Props {
  stop: Stop;
  isActive: boolean;
  isLocked: boolean;
  ref?: Ref<HTMLLIElement>;
}

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1);

const formatReason = (r: string) =>
  r.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const baseBtn =
  'inline-flex min-h-[48px] items-center justify-center rounded-2xl px-5 py-3 text-base font-semibold transition active:scale-[0.99] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2';
const primaryBtn = `${baseBtn} bg-accent text-white hover:bg-accent-strong focus-visible:outline-accent`;
const successBtn = `${baseBtn} bg-status-success text-white hover:brightness-110 focus-visible:outline-status-success`;
const dangerBtn = `${baseBtn} bg-status-failed/10 text-status-failed ring-1 ring-inset ring-status-failed/30 hover:bg-status-failed/15 focus-visible:outline-status-failed`;

export function StopRow({ stop, isActive, isLocked, ref }: Props) {
  const { markStatus } = useRoute();
  const [pickerOpen, setPickerOpen] = useState(false);
  const lastEntry = stop.history.at(-1);

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

  return (
    <li
      ref={ref}
      className={[
        'rounded-3xl border bg-[var(--color-surface-raised)] p-5 shadow-sm transition',
        isActive
          ? 'border-accent ring-2 ring-accent/30'
          : 'border-[var(--color-border)]',
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
            <h3 className="truncate text-lg font-semibold text-[var(--color-content)]">
              {stop.label}
            </h3>
            <StatusPill status={stop.status} stopType={stop.type} />
          </div>
          <p className="mt-1 truncate text-sm text-[var(--color-content-muted)]">
            {stop.address}
          </p>

          {lastEntry && (
            <p className="mt-2 text-xs text-[var(--color-content-soft)]">
              {capitalize(lastEntry.status)} at {formatTime(lastEntry.at)}
              {stop.failureReason
                ? ` • Reason: ${formatReason(stop.failureReason)}`
                : ''}
            </p>
          )}

          {isActive && (
            <div className="mt-4 flex flex-wrap gap-2">
              {stop.status === 'pending' && (
                <button
                  type="button"
                  onClick={handle('arrived')}
                  className={primaryBtn}
                >
                  Mark Arrived
                </button>
              )}
              {stop.status === 'arrived' && (
                <button
                  type="button"
                  onClick={handle('departed')}
                  className={primaryBtn}
                >
                  Mark Departed
                </button>
              )}
              {stop.status === 'departed' && (
                <>
                  <button
                    type="button"
                    onClick={handle('success')}
                    className={successBtn}
                  >
                    {stop.type === 'pickup' ? 'Picked up' : 'Delivered'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className={dangerBtn}
                  >
                    Failed…
                  </button>
                </>
              )}
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
