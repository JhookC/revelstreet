import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { RouteProvider } from '@/modules/route-execution';
import type { Route } from '@/modules/route-execution';
import { MOCK_ROUTE } from '@/mock/route';
import { ThemeProvider } from '@/shared/context/ThemeContext';

interface RenderWithRouteOptions extends RenderOptions {
  initialRoute?: Route;
}

function Providers({
  children,
  initialRoute,
}: {
  children: ReactElement;
  initialRoute: Route;
}) {
  return (
    <ThemeProvider>
      <RouteProvider initialRoute={initialRoute}>{children}</RouteProvider>
    </ThemeProvider>
  );
}

export function renderWithRoute(
  ui: ReactElement,
  { initialRoute = MOCK_ROUTE, ...options }: RenderWithRouteOptions = {},
) {
  return render(<Providers initialRoute={initialRoute}>{ui}</Providers>, options);
}

export * from '@testing-library/react';
