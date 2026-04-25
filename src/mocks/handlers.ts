import { http, HttpResponse } from 'msw';
import { MOCK_ROUTE } from '@/mock/route';
import type { FailureReason, Route, StopStatus } from '@/modules/route-execution';

let store: Route = structuredClone(MOCK_ROUTE);

export function resetStore(): void {
  store = structuredClone(MOCK_ROUTE);
}

interface PatchStopBody {
  status: StopStatus;
  reason?: FailureReason;
}

export const handlers = [
  http.get('/api/routes/:routeId', ({ params }) => {
    if (params.routeId !== store.id) {
      return HttpResponse.json({ error: 'Route not found' }, { status: 404 });
    }
    return HttpResponse.json(store);
  }),

  http.patch('/api/routes/:routeId/stops/:stopId', async ({ params, request }) => {
    if (params.routeId !== store.id) {
      return HttpResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    const body = (await request.json()) as PatchStopBody;
    const stop = store.stops.find((s) => s.id === params.stopId);

    if (!stop) {
      return HttpResponse.json({ error: 'Stop not found' }, { status: 404 });
    }

    store = {
      ...store,
      stops: store.stops.map((s) =>
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

    return HttpResponse.json(store);
  }),
];
