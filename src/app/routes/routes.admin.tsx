import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import AdminRoute from './AdminRoute';
import AdminProtectedRoute from './AdminProtectedRoute';

// Staff sign in on the admin origin itself, so the admin bundle carries its own
// copy of these two auth screens. They are declared here rather than imported
// from `routes.creator` so that importing this module never drags the creator
// route table in behind it.
const Login = lazy(() => import('@auth/pages/Login'));
const ForgotPassword = lazy(() => import('@auth/pages/ForgotPassword'));

// Super Admin
const AdminOverviewPage = lazy(() => import('@/features/admin/pages/AdminOverviewPage'));
const VerificationCenterPage = lazy(() => import('@/features/admin/pages/VerificationCenterPage'));
const AdminUsersPage = lazy(() => import('@/features/admin/pages/UsersPage'));
const AdminSecurityActivityPage = lazy(() => import('@/features/admin/pages/security/SecurityActivityPage'));
const AdminUserDetailPage = lazy(() => import('@/features/admin/pages/UserDetailPage'));
const AdminSupportPage = lazy(() => import('@/features/admin/pages/SupportPage'));
const AdminSettingsPage = lazy(() => import('@/features/admin/pages/AdminSettingsPage'));
const AdminManagementPage = lazy(() => import('@/features/admin/pages/AdminManagementPage'));
const AdminCoinEconomyPage = lazy(() => import('@/features/admin/pages/CoinEconomyPage'));
const AdminSpotlightPage = lazy(() => import('@/features/admin/pages/SpotlightPage'));
// Discovery & Leaderboards
const AdminTrendingPage = lazy(() => import('@/features/admin/pages/discovery/TrendingPage'));
const AdminTopChartsPage = lazy(() => import('@/features/admin/pages/discovery/TopChartsPage'));
const AdminHotReleasesPage = lazy(() => import('@/features/admin/pages/discovery/HotReleasesPage'));
const AdminNewReleasesPage = lazy(() => import('@/features/admin/pages/discovery/NewReleasesPage'));
const AdminFeaturedContentPage = lazy(() => import('@/features/admin/pages/discovery/FeaturedContentPage'));
const AdminOverridesPage = lazy(() => import('@/features/admin/pages/discovery/OverridesPage'));
const AdminMostGiftedPage = lazy(() => import('@/features/admin/pages/discovery/MostGiftedPage'));
const AdminTopGiversPage = lazy(() => import('@/features/admin/pages/discovery/TopGiversPage'));
const AdminHomeFeedPage = lazy(() => import('@/features/admin/pages/discovery/HomeFeedPage'));
const AdminLeaderboardManagementPage = lazy(() => import('@/features/admin/pages/discovery/LeaderboardManagementPage'));
const AdminCoinTransactionsPage = lazy(() => import('@/features/admin/pages/monetization/CoinTransactionsPage'));
const AdminGiftsPage = lazy(() => import('@/features/admin/pages/monetization/GiftsPage'));
const AdminUnlocksPage = lazy(() => import('@/features/admin/pages/monetization/UnlocksPage'));
const AdminCommissionPage = lazy(() => import('@/features/admin/pages/monetization/CommissionPage'));
const AdminRoyaltiesPage = lazy(() => import('@/features/admin/pages/monetization/RoyaltiesPage'));
const AdminRoyaltySplitsPage = lazy(() => import('@/features/admin/pages/monetization/RoyaltySplitsPage'));
const AdminSponsorshipsPage = lazy(() => import('@/features/admin/pages/monetization/SponsorshipsPage'));
const AdminDisputesPage = lazy(() => import('@/features/admin/pages/monetization/DisputesPage'));
const AdminMonetizationSettingsPage = lazy(() => import('@/features/admin/pages/monetization/MonetizationSettingsPage'));
// Advertising (Phase 3 Group 7 — Towers 17 & 18)
const AdvertisingOverviewPage = lazy(() => import('@/features/admin/pages/advertising/OverviewPage'));
const AdvertisingAdvertisersPage = lazy(() => import('@/features/admin/pages/advertising/AdvertisersPage'));
const AdvertisingAdLibraryPage = lazy(() => import('@/features/admin/pages/advertising/AdLibraryPage'));
const AdvertisingCampaignsPage = lazy(() => import('@/features/admin/pages/advertising/CampaignsPage'));
const AdvertisingCreativeReviewPage = lazy(() => import('@/features/admin/pages/advertising/CreativeReviewPage'));
const AdvertisingTargetingReviewPage = lazy(() => import('@/features/admin/pages/advertising/TargetingReviewPage'));
const AdvertisingPlacementsPage = lazy(() => import('@/features/admin/pages/advertising/PlacementsPage'));
const AdvertisingWalletPage = lazy(() => import('@/features/admin/pages/advertising/AdWalletPage'));
const AdvertisingBillingVatPage = lazy(() => import('@/features/admin/pages/advertising/BillingVatPage'));
const AdvertisingAnalyticsPage = lazy(() => import('@/features/admin/pages/advertising/PerformanceAnalyticsPage'));
const AdvertisingModerationPage = lazy(() => import('@/features/admin/pages/advertising/AdModerationPage'));
const AdvertisingDisputesPage = lazy(() => import('@/features/admin/pages/advertising/AdDisputesPage'));
const AdvertisingSupportPage = lazy(() => import('@/features/admin/pages/advertising/AdvertiserSupportPage'));
const AdvertisingSettingsPage = lazy(() => import('@/features/admin/pages/advertising/AdvertisingSettingsPage'));
const AdminInviteAcceptPage = lazy(() => import('@/features/admin/pages/AdminInviteAcceptPage'));
// CR1 — per-role user management pages
const AdminFansPage = lazy(() => import('@/features/admin/pages/users/FansPage'));
const AdminArtistsPage = lazy(() => import('@/features/admin/pages/users/ArtistsPage'));
const AdminDjsPage = lazy(() => import('@/features/admin/pages/users/DjsPage'));
const AdminCreatorsPage = lazy(() => import('@/features/admin/pages/users/CreatorsPage'));
const AdminPodcastersPage = lazy(() => import('@/features/admin/pages/users/PodcastersPage'));
const AdminContributorsPage = lazy(() => import('@/features/admin/pages/users/ContributorsPage'));
const AdminRecordLabelsPage = lazy(() => import('@/features/admin/pages/users/RecordLabelsPage'));
const AdminAdManagersPage = lazy(() => import('@/features/admin/pages/users/AdManagersPage'));
// Content suite (Towers 5/6/7/23/27/28)
const AdminContentLibraryPage = lazy(() => import('@/features/admin/pages/content/ContentLibraryPage'));
const AdminMusicOpsPage = lazy(() => import('@/features/admin/pages/content/MusicOpsPage'));
const AdminDjMixesPage = lazy(() => import('@/features/admin/pages/content/DjMixesPage'));
const AdminVideosOpsPage = lazy(() => import('@/features/admin/pages/content/VideosOpsPage'));
const AdminAlbumsOpsPage = lazy(() => import('@/features/admin/pages/content/AlbumsOpsPage'));
const AdminSinglesOpsPage = lazy(() => import('@/features/admin/pages/content/SinglesOpsPage'));
const AdminPodcastsOpsPage = lazy(() => import('@/features/admin/pages/content/PodcastsOpsPage'));
const AdminPlaylistsPage = lazy(() => import('@/features/admin/pages/content/PlaylistsPage'));
const AdminUploadWorkflowPage = lazy(() => import('@/features/admin/pages/content/UploadWorkflowPage'));
const AdminLyricsManagementPage = lazy(() => import('@/features/admin/pages/content/LyricsManagementPage'));
const AdminDuplicateDetectionPage = lazy(() => import('@/features/admin/pages/content/DuplicateDetectionPage'));
// Content detail routes (Phase 3 redesign)
const AdminContentItemDetailPage = lazy(() => import('@/features/admin/pages/content/ContentItemDetailPage'));
const AdminDuplicateMatchDetailPage = lazy(() => import('@/features/admin/pages/content/DuplicateMatchDetailPage'));
// CR1 — per-role moderation queues
const AdminArtistModerationPage = lazy(() => import('@/features/admin/pages/content/moderation/ArtistModerationPage'));
const AdminDjModerationPage = lazy(() => import('@/features/admin/pages/content/moderation/DjModerationPage'));
const AdminCreatorModerationPage = lazy(() => import('@/features/admin/pages/content/moderation/CreatorModerationPage'));
const AdminPodcasterModerationPage = lazy(() => import('@/features/admin/pages/content/moderation/PodcasterModerationPage'));
const AdminRecordLabelModerationPage = lazy(() => import('@/features/admin/pages/content/moderation/RecordLabelModerationPage'));
const AdminContributorModerationPage = lazy(() => import('@/features/admin/pages/content/moderation/ContributorModerationPage'));
const AdminAdvertiserModerationPage = lazy(() => import('@/features/admin/pages/content/moderation/AdvertiserModerationPage'));
// CR1 — per-role support queues
const AdminFanSupportPage = lazy(() => import('@/features/admin/pages/support/FanSupportPage'));
const AdminArtistSupportPage = lazy(() => import('@/features/admin/pages/support/ArtistSupportPage'));
const AdminDjSupportPage = lazy(() => import('@/features/admin/pages/support/DjSupportPage'));
const AdminCreatorSupportPage = lazy(() => import('@/features/admin/pages/support/CreatorSupportPage'));
const AdminPodcasterSupportPage = lazy(() => import('@/features/admin/pages/support/PodcasterSupportPage'));
const AdminContributorSupportPage = lazy(() => import('@/features/admin/pages/support/ContributorSupportPage'));
const AdminRecordLabelSupportPage = lazy(() => import('@/features/admin/pages/support/RecordLabelSupportPage'));
const AdminAdvertiserSupportPage = lazy(() => import('@/features/admin/pages/support/AdvertiserSupportPage'));
// CR1 — per-role payout queues
const AdminArtistPayoutsPage = lazy(() => import('@/features/admin/pages/payouts/ArtistPayoutsPage'));
const AdminDjPayoutsPage = lazy(() => import('@/features/admin/pages/payouts/DjPayoutsPage'));
const AdminCreatorPayoutsPage = lazy(() => import('@/features/admin/pages/payouts/CreatorPayoutsPage'));
const AdminPodcasterPayoutsPage = lazy(() => import('@/features/admin/pages/payouts/PodcasterPayoutsPage'));
const AdminRecordLabelPayoutsPage = lazy(() => import('@/features/admin/pages/payouts/RecordLabelPayoutsPage'));
const AdminContributorPayoutsPage = lazy(() => import('@/features/admin/pages/payouts/ContributorPayoutsPage'));
const AdminAllPayoutRequestsPage = lazy(() => import('@/features/admin/pages/payouts/AllRequestsPage'));
const AdminPayoutHistoryPage = lazy(() => import('@/features/admin/pages/payouts/HistoryPage'));
const AdminPayoutAccountsPage = lazy(() => import('@/features/admin/pages/payouts/AccountsPage'));
const AdminPayoutSettingsPage = lazy(() => import('@/features/admin/pages/payouts/SettingsPage'));
const AdminPayoutAuditTrailPage = lazy(() => import('@/features/admin/pages/payouts/AuditTrailPage'));
// CR1 — maker-checker review + split management pages
const AdminApprovalsPage = lazy(() => import('@/features/admin/pages/finance/ApprovalsPage'));
const AdminRolesPermissionsPage = lazy(() => import('@/features/admin/pages/management/RolesPermissionsPage'));
const AdminTeamPage = lazy(() => import('@/features/admin/pages/management/AdminTeamPage'));
const AdminStaffAssignmentPage = lazy(() => import('@/features/admin/pages/management/StaffAssignmentPage'));
// Platform (Towers 1/22/24/31) — analytics, queue, settings + notifications
const AdminBusinessAnalyticsPage = lazy(() => import('@/features/admin/pages/platform/BusinessAnalyticsPage'));
const AdminGrowthAnalyticsPage = lazy(() => import('@/features/admin/pages/platform/GrowthAnalyticsPage'));
const AdminRevenueOverviewPage = lazy(() => import('@/features/admin/pages/platform/RevenueOverviewPage'));
const AdminRiskCompliancePage = lazy(() => import('@/features/admin/pages/platform/RiskCompliancePage'));
const AdminTodayQueuePage = lazy(() => import('@/features/admin/pages/platform/TodayQueuePage'));
const AdminSystemSettingsPage = lazy(() => import('@/features/admin/pages/platform/SystemSettingsPage'));
const AdminNotificationsConsolePage = lazy(() => import('@/features/admin/pages/notifications/NotificationsConsolePage'));
// Support & Governance (Phase 3 Group 8)
const AdminGovernanceAuditTrailPage = lazy(() => import('@/features/admin/pages/governance/AuditTrailPage'));

