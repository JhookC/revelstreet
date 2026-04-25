import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

async function enableMocking() {
  if (import.meta.env.PROD) return;
  const { worker } = await import('./mocks/browser');
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
