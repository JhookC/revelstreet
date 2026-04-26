import type { Map as MapboxMap } from 'mapbox-gl';

/**
 * Hide all traffic / incident layers from the active map style.
 * Drones don't follow roads — traffic congestion is irrelevant noise.
 *
 * The Mapbox `navigation-*-v1` styles bundle traffic via the `mapbox-traffic-v1` source.
 * We also fall back to id-pattern matching for any custom traffic/incident layers.
 */
export function hideTrafficLayers(map: MapboxMap): void {
  const layers = map.getStyle()?.layers ?? [];
  layers.forEach((layer) => {
    const sourcedFromTraffic =
      'source' in layer && layer.source === 'mapbox-traffic-v1';
    const namedLikeTraffic =
      layer.id.toLowerCase().includes('traffic') ||
      layer.id.toLowerCase().includes('incident') ||
      layer.id.toLowerCase().includes('congestion');

    if (sourcedFromTraffic || namedLikeTraffic) {
      try {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      } catch {
        // Layer may have been removed or lack layout — skip silently.
      }
    }
  });
}
