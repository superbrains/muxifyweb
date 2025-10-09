import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Muxify</h1>
                        <p className="text-gray-600 mt-2">Your music distribution platform</p>
                    </div>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
