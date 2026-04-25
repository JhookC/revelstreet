import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import Routes from '@/routes';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import { OfflineBanner } from '@/shared/components/OfflineBanner';

const DAY_MS = 86_400_000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      gcTime: 7 * DAY_MS,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'revelstreet:query-cache',
  throttleTime: 0,
});

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 7 * DAY_MS }}
    >
      <ThemeProvider>
        <OfflineBanner />
        <Routes />
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
