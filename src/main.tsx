import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { generateMockFleet } from '@/mock/route-generator';
import { DEFAULT_LOCATION } from '@/shared/utils/geolocation';

async function enableMocking() {
  if (import.meta.env.PROD) return;

  const [{ worker }, { setStore }] = await Promise.all([
    import('./mocks/browser'),
    import('./mocks/handlers'),
  ]);

  setStore(generateMockFleet(DEFAULT_LOCATION));

  return worker.start({ onUnhandledRequest: 'bypass' });
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

void enableMocking().then(() => {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
});
