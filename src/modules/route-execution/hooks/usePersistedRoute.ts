import { useEffect, useState } from 'react';
import type {
  FailureReason,
  Route,
  Stop,
  StopHistoryEntry,
  StopStatus,
  StopType,
} from '../types';

const storageKey = (routeId: string) => `revelstreet:route:${routeId}`;

const SCHEMA_VERSION = 1 as const;

interface PersistedBlob {
  schemaVersion: typeof SCHEMA_VERSION;
  route: Route;
}

const STOP_TYPES: ReadonlySet<StopType> = new Set(['pickup', 'delivery']);
const STOP_STATUSES: ReadonlySet<StopStatus> = new Set([
  'pending',
  'arrived',
  'departed',
  'success',
  'failed',
]);
const FAILURE_REASONS: ReadonlySet<FailureReason> = new Set([
  'refused',
  'wrong-address',
  'no-recipient',
  'damaged',
]);

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const isStopType = (v: unknown): v is StopType =>
  typeof v === 'string' && STOP_TYPES.has(v as StopType);

const isStopStatus = (v: unknown): v is StopStatus =>
  typeof v === 'string' && STOP_STATUSES.has(v as StopStatus);

const isFailureReason = (v: unknown): v is FailureReason =>
  typeof v === 'string' && FAILURE_REASONS.has(v as FailureReason);

const isHistoryEntry = (v: unknown): v is StopHistoryEntry => {
  if (!isObject(v)) return false;
  return typeof v.at === 'number' && isStopStatus(v.status);
};

const isStop = (v: unknown): v is Stop => {
  if (!isObject(v)) return false;
  if (typeof v.id !== 'string') return false;
  if (!isStopType(v.type)) return false;
  if (typeof v.label !== 'string') return false;
  if (typeof v.address !== 'string') return false;
  if (typeof v.order !== 'number') return false;
  if (!isStopStatus(v.status)) return false;
  if (v.failureReason !== undefined && !isFailureReason(v.failureReason)) {
    return false;
  }
  if (!Array.isArray(v.history)) return false;
  if (!v.history.every(isHistoryEntry)) return false;
  return true;
};

// Intentionally permissive: unknown extra fields are preserved — type safety is guaranteed by the caller's TypeScript types, not structural stripping.
function isValidPersistedRoute(
  value: unknown,
  expectedId: string,
): value is Route {
  if (!isObject(value)) return false;
  if (value.id !== expectedId) return false;
  if (typeof value.operatorId !== 'string') return false;
  if (!Array.isArray(value.stops)) return false;
  return value.stops.every(isStop);
}

const warned = new Set<string>();
const warnOnce = (msg: string) => {
  if (warned.has(msg)) return;
  warned.add(msg);
  // eslint-disable-next-line no-console
  console.warn(msg);
};

export function usePersistedRoute(initial: Route) {
  const [route, setRoute] = useState<Route>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(storageKey(initial.id));
      if (!raw) return initial;
      const parsed: unknown = JSON.parse(raw);
      if (!isObject(parsed)) {
        warnOnce('[usePersistedRoute] persisted blob is not an object');
        return initial;
      }
      if (parsed.schemaVersion !== SCHEMA_VERSION) {
        warnOnce(
          '[usePersistedRoute] schema version mismatch — falling back to initial',
        );
        return initial;
      }
      if (!isValidPersistedRoute(parsed.route, initial.id)) {
        warnOnce(
          '[usePersistedRoute] persisted route failed validation — falling back to initial',
        );
        return initial;
      }
      return parsed.route;
    } catch {
      warnOnce('[usePersistedRoute] failed to read persisted route');
      return initial;
    }
  });

  useEffect(() => {
    try {
      const blob: PersistedBlob = {
        schemaVersion: SCHEMA_VERSION,
        route,
      };
      window.localStorage.setItem(storageKey(route.id), JSON.stringify(blob));
    } catch {
      // localStorage unavailable or quota exceeded — silently skip
    }
  }, [route]);

  return [route, setRoute] as const;
}
