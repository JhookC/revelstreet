import { useSyncExternalStore } from 'react';

const QUERY = '(orientation: landscape) and (min-width: 768px)';

function subscribe(cb: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/**
 * `true` when the viewport is in landscape orientation AND wide enough that a
 * side-panel layout makes sense (≥ 768px). Used to switch RouteScreen and
 * FleetScreen between portrait (bottom-centered overlays) and landscape
 * (right-side panel + bottom-left command card).
 */
export function useIsLandscape(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
