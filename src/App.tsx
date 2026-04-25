import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Routes from '@/routes';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import { OfflineBanner } from '@/shared/components/OfflineBanner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <OfflineBanner />
        <Routes />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
