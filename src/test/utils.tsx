import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { RouteProvider } from '@/modules/route-execution';
import type { Route } from '@/modules/route-execution';
import { MOCK_ROUTE } from '@/mock/route';

interface RenderWithRouteOptions extends RenderOptions {
  initialRoute?: Route;
}

export function renderWithRoute(
  ui: ReactElement,
  { initialRoute = MOCK_ROUTE, ...options }: RenderWithRouteOptions = {},
) {
  return render(
    <RouteProvider initialRoute={initialRoute}>{ui}</RouteProvider>,
    options,
  );
}

export * from '@testing-library/react';
