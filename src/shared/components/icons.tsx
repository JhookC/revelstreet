interface IconProps {
  size?: number;
  className?: string;
}

const baseProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function MapIcon({ size = 22, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...baseProps}>
      <path d="M9 4 3 6v15l6-2 6 2 6-2V4l-6 2-6-2z" />
      <path d="M9 4v15M15 6v15" />
    </svg>
  );
}

export function FlagIcon({ size = 22, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...baseProps}>
      <path d="M5 21V4M5 4h12l-2 4 2 4H5" />
    </svg>
  );
}

export function LayersIcon({ size = 22, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...baseProps}>
      <path d="m12 3-9 5 9 5 9-5-9-5z" />
      <path d="m3 13 9 5 9-5M3 18l9 5 9-5" />
    </svg>
  );
}

export function CameraIcon({ size = 22, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...baseProps}>
      <path d="M23 7 16 12l7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}

export function ListIcon({ size = 22, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...baseProps}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

export function DroneIcon({ size = 22, className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} fill="none" aria-hidden="true">
      <line x1="5.8" y1="5.8" x2="10" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14.2" y1="5.8" x2="10" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="5.8" y1="14.2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14.2" y1="14.2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="4" cy="4" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16" cy="4" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="4" cy="16" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="2.2" fill="currentColor" />
    </svg>
  );
}
