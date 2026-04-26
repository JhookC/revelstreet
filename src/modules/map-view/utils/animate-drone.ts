import type { Marker } from 'mapbox-gl';
import type { DronePosition } from '@/modules/route-execution';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Linear-interpolate between two angles taking the shortest arc. */
function lerpAngle(a: number, b: number, t: number): number {
  const diff = ((b - a + 540) % 360) - 180;
  return (a + diff * t + 360) % 360;
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export interface DroneAnimator {
  /** Animate the drone from its current pose to `target` over `duration` ms. */
  to(target: DronePosition, duration?: number): void;
  /** Cancel any in-progress animation. Call on unmount. */
  stop(): void;
  /** Read the current interpolated pose (live during animation). */
  current(): DronePosition;
}

/**
 * Smoothly interpolate a drone marker's lng/lat/heading between telemetry ticks.
 * Uses Marker.setRotation (with rotationAlignment 'map') so the drone rotates
 * relative to the map — when the camera bearing follows the drone's heading,
 * the helicopter visually stays pointing forward (screen up).
 */
export function createDroneAnimator(
  marker: Marker,
  initial: DronePosition,
): DroneAnimator {
  let currentPose: DronePosition = initial;
  let frame: number | null = null;

  function apply(pose: DronePosition): void {
    marker.setLngLat([pose.lng, pose.lat]);
    marker.setRotation(pose.heading);
  }

  apply(initial);

  return {
    to(target, duration = 3000) {
      if (frame !== null) cancelAnimationFrame(frame);

      const start: DronePosition = currentPose;
      const startTime = performance.now();

      const tick = (now: number): void => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = easeInOutQuad(t);

        currentPose = {
          ...target,
          lng: lerp(start.lng, target.lng, eased),
          lat: lerp(start.lat, target.lat, eased),
          heading: lerpAngle(start.heading, target.heading, eased),
        };

        apply(currentPose);

        if (t < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          frame = null;
        }
      };

      frame = requestAnimationFrame(tick);
    },
    stop() {
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    },
    current() {
      return currentPose;
    },
  };
}
