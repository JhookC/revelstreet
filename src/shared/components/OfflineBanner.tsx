import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-status-failed px-4 py-2 text-sm font-semibold text-white"
    >
      <span aria-hidden>⚠</span>
      {"You're offline — changes will sync when connection returns"}
    </div>
  );
}
