import { useRef } from 'react';
import { createPortal } from 'react-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Stop, DronePosition, Coordinates } from '@/modules/route-execution';
import { useMapbox } from '../hooks/useMapbox';
import { MapPlaceholder } from './MapPlaceholder';
import { StopPopupCard } from './StopPopupCard';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

interface Props {
  stops: Stop[];
  drone?: DronePosition;
  center?: Coordinates;
  zoom?: number;
  className?: string;
}

export function MapView({ stops, drone, center, zoom, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { openPopup } = useMapbox(containerRef, { stops, drone, center, zoom });

  if (!TOKEN) {
    return <MapPlaceholder className={className} />;
  }

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        aria-label="Route map"
        role="img"
      />
      {openPopup &&
        createPortal(
          <StopPopupCard stop={openPopup.stop} drone={drone} />,
          openPopup.container,
        )}
    </>
  );
}
