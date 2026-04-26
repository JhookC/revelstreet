import { useRoute } from '../context/RouteContext';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Queued',
  arrived: 'Arrived',
  departed: 'En route',
  success: 'Done',
  failed: 'Failed',
};

interface Props {
  onExpand: () => void;
}

export function ActiveStopPeek({ onExpand }: Props) {
  const { activeStop, completedCount, totalCount } = useRoute();

  const label = activeStop
    ? activeStop.label
    : 'Route complete';

  const status = activeStop
    ? (STATUS_LABEL[activeStop.status] ?? activeStop.status)
    : `${completedCount}/${totalCount} stops done`;

  const emoji = activeStop
    ? (activeStop.type === 'pickup' ? '📦' : '🏠')
    : '✓';

  return (
    <button
      type="button"
      onClick={onExpand}
      aria-label="Open route timeline"
      className="glass-chip -mb-2 flex w-56 items-center justify-between gap-3 rounded-t-2xl px-4 py-3 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span aria-hidden className="shrink-0 text-base leading-none">{emoji}</span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold leading-tight text-white">{label}</p>
          <p className="text-[10px] leading-tight text-white/50">{status}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="text-[10px] tabular-nums text-white/40">
          {completedCount}/{totalCount}
        </span>
        <span aria-hidden className="text-[10px] text-white/40">↑</span>
      </div>
    </button>
  );
}
