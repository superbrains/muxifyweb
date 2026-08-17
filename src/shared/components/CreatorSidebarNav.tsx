import React from 'react';
import { SidebarNavList } from './SidebarNavList';
import type { NavItem } from './SidebarNavList';
import type { SidebarNavContext } from './Sidebar';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { useIsContributor } from '@app/hooks/useIsContributor';
import {
    DashboardIcon,
    LeaderboardIcon,
    EarningsAndRoyaltyIcon,
    MusicIcon,
    SalesIcon,
    FansAndSubscribersIcon,
    PaymentsIcon,
    StatusUpIcon,
    WalletMoneyIcon,
    AdLibraryIcon,
    ArtistIcon,
    Setting2Icon,
    HeadphoneIcon,
} from '@/shared/icons/CustomIcons';

/**
 * Navigation for the fan/artist/label/ad-manager/contributor app, supplied to
 * the shared `Sidebar` by `ProtectedRoute`.
 *
 * The mirror of `features/admin/components/AdminSidebarNav`. Keeping both out
 * of `Sidebar` itself means neither app's route table ends up in the other's
 * bundle — `Sidebar` is pure chrome and knows about no routes at all.
 */
const buildArtistNavItems = (musicVideosLabel: string): NavItem[] => [
    { icon: DashboardIcon, label: 'Dashboard', path: '/' },
    { icon: LeaderboardIcon, label: 'Leaderboard', path: '/leaderboard' },
    { icon: EarningsAndRoyaltyIcon, label: 'Earnings & Royalty', path: '/earning-royalty' },
    { icon: MusicIcon, label: musicVideosLabel, path: '/music-videos' },
    { icon: SalesIcon, label: 'Sales Report', path: '/sales-report' },
    { icon: FansAndSubscribersIcon, label: 'Fans & Subscribers', path: '/fans-subscribers' },
    { icon: PaymentsIcon, label: 'Payments', path: '/payments' },
    { icon: HeadphoneIcon, label: 'Disputes', path: '/disputes' },
];

const recordLabelNavItems: NavItem[] = [
    { icon: DashboardIcon, label: 'Dashboard', path: '/' },
    { icon: ArtistIcon, label: 'Artists', path: '/label/roster' },
    { icon: MusicIcon, label: 'Releases', path: '/label/releases' },
    { icon: EarningsAndRoyaltyIcon, label: 'Splits', path: '/label/splits' },
    { icon: PaymentsIcon, label: 'Payouts', path: '/label/payouts' },
    { icon: WalletMoneyIcon, label: 'Requests', path: '/label/withdrawal-requests' },
    { icon: HeadphoneIcon, label: 'Disputes', path: '/label/disputes' },
    { icon: Setting2Icon, label: 'Settings', path: '/label/settings' },
];

const contributorNavItems: NavItem[] = [
    { icon: DashboardIcon, label: 'Dashboard', path: '/' },
    { icon: EarningsAndRoyaltyIcon, label: 'Earnings', path: '/contributor/earnings' },
    { icon: MusicIcon, label: 'Splits', path: '/contributor/splits' },
    { icon: WalletMoneyIcon, label: 'Payouts', path: '/contributor/payouts' },
    { icon: PaymentsIcon, label: 'Payout Accounts', path: '/contributor/payout-accounts' },
    { icon: HeadphoneIcon, label: 'Disputes', path: '/contributor/disputes' },
    { icon: ArtistIcon, label: 'Profile', path: '/contributor/profile' },
];

const adManagerNavItems: NavItem[] = [
    { icon: DashboardIcon, label: 'Dashboard', path: '/' },
    { icon: AdLibraryIcon, label: 'Ads Library', path: '/ads/library' },
    { icon: StatusUpIcon, label: 'Spending', path: '/ads/spending' },
    { icon: SalesIcon, label: 'Ad Report', path: '/ads/report' },
    { icon: PaymentsIcon, label: 'Payments', path: '/ads/payments' },
    { icon: HeadphoneIcon, label: 'Disputes', path: '/ads/disputes' },
];

type CreatorSidebarNavProps = Omit<SidebarNavContext, 'onItemClick'>;

export const CreatorSidebarNav: React.FC<CreatorSidebarNavProps> = ({
    currentPath,
    isCollapsed,
    isInitialRender,
    onNavigate,
}) => {
    const { isRecordLabel, isAdManager, isPodcaster, isCreator } = useUserType();
    const isContributor = useIsContributor();
    const musicVideosLabel = isPodcaster || isCreator ? 'Video' : 'Music/Videos';

    const items = isContributor
        ? contributorNavItems
        : isAdManager
            ? adManagerNavItems
            : isRecordLabel
                ? recordLabelNavItems
                : buildArtistNavItems(musicVideosLabel);

    return (
        <SidebarNavList
            items={items}
            currentPath={currentPath}
            isCollapsed={isCollapsed}
            isInitialRender={isInitialRender}
            onNavigate={onNavigate}
        />
    );
};
