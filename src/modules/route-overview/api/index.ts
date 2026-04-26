import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api/client';
import type { FleetTelemetryEntry, Route } from '@/modules/route-execution';

export const fleetKeys = {
  all: ['fleet'] as const,
  telemetry: ['fleet', 'telemetry'] as const,
};

export function useFleetQuery() {
  return useQuery({
    queryKey: fleetKeys.all,
    queryFn: () => apiFetch<Route[]>('/api/fleet'),
  });
}

export function useFleetTelemetryQuery() {
  return useQuery({
    queryKey: fleetKeys.telemetry,
    queryFn: () => apiFetch<FleetTelemetryEntry[]>('/api/fleet/telemetry'),
    refetchInterval: 5_000,
    staleTime: 3_000,
  });
}
