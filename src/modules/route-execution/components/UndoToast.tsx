import { useRoute } from '../context/RouteContext';
import type { Stop, StopStatus } from '../types';

const verbFor = (status: StopStatus, stop: Stop): string => {
  switch (status) {
    case 'pending':
      return 'pending';
    case 'arrived':
      return 'arrived';
    case 'departed':
      return 'departed';
    case 'success':
      return stop.type === 'pickup' ? 'picked up' : 'delivered';
    case 'failed':
      return 'failed';
  }
};

export function UndoToast() {
  const { lastAction, route, undo, dismissUndo } = useRoute();
  if (!lastAction) return null;
  const stop = route.stops.find((s) => s.id === lastAction.stopId);
  if (!stop) return null;

  const verb = verbFor(lastAction.nextStatus, stop);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4"
    >
      <div className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl bg-content px-4 py-2 text-surface shadow-xl">
        <span className="truncate text-sm">
          Marked <strong className="font-semibold">{stop.label}</strong> as {verb}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={undo}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/15 px-4 text-sm font-semibold hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={dismissUndo}
            aria-label="Dismiss notification"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-lg text-white/60 hover:text-white"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
