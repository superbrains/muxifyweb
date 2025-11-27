import React, { Suspense, lazy } from 'react';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { LoadingScreen } from '@shared/components';

// Lazy load dashboards to avoid dynamic/static import conflicts
const Dashboard = lazy(() => import('@dashboard/pages/Dashboard'));
const AdsDashboard = lazy(() => import('@ads/pages/AdsDashboard'));

/**
 * DashboardRouter component that renders the appropriate dashboard
 * based on user type:
 * - Ads Manager users -> AdsDashboard
 * - Normal users (artist, dj, creator, record_label) -> Dashboard
 */
const DashboardRouter: React.FC = () => {
    const { isAdManager } = useUserType();

    return (
        <Suspense fallback={<LoadingScreen />}>
            {isAdManager ? <AdsDashboard /> : <Dashboard />}
        </Suspense>
    );
};

export default DashboardRouter;

