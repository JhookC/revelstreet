import type { Route } from '@/modules/route-execution/types';

export const MOCK_ROUTE: Route = {
  id: 'route-001',
  operatorId: 'op-fox-7',
  stops: [
    {
      id: 's1',
      type: 'pickup',
      label: 'Sunset Tacos',
      address: '412 Sunset Blvd',
      order: 1,
      status: 'pending',
      history: [],
    },
    {
      id: 's2',
      type: 'pickup',
      label: 'Marina Sushi',
      address: '88 Pier Walk',
      order: 2,
      status: 'pending',
      history: [],
    },
    {
      id: 's3',
      type: 'delivery',
      label: 'Apt 3B — Patel',
      address: '17 Linden Ave, Apt 3B',
      order: 3,
      status: 'pending',
      history: [],
    },
    {
      id: 's4',
      type: 'delivery',
      label: 'Apt 1 — Nguyen',
      address: '942 Oak St, Apt 1',
      order: 4,
      status: 'pending',
      history: [],
    },
    {
      id: 's5',
      type: 'delivery',
      label: 'House — Hernández',
      address: '6 Marigold Ct',
      order: 5,
      status: 'pending',
      history: [],
    },
  ],
};
