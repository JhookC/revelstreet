import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import type { FailureReason, Route, StopStatus } from '../types';

export const routeKeys = {
  all: ['routes'] as const,
  byId: (id: string) => ['routes', id] as const,
};

export function useRouteQuery(routeId: string) {
  return useQuery({
    queryKey: routeKeys.byId(routeId),
    queryFn: () => apiFetch<Route>(`/api/routes/${routeId}`),
  });
}

interface MarkStatusArgs {
  stopId: string;
  status: StopStatus;
  reason?: FailureReason;
}

export function useMarkStatusMutation(routeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, status, reason }: MarkStatusArgs) =>
      apiFetch<Route>(`/api/routes/${routeId}/stops/${stopId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
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
