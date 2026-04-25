import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  useNavigate,
  NotFoundRoute,
  Link,
} from '@tanstack/react-router';
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
    return <RouteScreen routeId={routeId} onBack={() => void navigate({ to: '/' })} />;
  },
});

const notFoundRoute = new NotFoundRoute({
  getParentRoute: () => rootRoute,
  component: function NotFoundPage() {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface text-content">
        <p className="text-xl font-semibold">404 — Page not found</p>
        <Link
          to="/"
          className="text-sm text-content-muted underline hover:text-content"
        >
          ← Back to fleet
        </Link>
      </div>
    );
  },
});

export const routeTree = rootRoute.addChildren([indexRoute, routeDetailRoute]);

export const router = createRouter({ routeTree, notFoundRoute });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
