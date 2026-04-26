import type { Stop } from '@/modules/route-execution';

const TYPE_EMOJI: Record<Stop['type'], string> = {
  pickup: '📦',
  delivery: '🏠',
};

const FINAL_STATUSES = new Set<Stop['status']>(['success', 'failed']);

/**
 * Build a marker DOM element for a stop.
 * Pickup = 📦 emoji. Delivery = 🏠 emoji. Plain emoji with a drop shadow (helicopter style).
 */
export function createStopMarkerElement(stop: Stop): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `mapbox-stop-marker mapbox-stop-marker--${stop.type}`;

  const opacity = FINAL_STATUSES.has(stop.status) ? 0.45 : 1;

  el.style.cssText = `
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; line-height: 1;
    filter: drop-shadow(0 2px 5px rgba(0,0,0,0.7));
    cursor: pointer;
    opacity: ${opacity};
  `;
  el.textContent = TYPE_EMOJI[stop.type];

  return el;
}
