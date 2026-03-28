import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@app/store/useUserStore";
import { tokenStorage } from "@app/lib/axiosInstance";
import { ProtectedLayout } from "@shared/components";

const ProtectedRoute = () => {
  const { user, isAuthenticated } = useUserStore();
  const hasToken = !!tokenStorage.getAccessToken();

  // User must have both a valid token and user data to access protected routes
  if (!hasToken || !isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ProtectedLayout>
      <Outlet />
    </ProtectedLayout>
  );
};

export default ProtectedRoute;
