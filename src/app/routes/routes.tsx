import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Lazy imports
const Login = lazy(() => import('@auth/pages/Login'));
const Register = lazy(() => import('@auth/pages/Register'));
const ForgotPassword = lazy(() => import('@auth/pages/ForgotPassword'));
const JoinMuxify = lazy(() => import('@auth/pages/JoinMuxify'));
const ArtistRegistration = lazy(() => import('@onboarding/pages/ArtistRegistration'));
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
const Dashboard = lazy(() => import('@dashboard/pages/Dashboard'));
const Upload = lazy(() => import('@upload/pages/Upload'));
const Review = lazy(() => import('@upload/pages/Review'));
const EarningsAndRoyalty = lazy(() => import('@earningRoyalty/pages/EarningsAndRoyalty'));
const Leaderboard = lazy(() => import('@leaderboard/pages/Leaderboard'));
const FansAndSubscribers = lazy(() => import('@fansSubscribers/pages/FansAndSubscribers'));
const SalesReport = lazy(() => import('@salesReport/pages/SalesReport'));
const Payments = lazy(() => import('@payments/pages/Payments'));
const AddArtist = lazy(() => import('@addArtist/pages/AddArtist'));
const AddArtistRegistration = lazy(() => import('@addArtist/pages/AddArtistRegistration'));
const AddArtistDisplayPicture = lazy(() => import('@addArtist/pages/AddArtistDisplayPicture'));
const AddArtistIdentityVerification = lazy(() => import('@addArtist/pages/AddArtistIdentityVerification'));
const Settings = lazy(() => import('@settings/pages/Settings'));
const MusicVideos = lazy(() => import('@musicVideo/pages/MusicVideos'));
const AdsDashboard = lazy(() => import('@ads/pages/AdsDashboard'));
const AdsEmptyState = lazy(() => import('@ads/pages/AdsEmptyState'));
const CreateCampaign = lazy(() => import('@ads/pages/CreateCampaign'));

export const appRoutes: RouteObject[] = [
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    { path: '/join', element: <JoinMuxify /> },
    { path: '/onboarding/artist/register', element: <ArtistRegistration /> },
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
    {
        path: '/',
        element: <ProtectedRoute />,
        children: [
            { path: '/dashboard', element: <Dashboard /> },
            { path: '/upload', element: <Upload /> },
            { path: '/upload/review', element: <Review /> },
            { path: '/earning-royalty', element: <EarningsAndRoyalty /> },
            { path: '/leaderboard', element: <Leaderboard /> },
            { path: '/fans-subscribers', element: <FansAndSubscribers /> },
            { path: '/sales-report', element: <SalesReport /> },
            { path: '/payments', element: <Payments /> },
            { path: '/add-artist', element: <AddArtist /> },
            { path: '/add-artist/register', element: <AddArtistRegistration /> },
            { path: '/add-artist/display-picture', element: <AddArtistDisplayPicture /> },
            { path: '/add-artist/identity-verification', element: <AddArtistIdentityVerification /> },
            { path: '/settings', element: <Settings /> },
            { path: '/music-videos', element: <MusicVideos /> },
            // Ad Manager routes
            { path: '/ads/dashboard', element: <AdsDashboard /> },
            { path: '/ads/create-campaign', element: <CreateCampaign /> },
            { path: '/ads', element: <AdsEmptyState /> },
        ],
    },
];
