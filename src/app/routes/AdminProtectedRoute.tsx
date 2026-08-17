import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@app/store/useUserStore";
import { LoadingScreen, ProtectedLayout } from "@shared/components";
import AdminSidebarNav from "@admin/components/AdminSidebarNav";

/**
 * `ProtectedRoute` for the admin-only build. Identical session gating, but it
 * supplies the admin console's navigation to the shared layout.
 *
 * This exists so `Sidebar` never has to reference `features/admin` itself.
 * Because only `routes.admin.tsx` imports this module, the admin nav tree and
 * every admin route string it carries are absent from the fan/artist bundle
 * rather than merely lazy-loaded there — a lazy chunk is still fetchable by
 * anyone who knows its URL, which would defeat the split.
 */
const AdminProtectedRoute = () => {
  const status = useUserStore((s) => s.status);

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return (
    <ProtectedLayout
      renderNav={({ currentPath, isCollapsed, isInitialRender, onNavigate, onItemClick }) => (
        <AdminSidebarNav
          currentPath={currentPath}
          isCollapsed={isCollapsed}
          isInitialRender={isInitialRender}
          onNavigate={onNavigate}
          onItemClick={onItemClick}
        />
      )}
    >
      <Outlet />
    </ProtectedLayout>
  );
};

export default AdminProtectedRoute;
