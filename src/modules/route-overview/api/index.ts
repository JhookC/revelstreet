import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import type { Route } from '@/modules/route-execution';

export const fleetKeys = {
  all: ['fleet'] as const,
};

export function useFleetQuery() {
  return useQuery({
    queryKey: fleetKeys.all,
    queryFn: () => apiFetch<Route[]>('/api/fleet'),
  });
}
