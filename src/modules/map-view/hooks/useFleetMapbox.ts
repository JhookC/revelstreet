import { useCallback, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { DronePosition, FleetTelemetryEntry, Route } from '@/modules/route-execution';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

const STATUS_COLORS: Record<string, string> = {
  'not-started': '#94a3b8',
  'in-progress': '#3b82f6',
  complete: '#22c55e',
};

const STATUS_LABELS: Record<string, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  complete: 'Complete',
};

function routeStatusKey(route: Route): string {
  const stops = route.stops;
  if (stops.every((s) => s.status === 'pending')) return 'not-started';
  if (stops.every((s) => s.status === 'success' || s.status === 'failed')) return 'complete';
  return 'in-progress';
}

interface FleetEntry {
  routeId: string;
  route: Route;
  drone: DronePosition;
}

export function useFleetMapbox(
  containerRef: React.RefObject<HTMLDivElement | null>,
  fleet: Route[],
  telemetry: FleetTelemetryEntry[],
  onSelect?: (routeId: string) => void,
) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  const buildEntries = useCallback((): FleetEntry[] => {
    return telemetry
      .map(({ routeId, drone }) => {
        const route = fleet.find((r) => r.id === routeId);
        if (!route) return null;
        return { routeId, route, drone };
      })
      .filter((e): e is FleetEntry => e !== null);
  }, [fleet, telemetry]);

  // Init map once
  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = TOKEN;

    const entries = buildEntries();
    const first = entries[0]?.drone;
    const center: [number, number] = first ? [first.lng, first.lat] : [-122.45, 37.77];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom: 11,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    mapRef.current = map;

    const markers = markersRef.current;
    return () => {
      markers.forEach((m) => m.remove());
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers whenever fleet or telemetry changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const entries = buildEntries();
    const activeRouteIds = new Set(entries.map((e) => e.routeId));

    // Remove stale markers
    for (const [routeId, marker] of markersRef.current) {
      if (!activeRouteIds.has(routeId)) {
        marker.remove();
        markersRef.current.delete(routeId);
      }
    }

    entries.forEach(({ routeId, route, drone }) => {
      const existing = markersRef.current.get(routeId);
      const statusKey = routeStatusKey(route);
      const color = STATUS_COLORS[statusKey] ?? STATUS_COLORS['not-started'];
      const completed = route.stops.filter(
        (s) => s.status === 'success' || s.status === 'failed',
      ).length;

      if (existing) {
        existing.setLngLat([drone.lng, drone.lat]);
        const el = existing.getElement();
        el.style.transform = `rotate(${drone.heading}deg)`;
        return;
      }

      const el = document.createElement('div');
      el.style.cssText = `
        width: 36px; height: 36px;
        display: flex; align-items: center; justify-content: center;
        font-size: 22px;
        transform: rotate(${drone.heading}deg);
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));
        cursor: pointer;
        outline: 3px solid ${color};
        border-radius: 50%;
        background: rgba(0,0,0,0.55);
      `;
      el.textContent = '🚁';
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `Route ${routeId} — ${STATUS_LABELS[statusKey] ?? statusKey}`);

      const popup = new mapboxgl.Popup({ offset: 18, closeButton: false })
        .setHTML(
          `<div style="font-size:13px;font-weight:600;color:#f1f5f9;margin-bottom:2px">${routeId}</div>
           <div style="font-size:11px;color:#94a3b8">${completed}/${route.stops.length} stops</div>
           <div style="font-size:11px;font-weight:500;color:${color};margin-top:3px">${STATUS_LABELS[statusKey] ?? statusKey}</div>`,
        );

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([drone.lng, drone.lat])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('click', () => {
        onSelectRef.current?.(routeId);
      });

      markersRef.current.set(routeId, marker);
    });
  }, [buildEntries]);
}
