import {
    FiActivity,
    FiAlertCircle,
    FiAlertTriangle,
    FiAward,
    FiBarChart2,
    FiBell,
    FiBriefcase,
    FiCheckSquare,
    FiClipboard,
    FiClock,
    FiCopy,
    FiCreditCard,
    FiDisc,
    FiDollarSign,
    FiFileText,
    FiFlag,
    FiGift,
    FiGrid,
    FiHeadphones,
    FiHeart,
    FiHome,
    FiLayers,
    FiList,
    FiLock,
    FiMic,
    FiMusic,
    FiPercent,
    FiPieChart,
    FiStar,
    FiZap,
    FiSettings,
    FiShield,
    FiSliders,
    FiSpeaker,
    FiCrosshair,
    FiImage,
    FiTarget,
    FiTrendingUp,
    FiUnlock,
    FiUploadCloud,
    FiUserPlus,
    FiUsers,
    FiVideo,
} from 'react-icons/fi';
import type { NavGroup, NavLink } from '../components/ui';
import { useRoleScope } from '../hooks/useAdminManagement';
import { PLATFORM_ROLES, type PlatformRole } from './adminRoles';

const ROLE_ICON: Record<PlatformRole, React.ElementType> = {
    fan: FiUsers,
    artist: FiMusic,
    dj: FiMusic,
    creator: FiVideo,
    podcaster: FiMic,
    record_label: FiBriefcase,
    ad_manager: FiTarget,
    contributor: FiUserPlus,
};

const usersViewPerm = (role: PlatformRole) =>
    role === 'contributor' ? 'ContributorsView' : 'UsersView';

/**
 * The document's 7-group admin navigation, scope- and permission-aware. Each
 * item's `visible` flag is computed from {@link useRoleScope} —
 * `isSuperAdmin || (roleScope allows the role && the permission is held)` — so
 * a staff member scoped to "Artists only" never sees Labels/Ads entries. The
 * backend independently enforces true data scoping; this only shapes the nav.
 * Groups with no visible items are dropped by `SectionNav`.
 */
