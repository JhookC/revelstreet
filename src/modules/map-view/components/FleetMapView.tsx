import { useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { FleetTelemetryEntry, Route } from '@/modules/route-execution';
import { useFleetMapbox } from '../hooks/useFleetMapbox';
import { MapPlaceholder } from './MapPlaceholder';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

interface Props {
  fleet: Route[];
  telemetry: FleetTelemetryEntry[];
  onSelectRoute?: (routeId: string) => void;
  className?: string;
}

export function FleetMapView({ fleet, telemetry, onSelectRoute, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useFleetMapbox(containerRef, fleet, telemetry, onSelectRoute);

  if (!TOKEN) {
    return <MapPlaceholder className={className} />;
  }

  return (
    <div
      ref={containerRef}
      className={className}
      aria-label="Fleet map"
      role="img"
    />
  );
}
