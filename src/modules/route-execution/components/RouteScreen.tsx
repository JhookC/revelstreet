import { MOCK_ROUTE } from '@/mock/route';
import { RouteProvider } from '../context/RouteContext';
import type { Route } from '../types';
import { ProgressHeader } from './ProgressHeader';
import { StopList } from './StopList';
import { UndoToast } from './UndoToast';

interface Props {
  initialRoute?: Route;
}

export function RouteScreen({ initialRoute = MOCK_ROUTE }: Props) {
  return (
    <RouteProvider initialRoute={initialRoute}>
      <div className="min-h-full">
        <ProgressHeader />
        <main className="pb-32">
          <StopList />
        </main>
        <UndoToast />
      </div>
    </RouteProvider>
  );
}
