import React, { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { useIsRecordLabel } from '@app/hooks/useIsRecordLabel';
import { useIsAdmin } from '@app/hooks/useIsAdmin';
import { useIsContributor } from '@app/hooks/useIsContributor';
import { LoadingScreen } from '@shared/components';

const Dashboard = lazy(() => import('@dashboard/pages/Dashboard'));
const AdsDashboard = lazy(() => import('@ads/pages/AdsDashboard'));
const RecordLabelDashboard = lazy(
    () => import('@/features/record-label/pages/RecordLabelDashboard'),
);
const ContributorDashboard = lazy(
    () => import('@/features/contributor/pages/ContributorDashboardPage'),
);

/**
 * DashboardRouter component that renders the appropriate dashboard
 * based on user type:
 * - Super Admin users -> redirected to the /admin console
 * - Ad Manager users -> AdsDashboard
 * - Record-label users -> RecordLabelDashboard
 * - Contributor users -> ContributorDashboard
 * - Everyone else (artist, dj, creator) -> Dashboard
 */
const DashboardRouter: React.FC = () => {
    const { isAdManager } = useUserType();
    const isRecordLabel = useIsRecordLabel();
    const isAdmin = useIsAdmin();
    const isContributor = useIsContributor();

    // Admins never see a creator dashboard at "/" — send them to their console.
    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return (
        <Suspense fallback={<LoadingScreen />}>
            {isContributor ? (
                <ContributorDashboard />
            ) : isAdManager ? (
                <AdsDashboard />
            ) : isRecordLabel ? (
                <RecordLabelDashboard />
            ) : (
                <Dashboard />
            )}
        </Suspense>
    );
};

export default DashboardRouter;
