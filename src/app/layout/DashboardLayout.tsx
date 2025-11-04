import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@app/hooks/useAuth';
import { usePermission } from '@app/hooks/usePermission';
import { useTheme } from '@app/providers/ThemeProvider';

interface Permission {
    canUploadMusic: boolean;
    canUploadVideo: boolean;
    canViewEarnings: boolean;
    canViewLeaderboard: boolean;
    canViewFans: boolean;
    canViewSales: boolean;
    canViewPayments: boolean;
    canAddArtists: boolean;
    canViewSettings: boolean;
}

const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Upload Music', href: '/upload-music', icon: '🎵', permission: 'canUploadMusic' },
    { name: 'Upload Video', href: '/upload-video', icon: '🎬', permission: 'canUploadVideo' },
    { name: 'Music & Videos', href: '/music-videos', icon: '🎶' },
    { name: 'Earnings & Royalty', href: '/earning-royalty', icon: '💰', permission: 'canViewEarnings' },
    { name: 'Leaderboard', href: '/leaderboard', icon: '🏆', permission: 'canViewLeaderboard' },
    { name: 'Fans & Subscribers', href: '/fans-subscribers', icon: '👥', permission: 'canViewFans' },
    { name: 'Sales Report', href: '/sales-report', icon: '📈', permission: 'canViewSales' },
    { name: 'Payments', href: '/payments', icon: '💳', permission: 'canViewPayments' },
    { name: 'Add Artist', href: '/add-artist', icon: '👤', permission: 'canAddArtists' },
    { name: 'Settings', href: '/settings', icon: '⚙️', permission: 'canViewSettings' },
];

export const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const { hasPermission } = usePermission(user?.role);
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const filteredNavigation = navigation.filter(item => {
        if (!item.permission) return true;
        return hasPermission(item.permission as keyof Permission);
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            type="button"
                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="sr-only">Close sidebar</span>
                            ✕
                        </button>
                    </div>
                    <SidebarContent navigation={filteredNavigation} location={location} />
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <SidebarContent navigation={filteredNavigation} location={location} />
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64 flex flex-col flex-1">
                {/* Top bar */}
                <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
                    <button
                        type="button"
                        className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        ☰
                    </button>
                </div>

                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                                </h1>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-md text-gray-400 hover:text-gray-500"
                                >
                                    {theme === 'dark' ? '☀️' : '🌙'}
                                </button>
                                <div className="flex items-center space-x-3">
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-gray-500">{user?.role}</p>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

interface NavigationItem {
    name: string;
    href: string;
    icon: string;
    permission?: string;
}

const SidebarContent = ({ navigation, location }: { navigation: NavigationItem[], location: ReturnType<typeof useLocation> }) => (
    <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-gray-900">Muxify</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item: NavigationItem) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`${isActive
                                ? 'bg-indigo-100 text-indigo-900'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                        >
                            <span className="mr-3 text-lg">{item.icon}</span>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    </div>
);
