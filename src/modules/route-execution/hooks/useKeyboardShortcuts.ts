import { useEffect } from 'react';
import type { FailureReason, StopStatus } from '../types';

interface ShortcutHandlers {
  onAction: (status: StopStatus, reason?: FailureReason) => void;
  enabled: boolean;
}

const KEY_MAP: Record<string, StopStatus> = {
  a: 'arrived',
  d: 'departed',
  s: 'success',
  f: 'failed',
};

/**
 * Binds A/D/S/F keyboard shortcuts to dispatcher status actions.
 * Ignored when focus is inside an input, textarea, or select.
 */
export function useKeyboardShortcuts({ onAction, enabled }: ShortcutHandlers) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const status = KEY_MAP[e.key.toLowerCase()];
      if (!status) return;

      e.preventDefault();
      onAction(status);
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onAction, enabled]);
}
