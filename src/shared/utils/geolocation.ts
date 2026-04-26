import type { Coordinates } from '@/modules/route-execution/types';

/** Default origin for the app: Times Square, New York. */
export const DEFAULT_LOCATION: Coordinates = { lat: 40.758, lng: -73.9855 };

export function getCachedUserLocation(): Coordinates {
  return DEFAULT_LOCATION;
}
