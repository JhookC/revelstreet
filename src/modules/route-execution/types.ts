export type StopType = 'pickup' | 'delivery';

export type StopStatus =
  | 'pending'
  | 'arrived'
  | 'departed'
  | 'success'
  | 'failed';

export type FailureReason =
  | 'refused'
  | 'wrong-address'
  | 'no-recipient'
  | 'damaged';

export interface StopHistoryEntry {
  at: number;
  status: StopStatus;
}

export interface Coordinates {
  lng: number;
  lat: number;
}

export interface DronePosition extends Coordinates {
  heading: number; // degrees, 0 = north
  altitude: number; // metres AGL
  speedMs: number; // m/s
  batteryPct: number; // 0–100
}

export interface WeatherCondition {
  level: 'clear' | 'advisory' | 'warning' | 'grounded';
  summary: string; // short human-readable description
}

export interface Stop {
  id: string;
  type: StopType;
  label: string;
  address: string;
  coordinates: Coordinates;
  order: number;
  status: StopStatus;
  failureReason?: FailureReason;
  history: StopHistoryEntry[];
  photos: string[]; // base64 data URLs, proof of delivery / pickup
}

export interface Route {
  id: string;
  operatorId: string;
  stops: Stop[];
  drone?: DronePosition;
}

export interface FleetTelemetryEntry {
  routeId: string;
  drone: DronePosition;
}

export const FINAL_STATUSES: ReadonlySet<StopStatus> = new Set([
  'success',
  'failed',
]);

export const ALLOWED_TRANSITIONS: Readonly<
  Record<StopStatus, ReadonlySet<StopStatus>>
> = {
  pending: new Set<StopStatus>(['arrived']),
  arrived: new Set<StopStatus>(['departed']),
  departed: new Set<StopStatus>(['success', 'failed']),
  success: new Set<StopStatus>(),
  failed: new Set<StopStatus>(),
};
