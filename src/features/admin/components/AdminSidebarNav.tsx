import React from 'react';
import { Box } from '@chakra-ui/react';
import { SectionNav } from '@shared/console';
import { SidebarNavList } from '@shared/components/SidebarNavList';
import type { NavItem } from '@shared/components/SidebarNavList';
import {
    DashboardIcon,
    VerifyIcon,
    FansAndSubscribersIcon,
    HeadphoneIcon,
    ArtistIcon,
    WalletMoneyIcon,
    StatusUpIcon,
    PaymentsIcon,
    Setting2Icon,
} from '@/shared/icons/CustomIcons';
import { useAdminNavGroups } from '../config/adminNav';

interface AdminSidebarNavProps {
    currentPath: string;
    isCollapsed: boolean;
    isInitialRender: boolean;
    onNavigate: (path: string) => void;
    /** Called after any nav activation so mobile can close the drawer. */
    onItemClick: () => void;
}

/**
 * Admin sidebar navigation, deliberately kept out of the shared `Sidebar`.
 *
 * Every admin route string and the scope/permission-aware nav tree lives behind
 * this module boundary. `Sidebar` reaches it only through `React.lazy`, so none
 * of it is pulled into the entry chunk that fans and artists download — and in
 * the admin-only build (`admin.html`) it is the only branch that ships at all.
 * Do not import this from anywhere that a non-admin surface renders.
 */
const adminRailItems: NavItem[] = [
    { icon: DashboardIcon, label: 'Overview', path: '/admin' },
    { icon: VerifyIcon, label: 'Verifications', path: '/admin/verifications' },
    { icon: FansAndSubscribersIcon, label: 'Users', path: '/admin/users' },
    { icon: HeadphoneIcon, label: 'Support', path: '/admin/support' },
    { icon: ArtistIcon, label: 'Management', path: '/admin/management' },
    { icon: WalletMoneyIcon, label: 'Coin Economy', path: '/admin/coin-economy' },
    { icon: StatusUpIcon, label: 'Spotlight', path: '/admin/spotlight' },
    { icon: PaymentsIcon, label: 'Finance', path: '/admin/finance' },
    { icon: Setting2Icon, label: 'Settings', path: '/admin/settings' },
];

const AdminSidebarNav: React.FC<AdminSidebarNavProps> = ({
    currentPath,
    isCollapsed,
    isInitialRender,
    onNavigate,
    onItemClick,
}) => {
    // CR1: scope- and permission-aware 8-group admin navigation.
    const adminNavGroups = useAdminNavGroups();

    // Collapsed rail falls back to the flat top-level icon list; the grouped
    // SectionNav needs the labels to be readable to make sense.
    if (isCollapsed) {
        return (
            <SidebarNavList
                items={adminRailItems}
                currentPath={currentPath}
                isCollapsed
                isInitialRender={isInitialRender}
                onNavigate={onNavigate}
            />
        );
    }

    return (
        <Box flex={1} overflowY="auto" overflowX="hidden" pr={1} pb={4} zIndex={1000}>
            <SectionNav
                groups={adminNavGroups}
                currentPath={currentPath}
                onItemClick={onItemClick}
            />
        </Box>
    );
};

export default AdminSidebarNav;
