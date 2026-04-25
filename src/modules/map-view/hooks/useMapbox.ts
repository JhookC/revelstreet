import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Stop, DronePosition, Coordinates } from '@/modules/route-execution';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

const STATUS_COLORS: Record<string, string> = {
  pending: '#94a3b8',
  arrived: '#f59e0b',
  departed: '#3b82f6',
  success: '#22c55e',
  failed: '#ef4444',
};

function buildRouteGeoJSON(stops: Stop[]): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: stops
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((s) => [s.coordinates.lng, s.coordinates.lat]),
    },
    properties: {},
  };
}

interface UseMapboxOptions {
  stops: Stop[];
  drone?: DronePosition;
  center?: Coordinates;
  zoom?: number;
}

export function useMapbox(containerRef: React.RefObject<HTMLDivElement | null>, opts: UseMapboxOptions) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const droneMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const { stops, drone, center, zoom = 12 } = opts;

  // Derive map center: active stop > first stop > provided center
  const sorted = stops.slice().sort((a, b) => a.order - b.order);
  const activeStop = sorted.find((s) => s.status !== 'success' && s.status !== 'failed');
  const firstStop = sorted[0];
  const mapCenter: [number, number] = center
    ? [center.lng, center.lat]
    : activeStop
    ? [activeStop.coordinates.lng, activeStop.coordinates.lat]
    : firstStop
    ? [firstStop.coordinates.lng, firstStop.coordinates.lat]
    : [-122.45, 37.77];

  // Init map
  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: mapCenter,
      zoom,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    mapRef.current = map;

    map.on('load', () => {
      // Route polyline layer
      map.addSource('route', {
        type: 'geojson',
        data: buildRouteGeoJSON(stops),
      });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#6366f1', 'line-width': 3, 'line-dasharray': [2, 2] },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update stop markers when stops change
  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    stops.forEach((stop) => {
      const el = document.createElement('div');
      el.className = 'mapbox-stop-marker';
      const color = STATUS_COLORS[stop.status] ?? STATUS_COLORS.pending;
      el.style.cssText = `
        width: 24px; height: 24px; border-radius: 50%;
        background: ${color}; border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        cursor: default;
        display: flex; align-items: center; justify-content: center;
        font-size: 10px; color: white; font-weight: bold;
      `;
      el.textContent = String(stop.order);

      const popup = new mapboxgl.Popup({ offset: 14, closeButton: false })
        .setHTML(
          `<div style="font-size:13px;font-weight:600">${stop.label}</div>
           <div style="font-size:11px;color:#64748b">${stop.address}</div>`,
        );

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Update route line
    const source = map.getSource('route');
    if (source && 'setData' in source) {
      source.setData(buildRouteGeoJSON(stops));
    }
  }, [stops]);

  // Update drone marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    droneMarkerRef.current?.remove();
    droneMarkerRef.current = null;

    if (!drone) return;

    const el = document.createElement('div');
    el.className = 'mapbox-drone-marker';
    el.style.cssText = `
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      transform: rotate(${drone.heading}deg);
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    `;
    el.textContent = '🚁';

    droneMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat([drone.lng, drone.lat])
      .addTo(map);
  }, [drone]);
}
