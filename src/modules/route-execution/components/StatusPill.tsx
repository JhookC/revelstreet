import type { StopStatus, StopType } from '../types';

const styles: Record<StopStatus, string> = {
  pending:
    'bg-status-pending/15 text-status-pending ring-status-pending/30',
  arrived:
    'bg-status-arrived/15 text-status-arrived ring-status-arrived/40',
  departed:
    'bg-status-departed/15 text-status-departed ring-status-departed/40',
  success:
    'bg-status-success/15 text-status-success ring-status-success/40',
  failed: 'bg-status-failed/15 text-status-failed ring-status-failed/40',
};

const glyphs: Record<StopStatus, string> = {
  pending: '○',
  arrived: '↓',
  departed: '→',
  success: '✓',
  failed: '✕',
};

const labelFor = (status: StopStatus, stopType?: StopType): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'arrived':
      return 'Arrived';
    case 'departed':
      return 'Departed';
    case 'success':
      return stopType === 'pickup' ? 'Picked up' : 'Delivered';
    case 'failed':
      return 'Failed';
  }
};

interface Props {
  status: StopStatus;
  stopType?: StopType;
}

export function StatusPill({ status, stopType }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset whitespace-nowrap ${styles[status]}`}
    >
      <span aria-hidden>{glyphs[status]}</span>
      {labelFor(status, stopType)}
    </span>
  );
}
