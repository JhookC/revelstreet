import type {
  Coordinates,
  Route,
  Stop,
  StopType,
} from '@/modules/route-execution/types';

const PICKUP_LABELS = [
  'Sunrise Bakery',
  'Marina Sushi',
  'Burger Hub',
  'Thai Garden',
  'Pasta House',
  'Coffee Roasters',
  'Pizza Express',
  'Cloud Kitchen A',
  'Burrito Bros',
  'Sushi Bar',
];

const DELIVERY_LABELS = [
  'Apt 3B — Patel',
  'House — Hernández',
  'Suite 202 — Lee',
  'Apt 7A — Kim',
  'Penthouse — Cho',
  'House — Alvarez',
  'Apt 1 — Nguyen',
  'Loft 5 — Davis',
  'Townhouse — Singh',
  'Office Park — Müller',
];

const STREETS = [
  'Oak St',
  'Maple Ave',
  'Pine Ln',
  'Elm Rd',
  'Cedar Blvd',
  'Birch Ct',
  'Sunset Way',
  'Harbor Dr',
  'Marina Pkwy',
  'Garden Ln',
  'Linden Ave',
  'Commerce Dr',
];

const OPERATORS = ['op-fox-7', 'op-echo-3', 'op-victor-2', 'op-tango-9', 'op-sierra-1'];

const EARTH_RADIUS_M = 6_371_000;

function pick<T>(arr: readonly T[]): T {
  const i = Math.floor(Math.random() * arr.length);
  return arr[i] ?? arr[0]!;
}

function randomAddress(): string {
  const num = Math.floor(Math.random() * 9000) + 100;
  return `${num} ${pick(STREETS)}`;
}

/** Offset a coordinate by a distance (meters) at a bearing (degrees). */
function offsetCoords(center: Coordinates, distanceMeters: number, bearingDeg: number): Coordinates {
  const bearing = (bearingDeg * Math.PI) / 180;
  const dLat = (distanceMeters * Math.cos(bearing)) / EARTH_RADIUS_M;
  const dLng =
    (distanceMeters * Math.sin(bearing)) /
    (EARTH_RADIUS_M * Math.cos((center.lat * Math.PI) / 180));
  return {
    lat: center.lat + (dLat * 180) / Math.PI,
    lng: center.lng + (dLng * 180) / Math.PI,
  };
}

interface RandomPointOpts {
  /** Min radius in meters. Default 500m. */
  minRadius?: number;
  /** Max radius in meters. Default 10000m (10km). */
  maxRadius?: number;
}

function randomPointAround(center: Coordinates, opts: RandomPointOpts = {}): Coordinates {
  const { minRadius = 500, maxRadius = 10_000 } = opts;
  const distance = minRadius + Math.random() * (maxRadius - minRadius);
  const bearing = Math.random() * 360;
  return offsetCoords(center, distance, bearing);
}

function makeStop(
  id: string,
  type: StopType,
  order: number,
  coordinates: Coordinates,
): Stop {
  return {
    id,
    type,
    label: pick(type === 'pickup' ? PICKUP_LABELS : DELIVERY_LABELS),
    address: randomAddress(),
    coordinates,
    order,
    status: 'pending',
    history: [],
    photos: [],
  };
}

interface RouteOpts {
  routeId: string;
  operatorId: string;
  center: Coordinates;
  /** Drone start coordinates. Defaults to `center`. */
  droneAt?: Coordinates;
}

export function generateRoute({
  routeId,
  operatorId,
  center,
  droneAt,
}: RouteOpts): Route {
  // 5 stops total: 2 pickups + 3 deliveries, all within 10km of `center`
  const stops: Stop[] = [
    makeStop(`${routeId}-s1`, 'pickup', 1, randomPointAround(center)),
    makeStop(`${routeId}-s2`, 'pickup', 2, randomPointAround(center)),
    makeStop(`${routeId}-s3`, 'delivery', 3, randomPointAround(center)),
    makeStop(`${routeId}-s4`, 'delivery', 4, randomPointAround(center)),
    makeStop(`${routeId}-s5`, 'delivery', 5, randomPointAround(center)),
  ];

  // Demo seed: first pickup is already done so the timeline shows the
  // "completed → active → queued" progression on first load.
  const firstStop = stops[0]!;
  firstStop.status = 'success';
  firstStop.history = [{ at: Date.now() - 12 * 60_000, status: 'success' }];

  const start = droneAt ?? center;

  return {
    id: routeId,
    operatorId,
    drone: {
      lng: start.lng,
      lat: start.lat,
      heading: Math.floor(Math.random() * 360),
      altitude: 60 + Math.floor(Math.random() * 40),
      speedMs: 8 + Math.random() * 6,
      batteryPct: 75 + Math.random() * 25,
    },
    stops,
  };
}

/**
 * Generate the single active route around the user's location.
 * The route has 5 stops (2 pickup + 3 delivery), all within 10km of its center.
 * The drone starts at a small random offset (300m–2km) from the user so it doesn't sit on top of them.
 *
 * The app is single-drone / single-route; this returns Route[] for API shape compatibility.
 */
export function generateMockFleet(userLocation: Coordinates): Route[] {
  return [
    generateRoute({
      routeId: 'route-001',
      operatorId: OPERATORS[0]!,
      center: userLocation,
      droneAt: randomPointAround(userLocation, { minRadius: 300, maxRadius: 2000 }),
    }),
  ];
}
