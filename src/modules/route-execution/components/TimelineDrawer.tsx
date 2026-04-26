import { useEffect } from 'react';
import { useRoute } from '../context/RouteContext';
import { useTelemetryQuery, useWeatherQuery } from '../api';
import { RouteTimelinePanel } from './RouteTimelinePanel';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Portrait-mode modal that wraps the same `RouteTimelinePanel` used in the
 * landscape side-panel. Keeps the timeline layout DRY across orientations.
 */
export function TimelineDrawer({ open, onClose }: Props) {
  const { route, markStatus } = useRoute();
  const { data: telemetryDrone } = useTelemetryQuery(route.id);
  const { data: weather } = useWeatherQuery();
  const drone = telemetryDrone ?? route.drone ?? null;

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close timeline"
        tabIndex={open ? 0 : -1}
        className={[
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      />

      {/* Sheet — slides up from bottom on portrait */}
      <div
        role="dialog"
        aria-modal={open}
        aria-label="Route timeline"
        className={[
          'glass-pane fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-2xl rounded-t-3xl transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
        style={{ maxHeight: '85dvh' }}
      >
        <div className="flex justify-center pb-1 pt-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close timeline"
            className="h-1.5 w-12 rounded-full bg-white/30 transition hover:bg-white/50"
          />
        </div>

        <RouteTimelinePanel
          routeId={route.id}
          stops={route.stops}
          drone={drone}
          grounded={weather?.level === 'grounded'}
          onMarkStatus={markStatus}
          bare
        />
      </div>
    </>
  );
}
