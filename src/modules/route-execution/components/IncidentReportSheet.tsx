import { useRef } from 'react';
import { Modal } from '@heroui/react';

export type IncidentReason =
  | 'weather-concern'
  | 'obstacle'
  | 'device-fault'
  | 'no-fly-conflict'
  | 'other';

interface Props {
  open: boolean;
  onPick: (reason: IncidentReason) => void;
  onClose: () => void;
}

const REASONS: { id: IncidentReason; label: string; hint: string; emoji: string }[] = [
  { id: 'weather-concern', label: 'Weather concern', hint: 'Conditions deteriorating', emoji: '🌩️' },
  { id: 'obstacle', label: 'Obstacle on route', hint: 'Crane, scaffolding, debris', emoji: '⚠️' },
  { id: 'device-fault', label: 'Device fault', hint: 'Sensor or hardware issue', emoji: '🛠️' },
  { id: 'no-fly-conflict', label: 'No-fly conflict', hint: 'Restricted airspace ahead', emoji: '🚫' },
  { id: 'other', label: 'Other', hint: 'Describe in dispatch notes', emoji: '✏️' },
];

export function IncidentReportSheet({ open, onPick, onClose }: Props) {
  const pointerInsideRef = useRef(false);

  return (
    <Modal.Backdrop
      isOpen={open}
      onOpenChange={(v) => {
        if (!v) {
          if (pointerInsideRef.current) return;
          onClose();
        }
      }}
    >
      <Modal.Container placement="bottom" size="sm">
        <Modal.Dialog className="rounded-t-3xl sm:rounded-3xl !bg-[rgba(18,20,26,0.96)] border-0 shadow-2xl p-0">
          <div
            onPointerDown={() => { pointerInsideRef.current = true; }}
            onPointerUp={() => { pointerInsideRef.current = false; }}
          >
            <Modal.Header className="px-5 pt-5 pb-3">
              <Modal.Heading className="text-base font-semibold text-white">
                Report an issue
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="px-5 pb-2">
              <div className="flex flex-col">
                {REASONS.map((r, i) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onPick(r.id)}
                    className={[
                      'flex min-h-[52px] items-center gap-3 px-1 py-3 text-left transition hover:opacity-70 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-status-warning',
                      i > 0 ? 'border-t border-white/8' : '',
                    ].join(' ')}
                  >
                    <span aria-hidden className="text-xl leading-none">{r.emoji}</span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold text-white">{r.label}</span>
                      <span className="text-xs text-white/50">{r.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </Modal.Body>
            <Modal.Footer className="flex justify-center px-5 pb-6 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-white/45 transition hover:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Cancel
              </button>
            </Modal.Footer>
          </div>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
