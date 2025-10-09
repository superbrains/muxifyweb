import React from 'react';
import { formatCurrency } from '@shared/lib';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
                <div className={`${colorClasses[color]} rounded-lg p-3`}>
                    <span className="text-2xl">{icon}</span>
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                    {change !== undefined && (
                        <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? '+' : ''}{change}% from last month
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export const DashboardStats: React.FC = () => {
    const stats = [
        {
            title: 'Total Earnings',
            value: formatCurrency(12540),
            change: 12.5,
            icon: '💰',
            color: 'green' as const,
        },
        {
            title: 'Total Plays',
            value: '2.4M',
            change: 8.2,
            icon: '🎵',
            color: 'blue' as const,
        },
        {
            title: 'Followers',
            value: '45.2K',
            change: 15.3,
            icon: '👥',
            color: 'purple' as const,
        },
        {
            title: 'Uploads',
            value: '23',
            change: -2.1,
            icon: '📤',
            color: 'orange' as const,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};
