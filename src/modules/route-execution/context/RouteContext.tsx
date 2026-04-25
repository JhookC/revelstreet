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
import { useQueryClient } from '@tanstack/react-query';
import type { FailureReason, Route, Stop, StopStatus } from '../types';
import { ALLOWED_TRANSITIONS, FINAL_STATUSES } from '../types';
import { useMarkStatusMutation, useRouteQuery, routeKeys } from '../api';

interface ActionSnapshot {
  stopId: string;
  prevStatus: StopStatus;
  prevReason: FailureReason | undefined;
  prevHistoryLength: number;
  nextStatus: StopStatus;
}

interface RouteContextValue {
  route: Route;
  isLoading: boolean;
  isError: boolean;
  activeStopId: string | null;
  activeStop: Stop | null;
  completedCount: number;
  totalCount: number;
  markStatus: (stopId: string, next: StopStatus, reason?: FailureReason) => void;
  lastAction: ActionSnapshot | null;
  undo: () => void;
  dismissUndo: () => void;
}

const RouteContext = createContext<RouteContextValue | null>(null);

const UNDO_TIMEOUT_MS = 5000;

const IS_DEV = import.meta.env.DEV;

const EMPTY_ROUTE: Route = { id: '', operatorId: '', stops: [] };

interface RouteProviderProps {
  children: ReactNode;
  routeId: string;
}

export function RouteProvider({ children, routeId }: RouteProviderProps) {
  const queryClient = useQueryClient();
  const { data: route, isLoading, isError } = useRouteQuery(routeId);
  const markMutation = useMarkStatusMutation(routeId);
  const [lastAction, setLastAction] = useState<ActionSnapshot | null>(null);
  const lastActionRef = useRef<ActionSnapshot | null>(null);

  useEffect(() => {
    lastActionRef.current = lastAction;
  }, [lastAction]);

  const activeStop = useMemo<Stop | null>(() => {
    if (!route) return null;
    const sorted = [...route.stops].sort((a, b) => a.order - b.order);
    return sorted.find((s) => !FINAL_STATUSES.has(s.status)) ?? null;
  }, [route]);
  const activeStopId = activeStop?.id ?? null;

  const completedCount = useMemo(
    () => route?.stops.filter((s) => FINAL_STATUSES.has(s.status)).length ?? 0,
    [route],
  );
  const totalCount = route?.stops.length ?? 0;

  const markStatus = useCallback(
    (stopId: string, next: StopStatus, reason?: FailureReason) => {
      const current = queryClient.getQueryData<Route>(routeKeys.byId(routeId));
      const target = current?.stops.find((s) => s.id === stopId);
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

      // Optimistic cache update — immediate UI response
      queryClient.setQueryData<Route>(routeKeys.byId(routeId), (prev) => {
        if (!prev) return prev;
        const updated: Stop = {
          ...target,
          status: next,
          failureReason: next === 'failed' ? reason : undefined,
          history: [...target.history, { at: Date.now(), status: next }],
        };
        return {
          ...prev,
          stops: prev.stops.map((s) => (s.id === stopId ? updated : s)),
        };
      });

      setLastAction(snapshot);

      // Background persist to server (MSW for now, real API later)
      markMutation.mutate({ stopId, status: next, reason });
    },
    [queryClient, routeId, markMutation],
  );

  const undo = useCallback(() => {
    const snap = lastActionRef.current;
    if (!snap) return;

    queryClient.setQueryData<Route>(routeKeys.byId(routeId), (prev) => {
      if (!prev) return prev;
      const target = prev.stops.find((s) => s.id === snap.stopId);
      if (!target) return prev;
      const restored: Stop = {
        ...target,
        status: snap.prevStatus,
        failureReason: snap.prevReason,
        history: target.history.slice(0, snap.prevHistoryLength),
      };
      return {
        ...prev,
        stops: prev.stops.map((s) => (s.id === snap.stopId ? restored : s)),
      };
    });
    setLastAction(null);
  }, [queryClient, routeId]);

  const dismissUndo = useCallback(() => setLastAction(null), []);

  useEffect(() => {
    if (!lastAction) return;
    const t = window.setTimeout(() => setLastAction(null), UNDO_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [lastAction]);

  const value = useMemo<RouteContextValue>(
    () => ({
      route: route ?? EMPTY_ROUTE,
      isLoading,
      isError,
      activeStopId,
      activeStop,
      completedCount,
      totalCount,
      markStatus,
      lastAction,
      undo,
      dismissUndo,
    }),
    [
      route,
      isLoading,
      isError,
      activeStopId,
      activeStop,
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
