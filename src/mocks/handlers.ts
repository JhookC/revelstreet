import { http, HttpResponse } from 'msw';
import { MOCK_FLEET } from '@/mock/fleet';
import type { FailureReason, Route, StopStatus } from '@/modules/route-execution';

let stores = new Map<string, Route>(MOCK_FLEET.map((r) => [r.id, structuredClone(r)]));

export function resetStore(): void {
  stores = new Map(MOCK_FLEET.map((r) => [r.id, structuredClone(r)]));
}

interface PatchStopBody {
  status: StopStatus;
  reason?: FailureReason;
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
            }
          : s,
      ),
    };

    stores.set(params.routeId as string, updatedRoute);
    return HttpResponse.json(updatedRoute);
  }),
];
