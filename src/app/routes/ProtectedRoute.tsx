import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '@app/store/useUserStore';
import { usePermission } from '@app/hooks/usePermission';

const ProtectedRoute = () => {
    const user = useUserStore(state => state.user);
    const isAllowed = usePermission(user?.role);

    if (!user) return <Navigate to="/login" replace />;
    if (!isAllowed) return <Navigate to="/unauthorized" replace />;

    return <Outlet />;
};

export default ProtectedRoute;
