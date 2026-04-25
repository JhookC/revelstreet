interface Props {
  className?: string;
}

export function MapPlaceholder({ className = '' }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 bg-surface-sunken ${className}`}
      role="img"
      aria-label="Map unavailable"
    >
      <span className="text-4xl" aria-hidden>
        🗺️
      </span>
      <div className="text-center">
        <p className="text-sm font-medium text-content">Map not configured</p>
        <p className="mt-1 text-xs text-content-muted">
          Set{' '}
          <code className="rounded bg-surface px-1 py-0.5 font-mono text-xs text-content">
            VITE_MAPBOX_TOKEN
          </code>{' '}
          in <code className="rounded bg-surface px-1 py-0.5 font-mono text-xs text-content">.env.local</code>
        </p>
      </div>
    </div>
  );
}
