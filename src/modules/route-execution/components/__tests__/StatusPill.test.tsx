import { render, screen } from '@testing-library/react';
import { StatusPill } from '../StatusPill';
import type { StopStatus, StopType } from '../../types';

describe('StatusPill', () => {
  it.each<[StopStatus, StopType | undefined, string]>([
    ['pending', undefined, 'Pending'],
    ['arrived', undefined, 'Arrived'],
    ['departed', undefined, 'Departed'],
    ['success', 'delivery', 'Delivered'],
    ['success', 'pickup', 'Picked up'],
    ['failed', undefined, 'Failed'],
  ])('renders "%s" label for status=%s stopType=%s', (status, stopType, expected) => {
    render(<StatusPill status={status} stopType={stopType} />);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
