import { http, HttpResponse } from 'msw';
import { MOCK_FLEET } from '@/mock/fleet';
import type {
  DronePosition,
  FailureReason,
  FleetTelemetryEntry,
  Route,
  StopStatus,
  WeatherCondition,
} from '@/modules/route-execution';

let stores = new Map<string, Route>(MOCK_FLEET.map((r) => [r.id, structuredClone(r)]));

export function resetStore(): void {
  stores = new Map(MOCK_FLEET.map((r) => [r.id, structuredClone(r)]));
}

/** Replace the in-memory fleet store. Used at app startup with location-aware routes. */
export function setStore(routes: Route[]): void {
  stores = new Map(routes.map((r) => [r.id, structuredClone(r)]));
}

interface PatchStopBody {
  status: StopStatus;
  reason?: FailureReason;
  photo?: string;
}

export const handlers = [
  http.get('/api/fleet', () => {
    return HttpResponse.json([...stores.values()]);
  }),

  http.get('/api/routes/:routeId', ({ params }) => {
    const route = stores.get(params.routeId as string);
    if (!route) {
      return HttpResponse.json({ error: 'Route not found' }, { status: 404 });
    }
    return HttpResponse.json(route);
  }),

  http.patch('/api/routes/:routeId/stops/:stopId', async ({ params, request }) => {
    const route = stores.get(params.routeId as string);
    if (!route) {
      return HttpResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    const body = (await request.json()) as PatchStopBody;
    const stop = route.stops.find((s) => s.id === params.stopId);

    if (!stop) {
      return HttpResponse.json({ error: 'Stop not found' }, { status: 404 });
    }

    const updatedRoute: Route = {
      ...route,
      stops: route.stops.map((s) =>
        s.id === params.stopId
          ? {
              ...s,
              status: body.status,
              failureReason: body.status === 'failed' ? body.reason : undefined,
              history: [...s.history, { at: Date.now(), status: body.status }],
              photos: body.photo ? [...s.photos, body.photo] : s.photos,
            }
          : s,
      ),
    };

    stores.set(params.routeId as string, updatedRoute);
    return HttpResponse.json(updatedRoute);
  }),

  // Simulates live drone telemetry — small jitter on each call to mimic movement
  http.get('/api/routes/:routeId/telemetry', ({ params }) => {
    const route = stores.get(params.routeId as string);
    if (!route?.drone) {
      return HttpResponse.json({ error: 'No telemetry' }, { status: 404 });
    }

    const jitter = () => (Math.random() - 0.5) * 0.0002;
    const drone: DronePosition = {
      ...route.drone,
      lng: route.drone.lng + jitter(),
      lat: route.drone.lat + jitter(),
      heading: (route.drone.heading + Math.round((Math.random() - 0.5) * 10) + 360) % 360,
      speedMs: Math.max(0, route.drone.speedMs + (Math.random() - 0.5) * 0.5),
      batteryPct: Math.max(0, route.drone.batteryPct - Math.random() * 0.05),
    };

    return HttpResponse.json(drone);
  }),

  // Aggregated fleet drone telemetry — all drones with jitter
  http.get('/api/fleet/telemetry', () => {
    const jitter = () => (Math.random() - 0.5) * 0.0002;
    const telemetry: FleetTelemetryEntry[] = [...stores.values()]
      .filter((r): r is Route & { drone: DronePosition } => r.drone != null)
      .map((r) => ({
        routeId: r.id,
        drone: {
          ...r.drone,
          lng: r.drone.lng + jitter(),
          lat: r.drone.lat + jitter(),
          heading: (r.drone.heading + Math.round((Math.random() - 0.5) * 10) + 360) % 360,
          speedMs: Math.max(0, r.drone.speedMs + (Math.random() - 0.5) * 0.5),
          batteryPct: Math.max(0, r.drone.batteryPct - Math.random() * 0.05),
        },
      }));
    return HttpResponse.json(telemetry);
  }),

  // Static mock weather — advisory level to test the banner
  http.get('/api/weather', () => {
    const condition: WeatherCondition = {
      level: 'advisory',
      summary: 'Gusts up to 28 km/h — proceed with care',
    };
    return HttpResponse.json(condition);
  }),
];
