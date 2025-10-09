import React from 'react';
import { DashboardStats } from '../components/DashboardStats';
import { RecentSales } from '../components/RecentSales';
import { PerformanceChart } from '../components/PerformanceChart';

export const Dashboard: React.FC = () => {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your music.</p>
            </div>

            <div className="space-y-8">
                <DashboardStats />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PerformanceChart />
                    <RecentSales />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
