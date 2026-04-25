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

export interface Stop {
  id: string;
  type: StopType;
  label: string;
  address: string;
  order: number;
  status: StopStatus;
  failureReason?: FailureReason;
  history: StopHistoryEntry[];
}

export interface Route {
  id: string;
  operatorId: string;
  stops: Stop[];
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
