import { useState } from 'react';
import { Button } from '@heroui/react';
import { useRoute } from '../context/RouteContext';
import { useWeatherQuery } from '../api';
import { FailureReasonSheet } from './FailureReasonSheet';

export function PrimaryActionStack() {
  const { activeStop, markStatus } = useRoute();
  const { data: weather } = useWeatherQuery();
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!activeStop) return null;

  if (weather?.level === 'grounded') {
    return (
      <div
        role="status"
        className="rounded-full bg-status-failed/90 px-5 py-2.5 text-sm font-semibold text-white shadow-2xl ring-1 ring-white/20 backdrop-blur-xl"
      >
        🛑 Operations grounded
      </div>
    );
  }

  switch (activeStop.status) {
    case 'pending':
      return (
        <Button
          size="lg"
          className="rounded-full bg-status-arrived/90 px-8 text-white shadow-2xl ring-1 ring-white/20 backdrop-blur-xl"
          onPress={() => markStatus(activeStop.id, 'arrived')}
        >
          Mark Arrived
        </Button>
      );
    case 'arrived':
      return (
        <Button
          size="lg"
          className="rounded-full bg-status-departed/90 px-8 text-white shadow-2xl ring-1 ring-white/20 backdrop-blur-xl"
          onPress={() => markStatus(activeStop.id, 'departed')}
        >
          Mark Departed
        </Button>
      );
    case 'departed':
      return (
        <>
          <div className="flex items-center gap-2">
            <Button
              size="lg"
              className="rounded-full bg-status-success/90 px-6 text-white shadow-2xl ring-1 ring-white/20 backdrop-blur-xl"
              onPress={() => markStatus(activeStop.id, 'success')}
            >
              {activeStop.type === 'pickup' ? 'Picked up' : 'Delivered'}
            </Button>
            <Button
              size="lg"
              className="rounded-full bg-status-failed/85 px-5 text-white shadow-2xl ring-1 ring-white/20 backdrop-blur-xl"
              onPress={() => setPickerOpen(true)}
              aria-label="Mark stop failed and pick a reason"
            >
              Failed…
            </Button>
          </div>
          <FailureReasonSheet
            open={pickerOpen}
            onPick={(reason) => {
              markStatus(activeStop.id, 'failed', reason);
              setPickerOpen(false);
            }}
            onClose={() => setPickerOpen(false)}
          />
        </>
      );
    default:
      return null;
  }
}
