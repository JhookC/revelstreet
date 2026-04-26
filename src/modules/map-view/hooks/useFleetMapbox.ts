import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { DronePosition, FleetTelemetryEntry, Route, Stop } from '@/modules/route-execution';
import { getCachedUserLocation } from '@/shared/utils/geolocation';
import { createStopMarkerElement } from '../utils/stop-marker';
import { hideTrafficLayers } from '../utils/hide-traffic';
import { add3DBuildings } from '../utils/add-3d-buildings';
import { addNightSky } from '../utils/add-night-sky';
import { createDroneAnimator, type DroneAnimator } from '../utils/animate-drone';
import {
  addActiveLegLayer,
  setActiveLeg,
  stopActiveLegPulse,
} from '../utils/active-leg';

interface OpenPopup {
  stop: Stop;
  container: HTMLDivElement;
}

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

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
  stopFilter?: 'pickups' | 'deliveries',
): { openPopup: OpenPopup | null; liveDrone: DronePosition | null } {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const droneMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const droneAnimatorsRef = useRef<Map<string, DroneAnimator>>(new Map());
  const stopMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const onSelectRef = useRef(onSelect);
  const liveDroneRef = useRef<DronePosition | null>(null);
  const [openPopup, setOpenPopup] = useState<OpenPopup | null>(null);
  const [liveDrone, setLiveDrone] = useState<DronePosition | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  // Track latest drone position so popup ETA can use the live value when opened.
  useEffect(() => {
    if (telemetry[0]?.drone) {
      liveDroneRef.current = telemetry[0].drone;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLiveDrone(telemetry[0].drone);
    }
  }, [telemetry]);

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
    const fallback = getCachedUserLocation();
    const center: [number, number] = first
      ? [first.lng, first.lat]
      : [fallback.lng, fallback.lat];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center,
      zoom: 17,
      pitch: 65,
      bearing: 0,
      maxPitch: 85,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('load', () => {
      hideTrafficLayers(map);
      add3DBuildings(map);
      addNightSky(map);
      addActiveLegLayer(map);
      // Force the pitch — some style packages override the constructor's value.
      map.setPitch(65);
    });
    map.on('style.load', () => {
      hideTrafficLayers(map);
      add3DBuildings(map);
      addNightSky(map);
    });

    mapRef.current = map;

    const droneMarkers = droneMarkersRef.current;
    const droneAnimators = droneAnimatorsRef.current;
    const stopMarkers = stopMarkersRef.current;
    return () => {
      droneAnimators.forEach((a) => a.stop());
      droneAnimators.clear();
      droneMarkers.forEach((m) => m.remove());
      droneMarkers.clear();
      stopMarkers.forEach((m) => m.remove());
      stopMarkers.clear();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync stop markers when the fleet or filter changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const allowedType: 'pickup' | 'delivery' | null =
      stopFilter === 'pickups' ? 'pickup' : stopFilter === 'deliveries' ? 'delivery' : null;

    const currentStopIds = new Set<string>();
    fleet.forEach((route) =>
      route.stops.forEach((s) => {
        if (allowedType === null || s.type === allowedType) {
          currentStopIds.add(s.id);
        }
      }),
    );

    // Remove stale or filtered-out stop markers; close popup if its stop is dropped
    for (const [stopId, marker] of stopMarkersRef.current) {
      if (!currentStopIds.has(stopId)) {
        marker.remove();
        stopMarkersRef.current.delete(stopId);
        setOpenPopup((prev) => (prev?.stop.id === stopId ? null : prev));
      }
    }

    // Add new stop markers (or update position if stop already exists)
    fleet.forEach((route) => {
      route.stops.forEach((stop) => {
        if (allowedType !== null && stop.type !== allowedType) return;

        const existing = stopMarkersRef.current.get(stop.id);
        if (existing) {
          existing.setLngLat([stop.coordinates.lng, stop.coordinates.lat]);
          return;
        }

        const el = createStopMarkerElement(stop);
        const container = document.createElement('div');
        container.className = 'mapbox-popup-react-root';
        const popup = new mapboxgl.Popup({
          offset: 18,
          closeButton: false,
          className: 'revelstreet-popup',
        }).setDOMContent(container);

        popup.on('open', () => setOpenPopup({ stop, container }));
        popup.on('close', () =>
          setOpenPopup((prev) => (prev?.stop.id === stop.id ? null : prev)),
        );

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
          .setPopup(popup)
          .addTo(map);

        stopMarkersRef.current.set(stop.id, marker);
      });
    });
  }, [fleet, stopFilter]);

  // Sync drone markers whenever telemetry/fleet changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const entries = buildEntries();
    const activeRouteIds = new Set(entries.map((e) => e.routeId));

    // Remove stale drone markers
    for (const [routeId, marker] of droneMarkersRef.current) {
      if (!activeRouteIds.has(routeId)) {
        marker.remove();
        droneMarkersRef.current.delete(routeId);
        droneAnimatorsRef.current.get(routeId)?.stop();
        droneAnimatorsRef.current.delete(routeId);
      }
    }

    entries.forEach(({ routeId, route, drone }) => {
      const existingAnimator = droneAnimatorsRef.current.get(routeId);
      const statusKey = routeStatusKey(route);

      if (existingAnimator) {
        // Smooth interpolated transition over the telemetry interval
        existingAnimator.to(drone, 5000);
        return;
      }

      const el = document.createElement('div');
      el.style.cssText = `
        display: flex; align-items: center; justify-content: center;
        font-size: 28px; line-height: 1;
        filter: drop-shadow(0 2px 5px rgba(0,0,0,0.7));
        pointer-events: none;
      `;
      el.textContent = '🚁';
      el.setAttribute('aria-label', `Drone — ${STATUS_LABELS[statusKey] ?? statusKey}`);

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
        rotation: drone.heading,
        rotationAlignment: 'map',
      })
        .setLngLat([drone.lng, drone.lat])
        .addTo(map);

      const animator = createDroneAnimator(marker, drone);
      droneMarkersRef.current.set(routeId, marker);
      droneAnimatorsRef.current.set(routeId, animator);
    });

    // Update active-leg line: drone of the first route → its first non-terminal stop
    const first = entries[0];
    if (first) {
      const sortedStops = [...first.route.stops].sort((a, b) => a.order - b.order);
      const activeStop = sortedStops.find(
        (s) => s.status !== 'success' && s.status !== 'failed',
      );
      if (activeStop) {
        setActiveLeg(
          map,
          { lng: first.drone.lng, lat: first.drone.lat },
          activeStop.coordinates,
        );
      } else {
        setActiveLeg(map, null, null);
      }

      // Navigation-style camera follow:
      // - Rotate map so drone heading is "up" (when actually moving)
      // - Anchor drone to lower-third of viewport via padding.
      //   In landscape we anchor higher (30% from top) so the operator gets
      //   more forward visibility — vertical pixels are scarcer when wide.
      const { offsetHeight, offsetWidth } = map.getContainer();
      const isLandscape = offsetWidth > offsetHeight;
      const topPaddingRatio = isLandscape ? 0.3 : 0.5;
      const isMoving = first.drone.speedMs > 0.5;

      map.easeTo({
        center: [first.drone.lng, first.drone.lat],
        bearing: isMoving ? first.drone.heading : map.getBearing(),
        padding: { top: offsetHeight * topPaddingRatio, bottom: 0, left: 0, right: 0 },
        duration: 2500,
      });
    } else {
      setActiveLeg(map, null, null);
    }
  }, [buildEntries]);

  // Cleanup pulse on unmount
  useEffect(() => {
    return () => stopActiveLegPulse();
  }, []);

  return { openPopup, liveDrone };
}
