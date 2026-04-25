import { useRef } from 'react';
import { Button, Modal } from '@heroui/react';
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
  // D3 guard: track whether the pointer went down inside the dialog.
  // If yes, a pointerup on the backdrop is a drag-release, not an intentional close.
  const pointerInsideRef = useRef(false);

  return (
    <Modal.Backdrop
      isOpen={open}
      onOpenChange={(v) => {
        if (!v) {
          if (pointerInsideRef.current) {
            // pointerdown started inside — drag-release on backdrop, ignore
            return;
          }
          onClose();
        }
      }}
    >
      <Modal.Container placement="bottom" size="sm">
        <Modal.Dialog className="rounded-t-3xl sm:rounded-3xl">
          {/*
            Track pointer inside: set on pointerdown, reset on pointerup.
            If pointerup fires outside this div (on the backdrop), the flag stays true,
            letting us skip the close in onOpenChange above.
          */}
          <div
            onPointerDown={() => { pointerInsideRef.current = true; }}
            onPointerUp={() => { pointerInsideRef.current = false; }}
          >
            <Modal.Header>
              <Modal.Heading>Why did this fail?</Modal.Heading>
              <p className="mt-1 text-sm text-content-muted">
                {"Pick the closest reason. We'll log it for follow-up."}
              </p>
            </Modal.Header>
            <Modal.Body>
              <div className="grid gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onPick(r.id)}
                    className="flex min-h-[64px] flex-col items-start rounded-2xl border border-border bg-surface-sunken px-4 py-3 text-left transition hover:border-status-failed hover:bg-status-failed/5 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-status-failed"
                  >
                    <span className="text-base font-semibold text-content">
                      {r.label}
                    </span>
                    <span className="mt-0.5 text-sm text-content-muted">
                      {r.hint}
                    </span>
                  </button>
                ))}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" fullWidth variant="outline">
                Cancel
              </Button>
            </Modal.Footer>
          </div>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
