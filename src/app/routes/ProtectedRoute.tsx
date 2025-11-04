import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserStore } from '@app/store/useUserStore';
import { usePermission } from '@app/hooks/usePermission';
import { ProtectedLayout } from '@shared/components';

const ProtectedRoute = () => {
    const user = useUserStore(state => state.user);
    const location = useLocation();
    const { permissions, canAccessRoute } = usePermission(user?.role);

    // Redirect to login if no user
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Check if user has valid role with permissions
    if (!permissions) {
        // Invalid role - redirect to login
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Check if user can access the current route
    const isAllowed = canAccessRoute(location.pathname);
    if (!isAllowed) {
        // User doesn't have permission for this route - redirect to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <ProtectedLayout>
            <Outlet />
        </ProtectedLayout>
    );
};

export default ProtectedRoute;