/**
 * Admin console routes, kept in their own module so they can be built as a
 * separate bundle served from `admin.getmuxify.com` rather than shipped to
 * every fan and artist. `AdminRoute` remains a UX guard only — the backend
 * enforces the `Admin` role and a per-route permission on every
 * `/api/v1/admin/*` endpoint.
 */

/** Pre-auth: staff claiming an emailed invitation. */
export const adminPublicRoutes: RouteObject[] = [
    { path: '/admin/accept-invite', element: <AdminInviteAcceptPage /> },
];

/** Children of the shared `/` ProtectedRoute subtree. */
export const adminProtectedChildren: RouteObject[] = [
    // Super Admin routes (role-gated by AdminRoute)
    {
        element: <AdminRoute />,
        children: [
            { path: '/admin', element: <AdminOverviewPage /> },
            { path: '/admin/verifications', element: <VerificationCenterPage /> },
            { path: '/admin/users', element: <AdminUsersPage /> },
            // Per-role user pages (static segments rank above :userId).
            { path: '/admin/users/fans', element: <AdminFansPage /> },
            { path: '/admin/users/artists', element: <AdminArtistsPage /> },
            { path: '/admin/users/djs', element: <AdminDjsPage /> },
            { path: '/admin/users/creators', element: <AdminCreatorsPage /> },
            { path: '/admin/users/podcasters', element: <AdminPodcastersPage /> },
            { path: '/admin/users/contributors', element: <AdminContributorsPage /> },
            { path: '/admin/users/record-labels', element: <AdminRecordLabelsPage /> },
            { path: '/admin/users/ad-managers', element: <AdminAdManagersPage /> },
            { path: '/admin/security', element: <AdminSecurityActivityPage /> },
            { path: '/admin/users/:userId', element: <AdminUserDetailPage /> },
            // Content suite — library, per-vertical ops, uploads, lyrics, duplicates.
            { path: '/admin/content', element: <AdminContentLibraryPage /> },
            { path: '/admin/content/music', element: <AdminMusicOpsPage /> },
            { path: '/admin/content/dj-mixes', element: <AdminDjMixesPage /> },
            { path: '/admin/content/videos', element: <AdminVideosOpsPage /> },
            { path: '/admin/content/albums', element: <AdminAlbumsOpsPage /> },
            { path: '/admin/content/singles', element: <AdminSinglesOpsPage /> },
            { path: '/admin/content/podcasts', element: <AdminPodcastsOpsPage /> },
            { path: '/admin/content/playlists', element: <AdminPlaylistsPage /> },
            { path: '/admin/content/uploads', element: <AdminUploadWorkflowPage /> },
            { path: '/admin/content/lyrics', element: <AdminLyricsManagementPage /> },
            { path: '/admin/content/duplicates', element: <AdminDuplicateDetectionPage /> },
            // Content & duplicate detail pages (static segments rank above :kind/:id).
            { path: '/admin/content/duplicates/:id', element: <AdminDuplicateMatchDetailPage /> },
            { path: '/admin/content/:kind/:id', element: <AdminContentItemDetailPage /> },
            // Content moderation — separated per-role queues.
            { path: '/admin/content/moderation/artists', element: <AdminArtistModerationPage /> },
            { path: '/admin/content/moderation/djs', element: <AdminDjModerationPage /> },
            { path: '/admin/content/moderation/creators', element: <AdminCreatorModerationPage /> },
            { path: '/admin/content/moderation/podcasters', element: <AdminPodcasterModerationPage /> },
            { path: '/admin/content/moderation/record-labels', element: <AdminRecordLabelModerationPage /> },
            { path: '/admin/content/moderation/contributors', element: <AdminContributorModerationPage /> },
            { path: '/admin/content/moderation/advertisers', element: <AdminAdvertiserModerationPage /> },
            // Support — separated per-role queues (kept alongside the all-queues overview).
            { path: '/admin/support', element: <AdminSupportPage /> },
            { path: '/admin/support/fans', element: <AdminFanSupportPage /> },
            { path: '/admin/support/artists', element: <AdminArtistSupportPage /> },
            { path: '/admin/support/djs', element: <AdminDjSupportPage /> },
            { path: '/admin/support/creators', element: <AdminCreatorSupportPage /> },
            { path: '/admin/support/podcasters', element: <AdminPodcasterSupportPage /> },
            { path: '/admin/support/contributors', element: <AdminContributorSupportPage /> },
            { path: '/admin/support/record-labels', element: <AdminRecordLabelSupportPage /> },
            { path: '/admin/support/advertisers', element: <AdminAdvertiserSupportPage /> },
            // Payouts — consolidated views (Tower 15) + separated per-role request queues.
            { path: '/admin/payouts/requests', element: <AdminAllPayoutRequestsPage /> },
            { path: '/admin/payouts/history', element: <AdminPayoutHistoryPage /> },
            { path: '/admin/payouts/accounts', element: <AdminPayoutAccountsPage /> },
            { path: '/admin/payouts/settings', element: <AdminPayoutSettingsPage /> },
            { path: '/admin/payouts/audit', element: <AdminPayoutAuditTrailPage /> },
            { path: '/admin/payouts/requests/artists', element: <AdminArtistPayoutsPage /> },
            { path: '/admin/payouts/requests/djs', element: <AdminDjPayoutsPage /> },
            { path: '/admin/payouts/requests/creators', element: <AdminCreatorPayoutsPage /> },
            { path: '/admin/payouts/requests/podcasters', element: <AdminPodcasterPayoutsPage /> },
            { path: '/admin/payouts/requests/record-labels', element: <AdminRecordLabelPayoutsPage /> },
            { path: '/admin/payouts/requests/contributors', element: <AdminContributorPayoutsPage /> },
            // Management — split into three separate pages.
            { path: '/admin/management', element: <AdminManagementPage /> },
            { path: '/admin/management/roles', element: <AdminRolesPermissionsPage /> },
            { path: '/admin/management/team', element: <AdminTeamPage /> },
            { path: '/admin/management/staff-assignment', element: <AdminStaffAssignmentPage /> },
            { path: '/admin/coin-economy', element: <AdminCoinEconomyPage /> },
            { path: '/admin/spotlight', element: <AdminSpotlightPage /> },
            // Discovery & Leaderboards
            { path: '/admin/discovery/trending', element: <AdminTrendingPage /> },
            { path: '/admin/discovery/top-charts', element: <AdminTopChartsPage /> },
            { path: '/admin/discovery/hot-releases', element: <AdminHotReleasesPage /> },
            { path: '/admin/discovery/new-releases', element: <AdminNewReleasesPage /> },
            { path: '/admin/discovery/featured', element: <AdminFeaturedContentPage /> },
            { path: '/admin/discovery/overrides', element: <AdminOverridesPage /> },
            { path: '/admin/discovery/most-gifted', element: <AdminMostGiftedPage /> },
            { path: '/admin/discovery/top-givers', element: <AdminTopGiversPage /> },
            { path: '/admin/discovery/home-feed', element: <AdminHomeFeedPage /> },
            { path: '/admin/discovery/leaderboards', element: <AdminLeaderboardManagementPage /> },
            { path: '/admin/finance/approvals', element: <AdminApprovalsPage /> },
            // Monetization (Phase 3 Group 5)
            { path: '/admin/monetization/coin-transactions', element: <AdminCoinTransactionsPage /> },
            { path: '/admin/monetization/gifts', element: <AdminGiftsPage /> },
            { path: '/admin/monetization/unlocks', element: <AdminUnlocksPage /> },
            { path: '/admin/monetization/commission', element: <AdminCommissionPage /> },
            { path: '/admin/monetization/royalties', element: <AdminRoyaltiesPage /> },
            { path: '/admin/monetization/royalty-splits', element: <AdminRoyaltySplitsPage /> },
            { path: '/admin/monetization/sponsorships', element: <AdminSponsorshipsPage /> },
            { path: '/admin/monetization/disputes', element: <AdminDisputesPage /> },
            { path: '/admin/monetization/settings', element: <AdminMonetizationSettingsPage /> },
            // Advertising (Phase 3 Group 7 — Towers 17 & 18)
            { path: '/admin/advertising/overview', element: <AdvertisingOverviewPage /> },
            { path: '/admin/advertising/advertisers', element: <AdvertisingAdvertisersPage /> },
            { path: '/admin/advertising/ad-library', element: <AdvertisingAdLibraryPage /> },
            { path: '/admin/advertising/campaigns', element: <AdvertisingCampaignsPage /> },
            { path: '/admin/advertising/creative-review', element: <AdvertisingCreativeReviewPage /> },
            { path: '/admin/advertising/targeting-review', element: <AdvertisingTargetingReviewPage /> },
            { path: '/admin/advertising/placements', element: <AdvertisingPlacementsPage /> },
            { path: '/admin/advertising/wallet', element: <AdvertisingWalletPage /> },
            { path: '/admin/advertising/billing', element: <AdvertisingBillingVatPage /> },
            { path: '/admin/advertising/analytics', element: <AdvertisingAnalyticsPage /> },
            { path: '/admin/advertising/moderation', element: <AdvertisingModerationPage /> },
            { path: '/admin/advertising/disputes', element: <AdvertisingDisputesPage /> },
            { path: '/admin/advertising/support', element: <AdvertisingSupportPage /> },
            { path: '/admin/advertising/settings', element: <AdvertisingSettingsPage /> },
            { path: '/admin/settings', element: <AdminSettingsPage /> },
            // Platform — Towers 1/22/24/31 (analytics, queue, settings).
            { path: '/admin/platform/business', element: <AdminBusinessAnalyticsPage /> },
            { path: '/admin/platform/growth', element: <AdminGrowthAnalyticsPage /> },
            { path: '/admin/platform/revenue', element: <AdminRevenueOverviewPage /> },
            { path: '/admin/platform/risk', element: <AdminRiskCompliancePage /> },
            { path: '/admin/platform/queue', element: <AdminTodayQueuePage /> },
            { path: '/admin/platform/settings', element: <AdminSystemSettingsPage /> },
            { path: '/admin/notifications', element: <AdminNotificationsConsolePage /> },
            // Support & Governance (Phase 3 Group 8)
            { path: '/admin/governance/audit-trail', element: <AdminGovernanceAuditTrailPage /> },
        ],
    },
];

/**
 * Complete standalone route table for the admin-only build (`admin.html` →
 * `main.admin.tsx`). Unused by the combined build, where `routes.tsx` composes
 * `adminPublicRoutes` / `adminProtectedChildren` into the creator tree instead;
 * Rollup drops this export from that bundle.
 */
export const adminAppRoutes: RouteObject[] = [
    { path: '/login', element: <Login /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    ...adminPublicRoutes,
    {
        path: '/',
        element: <AdminProtectedRoute />,
        children: [
            // "/" on the admin origin is the console, not a creator dashboard.
            { index: true, element: <Navigate to="/admin" replace /> },
            ...adminProtectedChildren,
        ],
    },
    // Anything else on this origin is a creator route that does not exist here.
    { path: '*', element: <Navigate to="/admin" replace /> },
];
