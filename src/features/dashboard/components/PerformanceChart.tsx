import React from 'react';

export const PerformanceChart: React.FC = () => {
    // This would typically use a charting library like Chart.js or Recharts
    // For now, we'll create a simple placeholder
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Performance Overview</h3>
                <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md">
                        7 Days
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                        30 Days
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                        90 Days
                    </button>
                </div>
            </div>

            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-gray-500">Chart will be rendered here</p>
                    <p className="text-sm text-gray-400">Integration with charting library needed</p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                    <p className="text-2xl font-semibold text-gray-900">1.2M</p>
                    <p className="text-sm text-gray-500">Total Streams</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-semibold text-gray-900">45.2K</p>
                    <p className="text-sm text-gray-500">Followers</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-semibold text-gray-900">$2.4K</p>
                    <p className="text-sm text-gray-500">Revenue</p>
                </div>
            </div>
        </div>
    );
};
