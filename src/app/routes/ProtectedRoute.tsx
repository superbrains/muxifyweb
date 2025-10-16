import { 
    // Navigate, 
    Outlet 
} from 'react-router-dom';
// import { useUserStore } from '@app/store/useUserStore';
// import { usePermission } from '@app/hooks/usePermission';
import { ProtectedLayout } from '@shared/components';

const ProtectedRoute = () => {
    // const user = useUserStore(state => state.user);
    // const isAllowed = usePermission(user?.role);

    // if (!user) return <Navigate to="/login" replace />;
    // if (!isAllowed) return <Navigate to="/unauthorized" replace />;

    return (
        <ProtectedLayout>
            <Outlet />
        </ProtectedLayout>
    );
};

export default ProtectedRoute;
