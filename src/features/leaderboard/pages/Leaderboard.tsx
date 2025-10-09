import React from 'react';

export const Leaderboard: React.FC = () => {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
                <p className="text-gray-600 mt-2">See how you rank among other artists.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Artist Rankings</h3>
                    <p className="text-gray-500">Leaderboard rankings will be displayed here.</p>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
