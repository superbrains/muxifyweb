import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import DashboardRouter from './DashboardRouter';
import ProtectedRoute from './ProtectedRoute';

// Lazy imports
const Login = lazy(() => import('@auth/pages/Login'));
const Register = lazy(() => import('@auth/pages/Register'));
const ForgotPassword = lazy(() => import('@auth/pages/ForgotPassword'));
const JoinMuxify = lazy(() => import('@auth/pages/JoinMuxify'));
const ArtistRegistration = lazy(() => import('@onboarding/pages/ArtistRegistration'));
const InvitedArtistRegistration = lazy(() => import('@onboarding/pages/InvitedArtistRegistration'));
const ArtistEmailVerification = lazy(() => import('@onboarding/pages/ArtistEmailVerification'));
const CompleteInformation = lazy(() => import('@onboarding/pages/CompleteInformation'));
const DisplayPicture = lazy(() => import('@onboarding/pages/DisplayPicture'));
const IdentityVerification = lazy(() => import('@onboarding/pages/IdentityVerification'));
const CompanyRegistration = lazy(() => import('@onboarding/pages/CompanyRegistration'));
const CompanyEmailVerification = lazy(() => import('@onboarding/pages/CompanyEmailVerification'));
const CompanyInformation = lazy(() => import('@onboarding/pages/CompanyInformation'));
const DirectorInformation = lazy(() => import('@onboarding/pages/DirectorInformation'));
const LabelLogo = lazy(() => import('@onboarding/pages/LabelLogo'));
const CompanyIdentityVerification = lazy(() => import('@onboarding/pages/CompanyIdentityVerification'));
const AdManagerRegistration = lazy(() => import('@onboarding/pages/AdManagerRegistration'));
const AdManagerEmailVerification = lazy(() => import('@onboarding/pages/AdManagerEmailVerification'));
const AdManagerInformation = lazy(() => import('@onboarding/pages/AdManagerInformation'));
const AdManagerDirectorInformation = lazy(() => import('@onboarding/pages/AdManagerDirectorInformation'));
const AdManagerCompanyLogo = lazy(() => import('@onboarding/pages/AdManagerCompanyLogo'));
const ContributorRegistration = lazy(() => import('@onboarding/pages/ContributorRegistration'));
const ContributorEmailVerification = lazy(() => import('@onboarding/pages/ContributorEmailVerification'));
const Upload = lazy(() => import('@upload/pages/Upload'));
const Review = lazy(() => import('@upload/pages/Review'));
const UploadSplitsPage = lazy(() => import('@upload/pages/UploadSplitsPage'));
const UploadRightsPage = lazy(() => import('@upload/pages/UploadRightsPage'));
const NewAlbumPage = lazy(() => import('@uploadMusic/pages/NewAlbumPage'));
const AlbumEditor = lazy(() => import('@uploadMusic/pages/AlbumEditor'));
const EarningsAndRoyalty = lazy(() => import('@earningRoyalty/pages/EarningsAndRoyalty'));
const Leaderboard = lazy(() => import('@leaderboard/pages/Leaderboard'));
const FansAndSubscribers = lazy(() => import('@fansSubscribers/pages/FansAndSubscribers'));
const FanProfilePage = lazy(() => import('@fansSubscribers/pages/FanProfilePage'));
const SalesReport = lazy(() => import('@salesReport/pages/SalesReport'));
const Payments = lazy(() => import('@payments/pages/Payments'));
const Settings = lazy(() => import('@settings/pages/Settings'));
const MusicVideos = lazy(() => import('@musicVideo/pages/MusicVideos'));
const SingleDetail = lazy(() => import('@musicVideo/pages/SingleDetail'));
const AlbumDetail = lazy(() => import('@musicVideo/pages/AlbumDetail'));
const VideoDetail = lazy(() => import('@musicVideo/pages/VideoDetail'));
const DisputePage = lazy(() => import('@/features/moderation/pages/DisputePage'));
const AdsDashboard = lazy(() => import('@ads/pages/AdsDashboard'));
const AdsEmptyState = lazy(() => import('@ads/pages/AdsEmptyState'));
const CreateCampaign = lazy(() => import('@ads/pages/CreateCampaign'));
const AdLibrary = lazy(() => import('@ads/pages/AdLibrary'));
const AdCampaignView = lazy(() => import('@ads/pages/AdCampaignView'));
const AdsSpending = lazy(() => import('@ads/pages/AdsSpending'));
const AdsWallet = lazy(() => import('@ads/pages/AdsWallet'));
const AdReport = lazy(() => import('@ads/pages/AdReport'));
// Record-label (RDC)
const RosterPage = lazy(() => import('@/features/record-label/pages/RosterPage'));
const ReleasesPage = lazy(() => import('@/features/record-label/pages/ReleasesPage'));
const SplitsPage = lazy(() => import('@/features/record-label/pages/SplitsPage'));
const SplitEditorPage = lazy(() => import('@/features/record-label/pages/SplitEditorPage'));
const PayoutsPage = lazy(() => import('@/features/record-label/pages/PayoutsPage'));
const WithdrawalRequestsPage = lazy(() => import('@/features/record-label/pages/WithdrawalRequestsPage'));
const CompanySettingsPage = lazy(() => import('@/features/record-label/pages/CompanySettingsPage'));
const InviteAcceptPage = lazy(() => import('@/features/record-label/pages/InviteAcceptPage'));
// Contributor (CR2)
const ContributorClaimPage = lazy(() => import('@/features/contributor/pages/ContributorClaimPage'));
const ContributorCompleteProfilePage = lazy(() => import('@/features/contributor/pages/ContributorCompleteProfilePage'));
const ContributorIdentityVerificationPage = lazy(() => import('@/features/contributor/pages/ContributorIdentityVerificationPage'));
const ContributorDashboardPage = lazy(() => import('@/features/contributor/pages/ContributorDashboardPage'));
const ContributorEarningsPage = lazy(() => import('@/features/contributor/pages/ContributorEarningsPage'));
const ContributorSplitsPage = lazy(() => import('@/features/contributor/pages/ContributorSplitsPage'));
const ContributorPayoutAccountsPage = lazy(() => import('@/features/contributor/pages/ContributorPayoutAccountsPage'));
const ContributorPayoutsPage = lazy(() => import('@/features/contributor/pages/ContributorPayoutsPage'));
const ContributorDisputesPage = lazy(() => import('@/features/contributor/pages/ContributorDisputesPage'));
const ContributorProfilePage = lazy(() => import('@/features/contributor/pages/ContributorProfilePage'));
// Self-service disputes (artist / label / ad manager)
const ArtistDisputesPage = lazy(() => import('@/features/disputes/pages/ArtistDisputesPage'));
const LabelDisputesPage = lazy(() => import('@/features/disputes/pages/LabelDisputesPage'));
const AdManagerDisputesPage = lazy(() => import('@/features/disputes/pages/AdManagerDisputesPage'));

