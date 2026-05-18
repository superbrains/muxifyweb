import { Navigate, Outlet } from "react-router-dom";
import { useIsAdmin } from "@app/hooks/useIsAdmin";

/**
 * Role-only gate for the `/admin/*` route group. Authentication and store
 * hydration are already handled by the parent `ProtectedRoute`, so this only
 * needs to check the role.
 *
 * Non-admins are sent to `/`, where `DashboardRouter` routes each role to its
 * correct home. This is a UX guard only — the backend MUST enforce the `admin`
 * role on every `/api/v1/admin/*` endpoint.
 */
const AdminRoute = () => {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
