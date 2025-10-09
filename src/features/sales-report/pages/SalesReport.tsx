import React from 'react';

export const SalesReport: React.FC = () => {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
                <p className="text-gray-600 mt-2">Analyze your sales performance and generate reports.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📈</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sales Analytics</h3>
                    <p className="text-gray-500">Your sales reports and analytics will be displayed here.</p>
                </div>
            </div>
        </div>
    );
};

export default SalesReport;
