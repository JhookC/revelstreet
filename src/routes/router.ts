import { createElement } from 'react';
import { createRouter, createRoute, createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { FleetScreen } from '@/modules/route-overview';
import { RouteScreen } from '@/modules/route-execution';

const rootRoute = createRootRoute({
  component: Outlet,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: FleetScreen,
});

const routeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/routes/$routeId',
  component: function RouteDetailPage() {
    const { routeId } = routeDetailRoute.useParams();
    const navigate = useNavigate();
    return createElement(RouteScreen, { routeId, onBack: () => void navigate({ to: '/' }) });
  },
});

export const routeTree = rootRoute.addChildren([indexRoute, routeDetailRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
