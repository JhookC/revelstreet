import { useRef } from 'react';
import { createPortal } from 'react-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { FleetTelemetryEntry, Route } from '@/modules/route-execution';
import { useFleetMapbox } from '../hooks/useFleetMapbox';
import { MapPlaceholder } from './MapPlaceholder';
import { StopPopupCard } from './StopPopupCard';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

interface Props {
  fleet: Route[];
  telemetry: FleetTelemetryEntry[];
  onSelectRoute?: (routeId: string) => void;
  className?: string;
  /** Filter visible stop pins by type. When omitted, all stops are shown. */
  stopFilter?: 'pickups' | 'deliveries';
}

export function FleetMapView({
  fleet,
  telemetry,
  onSelectRoute,
  className = '',
  stopFilter,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { openPopup, liveDrone } = useFleetMapbox(
    containerRef,
    fleet,
    telemetry,
    onSelectRoute,
    stopFilter,
  );

  if (!TOKEN) {
    return <MapPlaceholder className={className} />;
  }

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        aria-label="Fleet map"
        role="img"
      />
      {openPopup &&
        createPortal(
          <StopPopupCard stop={openPopup.stop} drone={liveDrone} />,
          openPopup.container,
        )}
    </>
  );
}
