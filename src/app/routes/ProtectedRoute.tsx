import { Navigate, Outlet } from "react-router-dom";
import { useUserStore, useUserStoreHydrated } from "@app/store/useUserStore";
import { tokenStorage } from "@app/lib/axiosInstance";
import { LoadingScreen, ProtectedLayout } from "@shared/components";

const ProtectedRoute = () => {
  const hydrated = useUserStoreHydrated();
  const { user, isAuthenticated } = useUserStore();
  const hasToken = !!tokenStorage.getAccessToken();

  if (!hydrated) {
    return <LoadingScreen />;
  }

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