/**
 * Fan / artist / label / ad-manager / contributor routes.
 *
 * Deliberately free of any admin route: the admin console is built as its own
 * bundle from `routes.admin.tsx` (see `admin.html`), and anything imported here
 * ships to every signed-in non-staff user.
 */
export const creatorPublicRoutes: RouteObject[] = [
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    { path: '/join', element: <JoinMuxify /> },
    { path: '/onboarding/artist/register', element: <ArtistRegistration /> },
    { path: '/onboarding/artist/invited/register', element: <InvitedArtistRegistration /> },
    { path: '/onboarding/artist/verify-email', element: <ArtistEmailVerification /> },
    { path: '/onboarding/artist/complete-information', element: <CompleteInformation /> },
    { path: '/onboarding/artist/display-picture', element: <DisplayPicture /> },
    { path: '/onboarding/artist/identity-verification', element: <IdentityVerification /> },
    { path: '/onboarding/company/register', element: <CompanyRegistration /> },
    { path: '/onboarding/company/verify-email', element: <CompanyEmailVerification /> },
    { path: '/onboarding/company/company-information', element: <CompanyInformation /> },
    { path: '/onboarding/company/director-information', element: <DirectorInformation /> },
    { path: '/onboarding/company/label-logo', element: <LabelLogo /> },
    { path: '/onboarding/company/identity-verification', element: <CompanyIdentityVerification /> },
    { path: '/onboarding/ad-manager/register', element: <AdManagerRegistration /> },
    { path: '/onboarding/ad-manager/verify-email', element: <AdManagerEmailVerification /> },
    { path: '/onboarding/ad-manager/complete-information', element: <AdManagerInformation /> },
    { path: '/onboarding/ad-manager/director-information', element: <AdManagerDirectorInformation /> },
    { path: '/onboarding/ad-manager/company-logo', element: <AdManagerCompanyLogo /> },
    { path: '/onboarding/contributor/register', element: <ContributorRegistration /> },
    { path: '/onboarding/contributor/verify-email', element: <ContributorEmailVerification /> },
    { path: '/label/invite/accept', element: <InviteAcceptPage /> },
    { path: '/contributor/claim', element: <ContributorClaimPage /> },
];

