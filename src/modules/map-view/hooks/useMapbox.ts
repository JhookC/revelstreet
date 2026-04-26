import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Stop, DronePosition, Coordinates } from '@/modules/route-execution';
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

export function useMapbox(
  containerRef: React.RefObject<HTMLDivElement | null>,
  opts: UseMapboxOptions,
): { openPopup: OpenPopup | null } {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const droneMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const droneAnimatorRef = useRef<DroneAnimator | null>(null);
  const droneRef = useRef<DronePosition | undefined>(opts.drone);
  const [openPopup, setOpenPopup] = useState<OpenPopup | null>(null);

  const { stops, drone, center, zoom = 17 } = opts;

  useEffect(() => {
    droneRef.current = drone;
  }, [drone]);

  // Derive map center: active stop > first stop > provided center > user location
  const sorted = stops.slice().sort((a, b) => a.order - b.order);
  const activeStop = sorted.find((s) => s.status !== 'success' && s.status !== 'failed');
  const firstStop = sorted[0];
  const fallback = getCachedUserLocation();
  const mapCenter: [number, number] = center
    ? [center.lng, center.lat]
    : activeStop
    ? [activeStop.coordinates.lng, activeStop.coordinates.lat]
    : firstStop
    ? [firstStop.coordinates.lng, firstStop.coordinates.lat]
    : [fallback.lng, fallback.lat];

  // Init map
  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: mapCenter,
      zoom,
      pitch: 65,
      bearing: 0,
      maxPitch: 85,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    mapRef.current = map;

    map.on('load', () => {
      hideTrafficLayers(map);
      add3DBuildings(map);
      addNightSky(map);
      // Force the pitch — some style packages override the constructor's value.
      map.setPitch(65);

      // Route polyline layer (full path through all stops)
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

      // Active-leg layer (drone → next stop, pulsing green)
      addActiveLegLayer(map);
    });

    // Re-apply on style reloads (defensive — in case the basemap is swapped)
    map.on('style.load', () => {
      hideTrafficLayers(map);
      add3DBuildings(map);
      addNightSky(map);
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

    // Clear existing markers and any open popup state (markers are about to be recreated)
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    setOpenPopup(null);

    stops.forEach((stop) => {
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

      markersRef.current.push(marker);
    });

    // Update route line
    const source = map.getSource('route');
    if (source && 'setData' in source) {
      source.setData(buildRouteGeoJSON(stops));
    }
  }, [stops]);

  // Drone marker — created once per drone availability, then animated on updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !drone) return;

    if (!droneMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'mapbox-drone-marker';
      el.style.cssText = `
        width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        font-size: 28px; line-height: 1;
        filter: drop-shadow(0 2px 5px rgba(0,0,0,0.7));
      `;
      el.textContent = '🚁';

      droneMarkerRef.current = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
        rotation: drone.heading,
        rotationAlignment: 'map',
      })
        .setLngLat([drone.lng, drone.lat])
        .addTo(map);

      droneAnimatorRef.current = createDroneAnimator(droneMarkerRef.current, drone);
    } else if (droneAnimatorRef.current) {
      // Animate to new pose over the telemetry interval (~3s)
      droneAnimatorRef.current.to(drone, 3000);
    }

    // Navigation-style camera follow:
    // - Rotate the map so the drone's heading is "up" (when it's actually moving)
    // - Anchor the drone to the lower-third of the viewport via padding.
    //   In landscape we anchor higher (30% from top) so the operator gets more
    //   forward visibility — vertical pixels are scarcer when the device is wide.
    const { offsetHeight, offsetWidth } = map.getContainer();
    const isLandscape = offsetWidth > offsetHeight;
    const topPaddingRatio = isLandscape ? 0.3 : 0.5;
    const isMoving = drone.speedMs > 0.5;

    map.easeTo({
      center: [drone.lng, drone.lat],
      bearing: isMoving ? drone.heading : map.getBearing(),
      padding: { top: offsetHeight * topPaddingRatio, bottom: 0, left: 0, right: 0 },
      duration: 2500,
    });
  }, [drone]);

  // Active leg: drone → next non-terminal stop
  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;

    if (!drone || !activeStop) {
      setActiveLeg(map, null, null);
      return;
    }

    setActiveLeg(
      map,
      { lng: drone.lng, lat: drone.lat },
      activeStop.coordinates,
    );
  }, [drone, activeStop]);

  // Cleanup animator + pulse on unmount
  useEffect(() => {
    return () => {
      droneAnimatorRef.current?.stop();
      stopActiveLegPulse();
      droneMarkerRef.current?.remove();
      droneMarkerRef.current = null;
      droneAnimatorRef.current = null;
    };
  }, []);

  return { openPopup };
}
