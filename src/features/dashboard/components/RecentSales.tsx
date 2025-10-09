import React from 'react';
import { Table } from '@shared/components';
import { formatCurrency, formatDate } from '@shared/lib';

interface Sale {
    id: string;
    track: string;
    platform: string;
    amount: number;
    date: string;
    status: 'completed' | 'pending' | 'failed';
}

export const RecentSales: React.FC = () => {
    const sales: Sale[] = [
        {
            id: '1',
            track: 'Summer Vibes',
            platform: 'Spotify',
            amount: 45.20,
            date: '2024-01-15',
            status: 'completed',
        },
        {
            id: '2',
            track: 'Night Drive',
            platform: 'Apple Music',
            amount: 32.10,
            date: '2024-01-14',
            status: 'completed',
        },
        {
            id: '3',
            track: 'City Lights',
            platform: 'YouTube Music',
            amount: 18.75,
            date: '2024-01-13',
            status: 'pending',
        },
        {
            id: '4',
            track: 'Ocean Waves',
            platform: 'Amazon Music',
            amount: 28.90,
            date: '2024-01-12',
            status: 'completed',
        },
    ];

    const columns = [
        {
            key: 'track' as keyof Sale,
            title: 'Track',
            render: (value: string) => (
                <div className="font-medium text-gray-900">{value}</div>
            ),
        },
        {
            key: 'platform' as keyof Sale,
            title: 'Platform',
            render: (value: string) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {value}
                </span>
            ),
        },
        {
            key: 'amount' as keyof Sale,
            title: 'Amount',
            render: (value: number) => (
                <div className="font-medium text-green-600">{formatCurrency(value)}</div>
            ),
        },
        {
            key: 'date' as keyof Sale,
            title: 'Date',
            render: (value: string) => formatDate(value),
        },
        {
            key: 'status' as keyof Sale,
            title: 'Status',
            render: (value: string) => {
                const statusClasses = {
                    completed: 'bg-green-100 text-green-800',
                    pending: 'bg-yellow-100 text-yellow-800',
                    failed: 'bg-red-100 text-red-800',
                };
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[value as keyof typeof statusClasses]}`}>
                        {value}
                    </span>
                );
            },
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Sales</h3>
            </div>
            <div className="p-6">
                <Table data={sales} columns={columns} />
            </div>
        </div>
    );
};