/** Children of the shared `/` ProtectedRoute subtree. */
export const creatorProtectedChildren: RouteObject[] = [
    { index: true, element: <DashboardRouter /> },
    { path: '/label/roster', element: <RosterPage /> },
    { path: '/label/releases', element: <ReleasesPage /> },
    { path: '/label/splits', element: <SplitsPage /> },
    { path: '/label/splits/:trackId', element: <SplitEditorPage /> },
    { path: '/label/payouts', element: <PayoutsPage /> },
    { path: '/label/withdrawal-requests', element: <WithdrawalRequestsPage /> },
    { path: '/label/settings', element: <CompanySettingsPage /> },
    { path: '/upload', element: <Upload /> },
    { path: '/upload/splits', element: <UploadSplitsPage /> },
    { path: '/upload/rights', element: <UploadRightsPage /> },
    { path: '/upload/review', element: <Review /> },
    { path: '/upload/album/new', element: <NewAlbumPage /> },
    { path: '/upload/album/:id', element: <AlbumEditor /> },
    { path: '/earning-royalty', element: <EarningsAndRoyalty /> },
    // Self-service disputes (static /disputes ranks above /disputes/:contentType/:contentId)
    { path: '/disputes', element: <ArtistDisputesPage /> },
    { path: '/label/disputes', element: <LabelDisputesPage /> },
    { path: '/ads/disputes', element: <AdManagerDisputesPage /> },
    { path: '/leaderboard', element: <Leaderboard /> },
    { path: '/fans-subscribers', element: <FansAndSubscribers /> },
    { path: '/fans/:fanId', element: <FanProfilePage /> },
    { path: '/sales-report', element: <SalesReport /> },
    { path: '/payments', element: <Payments /> },
    { path: '/settings', element: <Settings /> },
    // Contributor (CR2) — authed onboarding + self-service dashboard
    { path: '/contributor/complete-profile', element: <ContributorCompleteProfilePage /> },
    { path: '/contributor/identity-verification', element: <ContributorIdentityVerificationPage /> },
    { path: '/contributor/dashboard', element: <ContributorDashboardPage /> },
    { path: '/contributor/earnings', element: <ContributorEarningsPage /> },
    { path: '/contributor/splits', element: <ContributorSplitsPage /> },
    { path: '/contributor/payout-accounts', element: <ContributorPayoutAccountsPage /> },
    { path: '/contributor/payouts', element: <ContributorPayoutsPage /> },
    { path: '/contributor/disputes', element: <ContributorDisputesPage /> },
    { path: '/contributor/profile', element: <ContributorProfilePage /> },
    { path: '/music-videos', element: <MusicVideos /> },
    { path: '/music-videos/single/:id', element: <SingleDetail /> },
    { path: '/music-videos/album/:id', element: <AlbumDetail /> },
    { path: '/music-videos/video/:id', element: <VideoDetail /> },
    // Backend deep-links email and notification CTAs to this exact path.
    { path: '/disputes/:contentType/:contentId', element: <DisputePage /> },
    // Ad Manager routes
    { path: '/', element: <AdsDashboard /> },
    { path: '/ads/create-campaign', element: <CreateCampaign /> },
    { path: '/ads/library', element: <AdLibrary /> },
    { path: '/ads/view/:id', element: <AdCampaignView /> },
    { path: '/ads/spending', element: <AdsSpending /> },
    { path: '/ads/report', element: <AdReport /> },
    { path: '/ads/payments', element: <AdsWallet /> },
    { path: '/ads/wallet', element: <AdsWallet /> },
    { path: '/ads', element: <AdsEmptyState /> },
];

/**
 * Complete route table for the fan/artist build (`index.html` → `main.tsx`).
 *
 * The admin console is deliberately absent: it is a separate app built from
 * `routes.admin.tsx` and served on its own origin, so none of its routes, pages
 * or services are present in this bundle. `DashboardRouter` sends signed-in
 * staff to `VITE_ADMIN_URL`.
 */
export const creatorRoutes: RouteObject[] = [
    ...creatorPublicRoutes,
    {
        path: '/',
        element: <ProtectedRoute />,
        children: creatorProtectedChildren,
    },
];
