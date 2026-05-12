import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardRouter from './DashboardRouter';

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
const Upload = lazy(() => import('@upload/pages/Upload'));
const Review = lazy(() => import('@upload/pages/Review'));
const NewAlbumPage = lazy(() => import('@uploadMusic/pages/NewAlbumPage'));
const AlbumEditor = lazy(() => import('@uploadMusic/pages/AlbumEditor'));
const EarningsAndRoyalty = lazy(() => import('@earningRoyalty/pages/EarningsAndRoyalty'));
const Leaderboard = lazy(() => import('@leaderboard/pages/Leaderboard'));
const FansAndSubscribers = lazy(() => import('@fansSubscribers/pages/FansAndSubscribers'));
const SalesReport = lazy(() => import('@salesReport/pages/SalesReport'));
const Payments = lazy(() => import('@payments/pages/Payments'));
const Settings = lazy(() => import('@settings/pages/Settings'));
const MusicVideos = lazy(() => import('@musicVideo/pages/MusicVideos'));
const SingleDetail = lazy(() => import('@musicVideo/pages/SingleDetail'));
const AlbumDetail = lazy(() => import('@musicVideo/pages/AlbumDetail'));
const VideoDetail = lazy(() => import('@musicVideo/pages/VideoDetail'));
const AdsDashboard = lazy(() => import('@ads/pages/AdsDashboard'));
const AdsEmptyState = lazy(() => import('@ads/pages/AdsEmptyState'));
const CreateCampaign = lazy(() => import('@ads/pages/CreateCampaign'));
const AdLibrary = lazy(() => import('@ads/pages/AdLibrary'));
const AdCampaignView = lazy(() => import('@ads/pages/AdCampaignView'));
const AdsSpending = lazy(() => import('@ads/pages/AdsSpending'));
const AdsWallet = lazy(() => import('@ads/pages/AdsWallet'));
// Record-label (RDC)
const RosterPage = lazy(() => import('@/features/record-label/pages/RosterPage'));
const ReleasesPage = lazy(() => import('@/features/record-label/pages/ReleasesPage'));
const SplitsPage = lazy(() => import('@/features/record-label/pages/SplitsPage'));
const SplitEditorPage = lazy(() => import('@/features/record-label/pages/SplitEditorPage'));
const PayoutsPage = lazy(() => import('@/features/record-label/pages/PayoutsPage'));
const AnalyticsPage = lazy(() => import('@/features/record-label/pages/AnalyticsPage'));
const CompanySettingsPage = lazy(() => import('@/features/record-label/pages/CompanySettingsPage'));
const InviteAcceptPage = lazy(() => import('@/features/record-label/pages/InviteAcceptPage'));

export const appRoutes: RouteObject[] = [
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
    { path: '/label/invite/accept', element: <InviteAcceptPage /> },
    {
        path: '/',
        element: <ProtectedRoute />,
        children: [
            { index: true, element: <DashboardRouter /> },
            { path: '/label/roster', element: <RosterPage /> },
            { path: '/label/releases', element: <ReleasesPage /> },
            { path: '/label/splits', element: <SplitsPage /> },
            { path: '/label/splits/:trackId', element: <SplitEditorPage /> },
            { path: '/label/payouts', element: <PayoutsPage /> },
            { path: '/label/analytics', element: <AnalyticsPage /> },
            { path: '/label/settings', element: <CompanySettingsPage /> },
            { path: '/upload', element: <Upload /> },
            { path: '/upload/review', element: <Review /> },
            { path: '/upload/album/new', element: <NewAlbumPage /> },
            { path: '/upload/album/:id', element: <AlbumEditor /> },
            { path: '/earning-royalty', element: <EarningsAndRoyalty /> },
            { path: '/leaderboard', element: <Leaderboard /> },
            { path: '/fans-subscribers', element: <FansAndSubscribers /> },
            { path: '/sales-report', element: <SalesReport /> },
            { path: '/payments', element: <Payments /> },
            { path: '/settings', element: <Settings /> },
            { path: '/music-videos', element: <MusicVideos /> },
            { path: '/music-videos/single/:id', element: <SingleDetail /> },
            { path: '/music-videos/album/:id', element: <AlbumDetail /> },
            { path: '/music-videos/video/:id', element: <VideoDetail /> },
            // Ad Manager routes
            { path: '/', element: <AdsDashboard /> },
            { path: '/ads/create-campaign', element: <CreateCampaign /> },
            { path: '/ads/library', element: <AdLibrary /> },
            { path: '/ads/view/:id', element: <AdCampaignView /> },
            { path: '/ads/spending', element: <AdsSpending /> },
            { path: '/ads/wallet', element: <AdsWallet /> },
            { path: '/ads', element: <AdsEmptyState /> },
        ],
    },
];
