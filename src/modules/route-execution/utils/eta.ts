import type { DronePosition, Stop } from '../types';

const EARTH_RADIUS_M = 6371000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function calculateEtaMinutes(
  activeStop: Stop | null | undefined,
  drone: DronePosition | undefined,
): number | null {
  if (!activeStop || !drone || drone.speedMs <= 0.1) return null;
  const meters = haversineMeters(
    { lat: drone.lat, lng: drone.lng },
    activeStop.coordinates,
  );
  const seconds = meters / drone.speedMs;
  return Math.max(1, Math.round(seconds / 60));
}
