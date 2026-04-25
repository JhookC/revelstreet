import Routes from '@/routes';
import { ThemeProvider } from '@/shared/context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <Routes />
    </ThemeProvider>
  );
}
