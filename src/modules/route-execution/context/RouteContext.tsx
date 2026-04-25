import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { FailureReason, Route, Stop, StopStatus } from '../types';
import { ALLOWED_TRANSITIONS, FINAL_STATUSES } from '../types';
import { usePersistedRoute } from '../hooks/usePersistedRoute';

interface ActionSnapshot {
  stopId: string;
  prevStatus: StopStatus;
  prevReason: FailureReason | undefined;
  prevHistoryLength: number;
  nextStatus: StopStatus;
}

interface RouteContextValue {
  route: Route;
  activeStopId: string | null;
  completedCount: number;
  totalCount: number;
  markStatus: (
    stopId: string,
    next: StopStatus,
    reason?: FailureReason,
  ) => void;
  lastAction: ActionSnapshot | null;
  undo: () => void;
  dismissUndo: () => void;
}

const RouteContext = createContext<RouteContextValue | null>(null);

const UNDO_TIMEOUT_MS = 5000;

// Vite injects import.meta.env at build time; access defensively without
// requiring a vite-env.d.ts here.
const IS_DEV: boolean = (() => {
  try {
    const meta = import.meta as unknown as { env?: { DEV?: boolean } };
    return meta.env?.DEV === true;
  } catch {
    return false;
  }
})();

interface RouteProviderProps {
  children: ReactNode;
  initialRoute: Route;
}

export function RouteProvider({ children, initialRoute }: RouteProviderProps) {
  const [route, setRoute] = usePersistedRoute(initialRoute);
  const [lastAction, setLastAction] = useState<ActionSnapshot | null>(null);
  const lastActionRef = useRef<ActionSnapshot | null>(null);
  const routeRef = useRef<Route>(route);

  useEffect(() => {
    lastActionRef.current = lastAction;
  }, [lastAction]);

  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  const activeStopId = useMemo(() => {
    const sorted = [...route.stops].sort((a, b) => a.order - b.order);
    const next = sorted.find((s) => !FINAL_STATUSES.has(s.status));
    return next ? next.id : null;
  }, [route.stops]);

  const completedCount = useMemo(
    () => route.stops.filter((s) => FINAL_STATUSES.has(s.status)).length,
    [route.stops],
  );
  const totalCount = route.stops.length;

  const markStatus = useCallback(
    (stopId: string, next: StopStatus, reason?: FailureReason) => {
      // Read the target stop synchronously from the ref BEFORE calling setRoute.
      // State updaters run asynchronously in concurrent mode, so any assignment
      // inside the updater closure would be invisible to the outer function.
      const target = routeRef.current.stops.find((s) => s.id === stopId);
      if (!target) return;

      if (!ALLOWED_TRANSITIONS[target.status].has(next)) {
        if (IS_DEV) {
          // eslint-disable-next-line no-console
          console.warn(
            `[RouteContext] illegal transition ${target.status} → ${next} for stop ${stopId} — no-op`,
          );
        }
        return;
      }

      const snapshot: ActionSnapshot = {
        stopId,
        prevStatus: target.status,
        prevReason: target.failureReason,
        prevHistoryLength: target.history.length,
        nextStatus: next,
      };

      setRoute((prev) => {
        const t = prev.stops.find((s) => s.id === stopId);
        if (!t) return prev;

        // Defensive guard: re-validate transition in case state changed between
        // the ref read above and this updater running.
        if (!ALLOWED_TRANSITIONS[t.status].has(next)) return prev;

        const updated: Stop = {
          ...t,
          status: next,
          failureReason: next === 'failed' ? reason : undefined,
          history: [...t.history, { at: Date.now(), status: next }],
        };
        return {
          ...prev,
          stops: prev.stops.map((s) => (s.id === stopId ? updated : s)),
        };
      });

      setLastAction(snapshot);
    },
    [setRoute],
  );

  const undo = useCallback(() => {
    const snap = lastActionRef.current;
    if (!snap) return;

    setRoute((prev) => {
      const target = prev.stops.find((s) => s.id === snap.stopId);
      if (!target) return prev;
      const updated: Stop = {
        ...target,
        status: snap.prevStatus,
        failureReason: snap.prevReason,
        history: target.history.slice(0, snap.prevHistoryLength),
      };
      return {
        ...prev,
        stops: prev.stops.map((s) => (s.id === snap.stopId ? updated : s)),
      };
    });
    setLastAction(null);
  }, [setRoute]);

  const dismissUndo = useCallback(() => setLastAction(null), []);

  useEffect(() => {
    if (!lastAction) return;
    const t = window.setTimeout(() => setLastAction(null), UNDO_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [lastAction]);

  const value = useMemo<RouteContextValue>(
    () => ({
      route,
      activeStopId,
      completedCount,
      totalCount,
      markStatus,
      lastAction,
      undo,
      dismissUndo,
    }),
    [
      route,
      activeStopId,
      completedCount,
      totalCount,
      markStatus,
      lastAction,
      undo,
      dismissUndo,
    ],
  );

  return (
    <RouteContext.Provider value={value}>{children}</RouteContext.Provider>
  );
}

export function useRoute() {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error('useRoute must be used inside RouteProvider');
  return ctx;
}
