import { useState } from 'react';
import type { ReactNode } from 'react';

export interface CommandCardStat {
  label: string;
  value: string;
}

export interface CommandCardTopStrip {
  content: ReactNode;
  onPress: () => void;
}

interface Props {
  leftIcon: ReactNode;
  leftLabel: string;
  onLeftPress: () => void;
  centerValue: string;
  centerUnit?: string;
  centerProgressPct?: number;
  centerColorClass?: string;
  rightIcon: ReactNode;
  rightLabel: string;
  onRightPress: () => void;
  /** Expandable stats panel above the pill. */
  stats?: CommandCardStat[];
  /** Fallback tab action when stats is not provided and topStrip is not used. */
  topTabAction?: () => void;
  /**
   * When provided, the card renders as a unified rounded-3xl glass surface:
   * top section = strip (tappable), bottom section = telemetry pill.
   * Stats toggle chevron is embedded in the strip row.
   */
  topStrip?: CommandCardTopStrip;
}

const RING_LENGTH = 113; // 2 * π * 18 (r=18)

function PillRow({
  leftIcon, leftLabel, onLeftPress,
  centerValue, centerUnit, centerProgressPct, centerColorClass,
  rightIcon, rightLabel, onRightPress,
}: Omit<Props, 'stats' | 'topTabAction' | 'topStrip'>) {
  const filled = (Math.max(0, Math.min(100, centerProgressPct ?? 0)) / 100) * RING_LENGTH;

  return (
    <div className="flex items-center gap-1 px-2 py-1">
      <button
        type="button"
        onClick={onLeftPress}
        aria-label={leftLabel}
        className="flex size-11 items-center justify-center rounded-full text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {leftIcon}
      </button>

      <div className="relative flex size-11 items-center justify-center">
        <svg className="absolute inset-0" viewBox="0 0 44 44" aria-hidden>
          <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20" />
          {(centerProgressPct ?? 0) > 0 && (
            <circle
              cx="22" cy="22" r="18"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeDasharray={`${filled} ${RING_LENGTH}`}
              strokeLinecap="round"
              className={`${centerColorClass ?? 'text-status-success'} transition-[stroke-dasharray] duration-500`}
              transform="rotate(-90 22 22)"
            />
          )}
        </svg>
        <div className="text-center leading-none">
          <p className="text-sm font-semibold tabular-nums text-white">{centerValue}</p>
          {centerUnit && (
            <p className="text-[8px] uppercase tracking-wide text-white/60">{centerUnit}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onRightPress}
        aria-label={rightLabel}
        className="flex size-11 items-center justify-center rounded-full text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {rightIcon}
      </button>
    </div>
  );
}

export function CommandCard({
  leftIcon, leftLabel, onLeftPress,
  centerValue, centerUnit, centerProgressPct = 0, centerColorClass = 'text-status-success',
  rightIcon, rightLabel, onRightPress,
  stats, topTabAction, topStrip,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const pillProps = {
    leftIcon, leftLabel, onLeftPress,
    centerValue, centerUnit, centerProgressPct, centerColorClass,
    rightIcon, rightLabel, onRightPress,
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Stats panel — expands above the card in both modes */}
      {stats && (
        <div
          className={[
            'grid transition-all duration-300 ease-out',
            expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none',
          ].join(' ')}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="glass-chip-flat mb-1 grid grid-cols-4 gap-3 rounded-2xl px-4 py-2.5">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-0.5">
                  <span className="whitespace-nowrap text-xs font-semibold tabular-nums text-white leading-none">
                    {s.value}
                  </span>
                  <span className="whitespace-nowrap text-[8px] uppercase tracking-wide text-white/50 leading-none">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {topStrip ? (
        /* ── Unified card mode ── */
        <div className="glass-chip inline-flex w-56 flex-col overflow-hidden rounded-3xl">
          <div className="flex items-stretch">
            <button
              type="button"
              onClick={topStrip.onPress}
              className="flex flex-1 items-center gap-3 px-4 py-3 text-left transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {topStrip.content}
            </button>
            {stats && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-label={expanded ? 'Collapse drone stats' : 'Expand drone stats'}
                aria-expanded={expanded}
                className="flex shrink-0 items-center px-3 text-white/35 transition hover:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span
                  aria-hidden
                  className={[
                    'inline-block text-[10px] transition-transform duration-300',
                    expanded ? 'rotate-180' : '',
                  ].join(' ')}
                >
                  ▲
                </span>
              </button>
            )}
          </div>
          <div className="h-px bg-white/10" />
          <PillRow {...pillProps} />
        </div>
      ) : (
        /* ── Standalone pill mode ── */
        <>
          {(stats ?? topTabAction) && (
            <button
              type="button"
              onClick={stats ? () => setExpanded((v) => !v) : topTabAction}
              aria-label={stats ? (expanded ? 'Collapse drone stats' : 'Expand drone stats') : 'Open timeline'}
              aria-expanded={stats ? expanded : undefined}
              className="-mb-2 flex min-h-[44px] w-12 flex-col items-center justify-end focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="glass-chip flex h-5 w-12 items-center justify-center rounded-t-xl text-[10px] text-white/70 transition hover:text-white">
                <span
                  aria-hidden
                  className={['inline-block transition-transform duration-300', expanded ? 'rotate-180' : ''].join(' ')}
                >
                  ▲
                </span>
              </span>
            </button>
          )}
          <div className="glass-chip flex items-center gap-1 rounded-full px-2 py-2">
            <PillRow {...pillProps} />
          </div>
        </>
      )}
    </div>
  );
}
