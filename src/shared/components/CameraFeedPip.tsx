import { useRef, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  altitude?: number;
  speedMs?: number;
}

type Mode = 'pip' | 'fullscreen';

export function CameraFeedPip({ open, onClose, altitude, speedMs }: Props) {
  const [mode, setMode] = useState<Mode>('pip');
  // null = use CSS centering; set to pixels on first drag
  const [pos, setPos] = useState<{ left: number; bottom: number } | null>(null);
  const pipRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startLeft: number;
    startBottom: number;
  } | null>(null);
  const hasDraggedRef = useRef(false);
  const isLandscape = typeof window !== 'undefined' && window.innerWidth > window.innerHeight;

  if (!open) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (mode === 'fullscreen') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    hasDraggedRef.current = false;
    // Measure actual rendered position on first drag (CSS centering → pixel coords)
    const rect = pipRef.current?.getBoundingClientRect();
    const startLeft = rect ? rect.left : (pos?.left ?? 0);
    const startBottom = rect ? window.innerHeight - rect.bottom : (pos?.bottom ?? 120);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft,
      startBottom,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasDraggedRef.current = true;
    setPos({
      left: Math.max(8, dragRef.current.startLeft + dx),
      bottom: Math.max(8, dragRef.current.startBottom - dy),
    });
  };

  const BOTTOM_DEFAULT = 120;

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleClick = () => {
    if (hasDraggedRef.current) return;
    setMode((m) => (m === 'pip' ? 'fullscreen' : 'pip'));
  };

  if (mode === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#080b0f]">
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <LiveBadge />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('pip')}
              aria-label="Minimize to picture-in-picture"
              className="glass-chip flex size-9 items-center justify-center rounded-full text-white/70 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close camera"
              className="glass-chip flex size-9 items-center justify-center rounded-full text-white/70 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <MockFeed altitude={altitude} speedMs={speedMs} fullscreen />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={pipRef}
      role="button"
      tabIndex={0}
      aria-label="Camera feed — tap to expand, drag to reposition"
      className={[
        'fixed z-40 touch-none select-none',
        // CSS centering until first drag: portrait = centered, landscape = left-6
        pos === null
          ? isLandscape ? 'left-6' : 'left-1/2 -translate-x-1/2'
          : '',
      ].join(' ')}
      style={pos ? { left: pos.left, bottom: pos.bottom } : { bottom: BOTTOM_DEFAULT }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      <div className="relative w-40 cursor-pointer overflow-hidden rounded-2xl border border-white/20 shadow-2xl" style={{ aspectRatio: '16/10' }}>
        <MockFeed altitude={altitude} speedMs={speedMs} fullscreen={false} />

        <LiveBadge className="absolute left-2 top-2" small />

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Close camera"
          className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-black/50 text-[10px] text-white/70 transition hover:text-white focus-visible:outline-2 focus-visible:outline-accent"
        >
          ✕
        </button>

        <p className="absolute bottom-1.5 right-2 select-none text-[8px] text-white/30">
          tap to expand
        </p>
      </div>
    </div>
  );
}

function LiveBadge({ className = '', small = false }: { className?: string; small?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-failed" />
      <span className={`font-bold uppercase tracking-widest text-white/70 ${small ? 'text-[8px]' : 'text-[10px]'}`}>
        Live
      </span>
    </div>
  );
}

interface FeedProps {
  altitude?: number;
  speedMs?: number;
  fullscreen: boolean;
}

function MockFeed({ altitude, speedMs, fullscreen }: FeedProps) {
  return (
    <div className="relative h-full w-full bg-[#080b0f]">
      {/* Simulated aerial ground texture */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 70% 50% at 40% 65%, rgba(35,50,30,0.9) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 30% at 72% 38%, rgba(25,38,22,0.7) 0%, transparent 60%)',
            'radial-gradient(ellipse 20% 15% at 55% 80%, rgba(20,30,18,0.5) 0%, transparent 50%)',
          ].join(','),
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)' }}
      />

      {/* Corner viewfinder brackets */}
      <div className="absolute left-3 top-3 h-3 w-3 border-l border-t border-white/40" />
      <div className="absolute right-3 top-3 h-3 w-3 border-r border-t border-white/40" />
      <div className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-white/40" />
      <div className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-white/40" />

      {/* Center crosshair */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-px w-5 bg-white/20" />
          <div className="absolute h-5 w-px bg-white/20" />
          <div className="h-1 w-1 rounded-full border border-white/30" />
        </div>
      </div>

      {/* Scanline */}
      <div className="pointer-events-none absolute inset-x-0 h-px bg-white/6 animate-[scanline_5s_linear_infinite]" />

      {/* Telemetry overlay — fullscreen only */}
      {fullscreen && (
        <div className="absolute bottom-8 left-6 right-6 flex justify-between font-mono">
          {altitude != null && (
            <span className="text-xs text-white/50">ALT {Math.round(altitude)} m</span>
          )}
          {speedMs != null && (
            <span className="text-xs text-white/50">SPD {Math.round(speedMs)} m/s</span>
          )}
        </div>
      )}
    </div>
  );
}
