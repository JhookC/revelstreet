import { useRef } from 'react';
import { Modal } from '@heroui/react';
import type { FailureReason } from '../types';

const REASONS: { id: FailureReason; label: string; hint: string }[] = [
  { id: 'refused', label: 'Refused', hint: 'Recipient declined the package' },
  { id: 'wrong-address', label: 'Wrong address', hint: 'No matching address found' },
  { id: 'no-recipient', label: 'No recipient', hint: 'Nobody available to receive' },
  { id: 'damaged', label: 'Damaged', hint: 'Package compromised in transit' },
];

interface Props {
  open: boolean;
  onPick: (reason: FailureReason) => void;
  onClose: () => void;
}

export function FailureReasonSheet({ open, onPick, onClose }: Props) {
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
        <Modal.Dialog className="rounded-t-3xl sm:rounded-3xl !bg-sheet-dark border-0 shadow-2xl p-0">
          <div
            onPointerDown={() => { pointerInsideRef.current = true; }}
            onPointerUp={() => { pointerInsideRef.current = false; }}
          >
            <Modal.Header className="px-5 pt-5 pb-3">
              <Modal.Heading className="text-base font-semibold text-white">
                Why did this fail?
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
                      'flex min-h-[52px] flex-col justify-center px-1 py-3 text-left transition hover:opacity-70 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-status-failed',
                      i > 0 ? 'border-t border-white/8' : '',
                    ].join(' ')}
                  >
                    <span className="text-sm font-semibold text-white">{r.label}</span>
                    <span className="text-xs text-white/50">{r.hint}</span>
                  </button>
                ))}
              </div>
            </Modal.Body>
            <Modal.Footer className="flex justify-center px-5 pb-6 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 text-sm text-white/45 transition hover:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
