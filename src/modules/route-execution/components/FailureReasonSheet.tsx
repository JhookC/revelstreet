import { useEffect, useRef } from 'react';
import type { FailureReason } from '../types';

const REASONS: { id: FailureReason; label: string; hint: string }[] = [
  { id: 'refused', label: 'Refused', hint: 'Recipient declined the package' },
  {
    id: 'wrong-address',
    label: 'Wrong address',
    hint: 'No matching address found',
  },
  {
    id: 'no-recipient',
    label: 'No recipient',
    hint: 'Nobody available to receive',
  },
  { id: 'damaged', label: 'Damaged', hint: 'Package compromised in transit' },
];

interface Props {
  open: boolean;
  onPick: (reason: FailureReason) => void;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function FailureReasonSheet({ open, onPick, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Manage focus on open/close
  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const dialog = dialogRef.current;
    if (dialog) {
      const focusables = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const first = focusables[0];
      if (first) first.focus();
    }

    return () => {
      const previous = previouslyFocusedRef.current;
      if (previous && typeof previous.focus === 'function') {
        previous.focus();
      }
      previouslyFocusedRef.current = null;
    };
  }, [open]);

  // Escape key handler + focus trap
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !dialog.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    // Backdrop: click-outside closes for mouse users; keyboard users use Escape via the
    // document listener above. Screen readers are scoped by aria-modal on the dialog below.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && e.key === 'Escape') onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="failure-reason-title"
        aria-describedby="failure-reason-desc"
        className="w-full max-w-md rounded-t-3xl bg-[var(--color-surface-raised)] p-6 shadow-2xl sm:rounded-3xl"
      >
        <h2
          id="failure-reason-title"
          className="text-lg font-semibold text-[var(--color-content)]"
        >
          Why did this fail?
        </h2>
        <p
          id="failure-reason-desc"
          className="mt-1 text-sm text-[var(--color-content-muted)]"
        >
          {"Pick the closest reason. We'll log it for follow-up."}
        </p>
        <div className="mt-4 grid gap-2">
          {REASONS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onPick(r.id)}
              className="min-h-[64px] flex flex-col items-start rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-4 py-3 text-left transition hover:border-status-failed hover:bg-status-failed/5 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-status-failed"
            >
              <span className="text-base font-semibold text-[var(--color-content)]">
                {r.label}
              </span>
              <span className="mt-0.5 text-sm text-[var(--color-content-muted)]">
                {r.hint}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 min-h-[48px] w-full rounded-2xl border border-[var(--color-border)] py-3 text-base font-medium text-[var(--color-content-muted)] hover:bg-[var(--color-surface-sunken)]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
