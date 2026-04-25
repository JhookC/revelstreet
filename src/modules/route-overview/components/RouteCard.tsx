import { Link } from '@tanstack/react-router';
import type { Route } from '@/modules/route-execution';

interface Props {
  route: Route;
}

const TERMINAL = new Set(['success', 'failed'] as const);

function getRouteStatus(route: Route): 'not-started' | 'in-progress' | 'complete' {
  const stops = route.stops;
  if (stops.every((s) => s.status === 'pending')) return 'not-started';
  if (stops.every((s) => TERMINAL.has(s.status as 'success' | 'failed'))) return 'complete';
  return 'in-progress';
}

const STATUS_STYLES = {
  'not-started': 'bg-status-pending/15 text-status-pending',
  'in-progress': 'bg-status-arrived/15 text-status-arrived',
  complete: 'bg-status-success/15 text-status-success',
} as const;

const STATUS_LABELS = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  complete: 'Complete',
} as const;

export function RouteCard({ route }: Props) {
  const completed = route.stops.filter((s) => TERMINAL.has(s.status as 'success' | 'failed')).length;
  const total = route.stops.length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const status = getRouteStatus(route);
  const activeStop = route.stops.find((s) => s.status === 'arrived' || s.status === 'departed');
  const nextStop = route.stops.find((s) => s.status === 'pending');
  const current = activeStop ?? nextStop;

  return (
    <Link
      to="/routes/$routeId"
      params={{ routeId: route.id }}
      className="block rounded-3xl border border-border bg-surface-raised p-5 shadow-sm transition hover:border-accent hover:ring-2 hover:ring-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-content-muted">
            {route.operatorId}
          </p>
          <p className="mt-0.5 text-lg font-semibold text-content">
            {route.id}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="tabular-nums text-content-muted">
            {completed} / {total} stops
          </span>
          <span className="tabular-nums text-content-muted">{pct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
          <div
            className="h-full rounded-full bg-status-success transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {current && status !== 'complete' && (
        <p className="mt-3 truncate text-sm text-content-soft">
          {activeStop ? 'At: ' : 'Next: '}
          <span className="font-medium text-content">{current.label}</span>
        </p>
      )}
    </Link>
  );
}
