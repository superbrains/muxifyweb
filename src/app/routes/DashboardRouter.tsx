import React from 'react';
import { useUserType } from '@/features/auth/hooks/useUserType';
import Dashboard from '@dashboard/pages/Dashboard';
import AdsDashboard from '@ads/pages/AdsDashboard';

/**
 * DashboardRouter component that renders the appropriate dashboard
 * based on user type:
 * - Ads Manager users -> AdsDashboard
 * - Normal users (artist, dj, creator, record_label) -> Dashboard
 */
const DashboardRouter: React.FC = () => {
    const { isAdManager } = useUserType();

    // Check if user is an ads manager
    if (isAdManager) {
        return <AdsDashboard />;
    }

    // Default to regular Dashboard for all other users
    return <Dashboard />;
};

export default DashboardRouter;

