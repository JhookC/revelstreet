import type { Map as MapboxMap } from 'mapbox-gl';

const LAYER_ID = '3d-buildings';

/**
 * Add an extruded buildings layer to the map.
 * Reads building height from the bundled `composite` source available in
 * navigation-* and dark-/light-/streets-v* styles.
 *
 * The layer is inserted UNDER the first symbol layer so road and place labels
 * stay legible above the buildings.
 *
 * Visible only at zoom ≥ 14 (where building footprints become useful).
 */
export function add3DBuildings(map: MapboxMap): void {
  if (map.getLayer(LAYER_ID)) return;

  const layers = map.getStyle()?.layers ?? [];
  const firstSymbolId = layers.find((l) => l.type === 'symbol')?.id;

  map.addLayer(
    {
      id: LAYER_ID,
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 13,
      paint: {
        'fill-extrusion-color': '#2a2d35',
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          13,
          0,
          15,
          ['get', 'height'],
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          13,
          0,
          15,
          ['get', 'min_height'],
        ],
        'fill-extrusion-opacity': 0.85,
      },
    },
    firstSymbolId,
  );
}
