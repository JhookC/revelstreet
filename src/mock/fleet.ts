import type { Route } from '@/modules/route-execution/types';

const ROUTE_001: Route = {
  id: 'route-001',
  operatorId: 'op-fox-7',
  stops: [
    { id: 's1', type: 'pickup', label: 'Sunset Tacos', address: '412 Sunset Blvd', order: 1, status: 'pending', history: [] },
    { id: 's2', type: 'pickup', label: 'Marina Sushi', address: '88 Pier Walk', order: 2, status: 'pending', history: [] },
    { id: 's3', type: 'delivery', label: 'Apt 3B — Patel', address: '17 Linden Ave, Apt 3B', order: 3, status: 'pending', history: [] },
    { id: 's4', type: 'delivery', label: 'Apt 1 — Nguyen', address: '942 Oak St, Apt 1', order: 4, status: 'pending', history: [] },
    { id: 's5', type: 'delivery', label: 'House — Hernández', address: '6 Marigold Ct', order: 5, status: 'pending', history: [] },
  ],
};

const ROUTE_002: Route = {
  id: 'route-002',
  operatorId: 'op-echo-3',
  stops: [
    { id: 's2-1', type: 'pickup', label: 'Thai Garden', address: '55 Elm St', order: 1, status: 'success', failureReason: undefined, history: [{ at: 1714060800000, status: 'arrived' }, { at: 1714061100000, status: 'departed' }, { at: 1714061400000, status: 'success' }] },
    { id: 's2-2', type: 'delivery', label: 'Apt 7A — Kim', address: '30 Harbor Rd, Apt 7A', order: 2, status: 'success', failureReason: undefined, history: [{ at: 1714061700000, status: 'arrived' }, { at: 1714061900000, status: 'departed' }, { at: 1714062000000, status: 'success' }] },
    { id: 's2-3', type: 'delivery', label: 'Suite 202 — Lee', address: '12 Commerce Dr, Ste 202', order: 3, status: 'arrived', failureReason: undefined, history: [{ at: 1714062300000, status: 'arrived' }] },
    { id: 's2-4', type: 'delivery', label: 'House — Alvarez', address: '88 Pine Ln', order: 4, status: 'pending', failureReason: undefined, history: [] },
  ],
};

const ROUTE_003: Route = {
  id: 'route-003',
  operatorId: 'op-victor-2',
  stops: [
    { id: 's3-1', type: 'pickup', label: 'Burrito Bros', address: '200 Market St', order: 1, status: 'pending', failureReason: undefined, history: [] },
    { id: 's3-2', type: 'pickup', label: 'Cloud Kitchen A', address: '1 Industrial Way', order: 2, status: 'pending', failureReason: undefined, history: [] },
    { id: 's3-3', type: 'delivery', label: 'Penthouse — Cho', address: '400 Main Blvd, PH', order: 3, status: 'pending', failureReason: undefined, history: [] },
  ],
};

export const MOCK_FLEET: Route[] = [ROUTE_001, ROUTE_002, ROUTE_003];
