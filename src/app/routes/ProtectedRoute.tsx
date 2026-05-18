import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@app/store/useUserStore";
import { LoadingScreen, ProtectedLayout } from "@shared/components";

/**
 * Gates the authenticated app on the session `status` driven by `AuthBootstrap`:
 * - `loading`         — JWT present, `/users/me` in flight → show the splash.
 * - `unauthenticated` — no valid session → redirect to /login.
 * - `authenticated`   — render the dashboard.
 */
const ProtectedRoute = () => {
  const status = useUserStore((s) => s.status);

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return (
    <ProtectedLayout>
      <Outlet />
    </ProtectedLayout>
  );
};

export default ProtectedRoute;
