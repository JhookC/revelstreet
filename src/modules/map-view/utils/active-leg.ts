import type { Map as MapboxMap } from 'mapbox-gl';
import type { Coordinates } from '@/modules/route-execution';

const SOURCE_ID = 'active-leg';
const LAYER_ID = 'active-leg-line';

let pulseFrame: number | null = null;

function emptyFeature(): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: [] },
    properties: {},
  };
}

/** Add the active-leg source + layer to the map. Idempotent. */
export function addActiveLegLayer(map: MapboxMap): void {
  if (map.getSource(SOURCE_ID)) return;

  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: emptyFeature(),
  });

  map.addLayer({
    id: LAYER_ID,
    type: 'line',
    source: SOURCE_ID,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': '#22c55e',
      'line-width': 5,
      'line-opacity': 0.9,
    },
  });

  startPulse(map);
}

/** Update the line's endpoints. Pass null/undefined to clear. */
export function setActiveLeg(
  map: MapboxMap,
  from: Coordinates | null | undefined,
  to: Coordinates | null | undefined,
): void {
  const source = map.getSource(SOURCE_ID);
  if (!source || !('setData' in source)) return;

  const feature: GeoJSON.Feature<GeoJSON.LineString> =
    from && to
      ? {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [from.lng, from.lat],
              [to.lng, to.lat],
            ],
          },
          properties: {},
        }
      : emptyFeature();

  source.setData(feature);
}

/** Pulse the active-leg's opacity 0.5–1.0 in a 1.5s loop. */
function startPulse(map: MapboxMap): void {
  if (pulseFrame !== null) return;

  const start = performance.now();
  const tick = (now: number): void => {
    if (!map.getLayer(LAYER_ID)) {
      pulseFrame = null;
      return;
    }
    const t = ((now - start) / 1500) % 1;
    // sine wave between 0.5 and 1.0
    const opacity = 0.5 + 0.5 * (Math.sin(t * Math.PI * 2) * 0.5 + 0.5);
    map.setPaintProperty(LAYER_ID, 'line-opacity', opacity);
    pulseFrame = requestAnimationFrame(tick);
  };
  pulseFrame = requestAnimationFrame(tick);
}

export function stopActiveLegPulse(): void {
  if (pulseFrame !== null) {
    cancelAnimationFrame(pulseFrame);
    pulseFrame = null;
  }
}
