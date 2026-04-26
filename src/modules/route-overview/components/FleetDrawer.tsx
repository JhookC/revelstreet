import { useEffect } from 'react';
import type { Route } from '@/modules/route-execution';
import { RouteTimelinePanel } from '@/modules/route-execution';
import type { DronePosition } from '@/modules/route-execution/types';

interface Props {
  open: boolean;
  onClose: () => void;
  route: Route | null;
  drone: DronePosition | null;
  onOpenRoute: (routeId: string) => void;
}

export function FleetDrawer({ open, onClose, route, drone, onOpenRoute }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        tabIndex={open ? 0 : -1}
        className={[
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      />

      <div
        role="dialog"
        aria-modal={open}
        aria-label="Active route timeline"
        className={[
          'fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-2xl transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
        style={{ maxHeight: '85dvh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close timeline"
            className="flex min-h-[44px] w-full items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="h-1.5 w-12 rounded-full bg-white/20 transition hover:bg-white/35 pointer-events-none" />
          </button>
        </div>

        {route ? (
          <RouteTimelinePanel
            routeId={route.id}
            stops={route.stops}
            drone={drone}
            onRowOpen={() => onOpenRoute(route.id)}
            bare
            className="rounded-t-3xl"
            style={{ maxHeight: 'calc(85dvh - 28px)' }}
          />
        ) : (
          <div className="glass-pane flex min-h-[200px] items-center justify-center rounded-t-3xl text-sm text-white/55">
            No active route
          </div>
        )}
      </div>
    </>
  );
}
