import type { Map as MapboxMap } from 'mapbox-gl';

/**
 * Configure a dark night sky + horizon for high-pitch camera views.
 *
 * The bundled `navigation-night-v1` style ships with a default atmosphere
 * that renders almost-white at the horizon when pitch ≥ 60°. We override
 * the fog to blend the horizon into the same dark tones as the basemap,
 * so the upper portion of the screen reads as "night sky" instead of a
 * stray white band.
 */
export function addNightSky(map: MapboxMap): void {
  map.setFog({
    color: 'rgb(20, 22, 28)',
    'high-color': 'rgb(11, 13, 18)',
    'space-color': 'rgb(5, 6, 12)',
    'horizon-blend': 0.04,
    'star-intensity': 0.35,
  });
}
