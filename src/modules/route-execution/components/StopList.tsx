import { useEffect, useRef } from 'react';
import { useRoute } from '../context/RouteContext';
import { FINAL_STATUSES, type Stop } from '../types';
import { StopRow } from './StopRow';

export function StopList() {
  const { route, activeStopId } = useRoute();
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  // Initialize to null so the first effect run after mount (post-refresh)
  // scrolls the active stop into view.
  const prevActiveRef = useRef<string | null>(null);

  useEffect(() => {
    const prevActive = prevActiveRef.current;

    if (prevActive === activeStopId) return;

    if (!activeStopId) {
      prevActiveRef.current = activeStopId;
      return;
    }

    // First mount: no previous active to evaluate — scroll.
    // Otherwise: only scroll if the previous active stop transitioned INTO a
    // final status (normal forward progress). This skips undo-driven backward
    // moves where activeStopId changes but the prev active is not finalized.
    let shouldScroll = false;
    if (prevActive === null) {
      shouldScroll = true;
    } else {
      const prevStop = route.stops.find((s) => s.id === prevActive);
      if (prevStop && FINAL_STATUSES.has(prevStop.status)) {
        shouldScroll = true;
      }
    }

    prevActiveRef.current = activeStopId;

    if (!shouldScroll) return;

    const el = rowRefs.current.get(activeStopId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeStopId, route.stops]);

  const sorted = [...route.stops].sort((a, b) => a.order - b.order);
  const pickups = sorted.filter((s) => s.type === 'pickup');
  const deliveries = sorted.filter((s) => s.type === 'delivery');

  const renderStop = (stop: Stop) => {
    const isFinalized = FINAL_STATUSES.has(stop.status);
    const isActive = stop.id === activeStopId;
    const isLocked = !isActive && !isFinalized;
    return (
      <StopRow
        key={stop.id}
        ref={(el) => {
          if (el) {
            rowRefs.current.set(stop.id, el);
          } else {
            rowRefs.current.delete(stop.id);
          }
        }}
        stop={stop}
        isActive={isActive}
        isLocked={isLocked}
      />
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-6">
      {pickups.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Pickups" stops={pickups} />
          <ul className="mt-3 space-y-3">{pickups.map(renderStop)}</ul>
        </section>
      )}
      {deliveries.length > 0 && (
        <section>
          <SectionHeader title="Deliveries" stops={deliveries} />
          <ul className="mt-3 space-y-3">{deliveries.map(renderStop)}</ul>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ title, stops }: { title: string; stops: Stop[] }) {
  const done = stops.filter((s) => FINAL_STATUSES.has(s.status)).length;
  const total = stops.length;
  const allDone = done === total;
  return (
    <header className="flex items-center justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-content-muted)]">
        {title}
      </h2>
      <span className="text-xs text-[var(--color-content-soft)]">
        {done} / {total}
        {allDone ? ' • complete' : ''}
      </span>
    </header>
  );
}