export const useAdminNavGroups = (): NavGroup[] => {
    const { canAccess } = useRoleScope();

    const roleItems = (
        roles: PlatformRole[],
        basePath: string,
        permission: (r: PlatformRole) => string,
    ): NavLink[] =>
        roles.map((r) => {
            const meta = PLATFORM_ROLES[r];
            return {
                label: meta.plural,
                to: `${basePath}/${meta.slug}`,
                icon: ROLE_ICON[r],
                visible: canAccess({ role: r, permission: permission(r) }),
            };
        });

    const CONTENT_ROLES: PlatformRole[] = [
        'artist', 'dj', 'creator', 'podcaster', 'record_label', 'contributor', 'ad_manager',
    ];
    const SUPPORT_ROLES: PlatformRole[] = [
        'fan', 'artist', 'dj', 'creator', 'podcaster', 'contributor', 'record_label', 'ad_manager',
    ];
    const PAYOUT_ROLES: PlatformRole[] = [
        'artist', 'dj', 'creator', 'podcaster', 'record_label', 'contributor',
    ];

    // Moderation/Support advertiser queues live at the /advertisers slug.
    const slugFor = (basePath: string, r: PlatformRole) =>
        r === 'ad_manager' ? `${basePath}/advertisers` : `${basePath}/${PLATFORM_ROLES[r].slug}`;

    return [
        {
            id: 'platform',
            label: 'Platform',
            icon: FiHome,
            items: [
                { label: 'Dashboard', to: '/admin', icon: FiGrid, exact: true, visible: true },
                { label: 'Business Analytics', to: '/admin/platform/business', icon: FiBarChart2, visible: canAccess({ permission: 'AnalyticsView' }) },
                { label: 'Growth Analytics', to: '/admin/platform/growth', icon: FiTrendingUp, visible: canAccess({ permission: 'AnalyticsView' }) },
                { label: 'Revenue', to: '/admin/platform/revenue', icon: FiPieChart, visible: canAccess({ permission: 'AnalyticsView' }) },
                { label: 'Risk & Compliance', to: '/admin/platform/risk', icon: FiAlertTriangle, visible: canAccess({ permission: 'AnalyticsView' }) },
                { label: "Today's Queue", to: '/admin/platform/queue', icon: FiClipboard, visible: canAccess({ permission: 'AnalyticsView' }) },
                { label: 'Notifications', to: '/admin/notifications', icon: FiBell, visible: canAccess({ permission: 'NotificationsView' }) },
                { label: 'System Settings', to: '/admin/platform/settings', icon: FiSettings, visible: canAccess({ permission: 'SettingsView' }) },
            ],
        },
        {
            id: 'users',
            label: 'Users & Roles',
            icon: FiUsers,
            items: [
                { label: 'All Users', to: '/admin/users', icon: FiUsers, exact: true, visible: canAccess({ permission: 'UsersView' }) },
                ...roleItems(
                    ['fan', 'artist', 'dj', 'creator', 'podcaster', 'contributor', 'record_label', 'ad_manager'],
                    '/admin/users',
                    usersViewPerm,
                ),
                { label: 'Security Activity', to: '/admin/security', icon: FiLock, visible: canAccess({ permission: 'SecurityView' }) },
                { label: 'Verification Centre', to: '/admin/verifications', icon: FiCheckSquare, visible: canAccess({ permission: 'VerificationsView' }) },
            ],
        },
        {
            id: 'content',
            label: 'Content',
            icon: FiLayers,
            items: [
                { label: 'Content Library', to: '/admin/content', icon: FiLayers, exact: true, visible: canAccess({ permission: 'ContentView' }) },
                { label: 'Music', to: '/admin/content/music', icon: FiMusic, visible: canAccess({ permission: 'ContentView' }) },
                { label: 'DJ Mixes', to: '/admin/content/dj-mixes', icon: FiDisc, visible: canAccess({ permission: 'ContentView' }) },
                { label: 'Videos', to: '/admin/content/videos', icon: FiVideo, visible: canAccess({ permission: 'ContentView' }) },
                { label: 'Albums', to: '/admin/content/albums', icon: FiDisc, visible: canAccess({ permission: 'ContentView' }) },
                { label: 'Singles', to: '/admin/content/singles', icon: FiMusic, visible: canAccess({ permission: 'ContentView' }) },
                { label: 'Podcasts', to: '/admin/content/podcasts', icon: FiMic, visible: canAccess({ permission: 'ContentView' }) },
                { label: 'Playlists', to: '/admin/content/playlists', icon: FiList, visible: canAccess({ permission: 'ContentView' }) },
                { label: 'Upload Workflow', to: '/admin/content/uploads', icon: FiUploadCloud, visible: canAccess({ permission: 'ContentView' }) },
                { label: 'Lyrics', to: '/admin/content/lyrics', icon: FiFileText, visible: canAccess({ permission: 'ContentView' }) },
                { label: 'Duplicate Detection', to: '/admin/content/duplicates', icon: FiCopy, visible: canAccess({ permission: 'CopyrightReview' }) },
                ...CONTENT_ROLES.map((r) => ({
                    label: `${PLATFORM_ROLES[r].plural} Moderation`,
                    to: slugFor('/admin/content/moderation', r),
                    icon: FiFlag,
                    visible: canAccess({ role: r, permission: 'ModerationView' }),
                })),
            ],
        },
        {
            id: 'discovery',
            label: 'Discovery',
            icon: FiAward,
            items: [
                { label: 'Spotlight', to: '/admin/spotlight', icon: FiAward, visible: canAccess({ permission: 'SpotlightView' }) },
                { label: 'Trending', to: '/admin/discovery/trending', icon: FiTrendingUp, visible: canAccess({ permission: 'DiscoveryView' }) },
                { label: 'Top Charts', to: '/admin/discovery/top-charts', icon: FiBarChart2, visible: canAccess({ permission: 'DiscoveryView' }) },
                { label: 'Hot Releases', to: '/admin/discovery/hot-releases', icon: FiZap, visible: canAccess({ permission: 'DiscoveryView' }) },
                { label: 'New Releases', to: '/admin/discovery/new-releases', icon: FiClock, visible: canAccess({ permission: 'DiscoveryView' }) },
                { label: 'Featured Content', to: '/admin/discovery/featured', icon: FiStar, visible: canAccess({ permission: 'DiscoveryView' }) },
                { label: 'Curation Overrides', to: '/admin/discovery/overrides', icon: FiSliders, visible: canAccess({ permission: 'DiscoveryView' }) },
                { label: 'Most Gifted', to: '/admin/discovery/most-gifted', icon: FiGift, visible: canAccess({ permission: 'DiscoveryView' }) },
                { label: 'Top Givers', to: '/admin/discovery/top-givers', icon: FiHeart, visible: canAccess({ permission: 'DiscoveryView' }) },
                { label: 'Home Feed', to: '/admin/discovery/home-feed', icon: FiHome, visible: canAccess({ permission: 'DiscoveryView' }) },
                { label: 'Leaderboards', to: '/admin/discovery/leaderboards', icon: FiAward, visible: canAccess({ permission: 'LeaderboardView' }) },
            ],
        },
        {
            id: 'monetization',
            label: 'Monetization',
            icon: FiDollarSign,
            items: [
                { label: 'Coin Economy', to: '/admin/coin-economy', icon: FiCreditCard, visible: canAccess({ permission: 'CoinEconomyView' }) },
                { label: 'Coin Transactions', to: '/admin/monetization/coin-transactions', icon: FiCreditCard, visible: canAccess({ permission: 'FinanceView' }) },
                { label: 'Gifts', to: '/admin/monetization/gifts', icon: FiGift, visible: canAccess({ permission: 'FinanceView' }) },
                { label: 'Unlocks', to: '/admin/monetization/unlocks', icon: FiUnlock, visible: canAccess({ permission: 'FinanceView' }) },
                { label: 'Commission', to: '/admin/monetization/commission', icon: FiPercent, visible: canAccess({ permission: 'FinanceView' }) },
                { label: 'Royalties', to: '/admin/monetization/royalties', icon: FiUsers, visible: canAccess({ permission: 'FinanceView' }) },
                { label: 'Royalty Splits', to: '/admin/monetization/royalty-splits', icon: FiList, visible: canAccess({ permission: 'RoyaltiesView' }) },
                { label: 'Sponsorships', to: '/admin/monetization/sponsorships', icon: FiBriefcase, visible: canAccess({ permission: 'SponsorshipsView' }) },
                { label: 'Refunds & Disputes', to: '/admin/monetization/disputes', icon: FiAlertCircle, visible: canAccess({ permission: 'DisputesView' }) },
                { label: 'Monetization Settings', to: '/admin/monetization/settings', icon: FiSettings, visible: canAccess({ permission: 'SettingsView' }) },
            ],
        },
        {
            id: 'advertising',
            label: 'Advertising',
            icon: FiSpeaker,
            items: [
                { label: 'Overview', to: '/admin/advertising/overview', icon: FiTarget, visible: canAccess({ permission: 'AdvertisingView' }) },
                { label: 'Advertisers', to: '/admin/advertising/advertisers', icon: FiUsers, visible: canAccess({ permission: 'AdvertisingView' }) },
                { label: 'Ad Library', to: '/admin/advertising/ad-library', icon: FiImage, visible: canAccess({ permission: 'AdvertisingView' }) },
                { label: 'Campaigns', to: '/admin/advertising/campaigns', icon: FiTarget, visible: canAccess({ permission: 'AdvertisingView' }) },
                { label: 'Creative Review', to: '/admin/advertising/creative-review', icon: FiCheckSquare, visible: canAccess({ permission: 'AdvertisingView' }) },
                { label: 'Targeting Review', to: '/admin/advertising/targeting-review', icon: FiCrosshair, visible: canAccess({ permission: 'AdvertisingView' }) },
                { label: 'Placements', to: '/admin/advertising/placements', icon: FiGrid, visible: canAccess({ permission: 'AdvertisingView' }) },
                { label: 'Ad Wallets', to: '/admin/advertising/wallet', icon: FiCreditCard, visible: canAccess({ permission: 'AdvertisingView' }) },
                { label: 'Billing & VAT', to: '/admin/advertising/billing', icon: FiFileText, visible: canAccess({ permission: 'AdvertisingView' }) },
                { label: 'Analytics', to: '/admin/advertising/analytics', icon: FiBarChart2, visible: canAccess({ permission: 'AdvertisingView' }) },
                { label: 'Moderation', to: '/admin/advertising/moderation', icon: FiFlag, visible: canAccess({ permission: 'AdvertisingView' }) },
                { label: 'Disputes', to: '/admin/advertising/disputes', icon: FiAlertCircle, visible: canAccess({ permission: 'DisputesView' }) },
                { label: 'Advertiser Support', to: '/admin/advertising/support', icon: FiHeadphones, visible: canAccess({ role: 'ad_manager', permission: 'SupportView' }) },
                { label: 'Settings', to: '/admin/advertising/settings', icon: FiSettings, visible: canAccess({ permission: 'SettingsView' }) },
            ],
        },
        {
            id: 'payouts',
            label: 'Payouts',
            icon: FiCreditCard,
            items: [
                { label: 'All Requests', to: '/admin/payouts/requests', icon: FiList, exact: true, visible: canAccess({ permission: 'FinanceView' }) },
                // Maker-checker queue. It lives here, next to the requests it gates,
                // rather than under Monetization where it was easy to miss. Visible to
                // the dedicated second-reviewer role too, which need not hold FinanceView.
                {
                    label: 'Approvals',
                    to: '/admin/finance/approvals',
                    icon: FiCheckSquare,
                    visible:
                        canAccess({ permission: 'FinanceView' }) ||
                        canAccess({ permission: 'FinanceApproveSecondReviewer' }),
                },
                { label: 'Payout History', to: '/admin/payouts/history', icon: FiClock, visible: canAccess({ permission: 'FinanceView' }) },
                { label: 'Payout Accounts', to: '/admin/payouts/accounts', icon: FiCreditCard, visible: canAccess({ permission: 'FinanceView' }) },
                { label: 'Payout Settings', to: '/admin/payouts/settings', icon: FiSettings, visible: canAccess({ permission: 'SettingsView' }) },
                { label: 'Payout Audit Trail', to: '/admin/payouts/audit', icon: FiActivity, visible: canAccess({ permission: 'FinanceView' }) },
                ...PAYOUT_ROLES.map((r) => ({
                    label: PLATFORM_ROLES[r].plural,
                    to: `/admin/payouts/requests/${PLATFORM_ROLES[r].slug}`,
                    icon: ROLE_ICON[r],
                    visible: canAccess({ role: r, permission: 'FinanceView' }),
                })),
            ],
        },
        {
            id: 'support',
            label: 'Support & Governance',
            icon: FiHeadphones,
            items: [
                { label: 'Support (all)', to: '/admin/support', icon: FiHeadphones, exact: true, visible: canAccess({ permission: 'SupportView' }) },
                ...SUPPORT_ROLES.map((r) => ({
                    label: `${PLATFORM_ROLES[r].plural} Support`,
                    to: slugFor('/admin/support', r),
                    icon: FiHeadphones,
                    visible: canAccess({ role: r, permission: 'SupportView' }),
                })),
                { label: 'Roles & Permissions', to: '/admin/management/roles', icon: FiShield, visible: true },
                { label: 'Staff Assignment', to: '/admin/management/staff-assignment', icon: FiUserPlus, visible: true },
                { label: 'Admin Team', to: '/admin/management/team', icon: FiUsers, visible: true },
                { label: 'Settings', to: '/admin/settings', icon: FiFileText, visible: true },
                { label: 'Audit Trail', to: '/admin/governance/audit-trail', icon: FiClipboard, visible: canAccess({ permission: 'AuditView' }) },
            ],
        },
    ];
};
