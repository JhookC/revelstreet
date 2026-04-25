import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';

export default function Routes() {
  return <RouterProvider router={router} />;
}
