import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import type { DronePosition, FailureReason, Route, StopStatus, WeatherCondition } from '../types';

export const routeKeys = {
  all: ['routes'] as const,
  byId: (id: string) => ['routes', id] as const,
  telemetry: (id: string) => ['routes', id, 'telemetry'] as const,
};

export const weatherKeys = {
  all: ['weather'] as const,
};

export function useRouteQuery(routeId: string) {
  return useQuery({
    queryKey: routeKeys.byId(routeId),
    queryFn: () => apiFetch<Route>(`/api/routes/${routeId}`),
  });
}

export function useTelemetryQuery(routeId: string) {
  return useQuery({
    queryKey: routeKeys.telemetry(routeId),
    queryFn: () => apiFetch<DronePosition>(`/api/routes/${routeId}/telemetry`),
    refetchInterval: 3_000,
    staleTime: 2_000,
  });
}

export function useWeatherQuery() {
  return useQuery({
    queryKey: weatherKeys.all,
    queryFn: () => apiFetch<WeatherCondition>('/api/weather'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

interface MarkStatusArgs {
  stopId: string;
  status: StopStatus;
  reason?: FailureReason;
  photo?: string;
}

export function useMarkStatusMutation(routeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, status, reason, photo }: MarkStatusArgs) =>
      apiFetch<Route>(`/api/routes/${routeId}/stops/${stopId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason, photo }),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(routeKeys.byId(routeId), updated);
      // Keep the fleet list in sync without a refetch
      queryClient.setQueryData<Route[]>(['fleet'], (fleet) => {
        if (!fleet) return fleet;
        return fleet.map((r) => (r.id === routeId ? updated : r));
      });
    },
  });
}
