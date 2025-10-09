import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Lazy imports
const Login = lazy(() => import('@auth/pages/Login'));
const Register = lazy(() => import('@auth/pages/Register'));
const ForgotPassword = lazy(() => import('@auth/pages/ForgotPassword'));
const JoinMuxify = lazy(() => import('@auth/pages/JoinMuxify'));
const ArtistOnboarding = lazy(() => import('@onboarding/pages/ArtistOnboarding'));
const ArtistRegistration = lazy(() => import('@onboarding/pages/ArtistRegistration'));
const ArtistEmailVerification = lazy(() => import('@onboarding/pages/ArtistEmailVerification'));
const CompleteInformation = lazy(() => import('@onboarding/pages/CompleteInformation'));
const DisplayPicture = lazy(() => import('@onboarding/pages/DisplayPicture'));
const IdentityVerification = lazy(() => import('@onboarding/pages/IdentityVerification'));
const CompanyOnboarding = lazy(() => import('@onboarding/pages/CompanyOnboarding'));
const AdManagerOnboarding = lazy(() => import('@onboarding/pages/AdManagerOnboarding'));
const Dashboard = lazy(() => import('@dashboard/pages/Dashboard'));
const UploadMusic = lazy(() => import('@uploadMusic/pages/UploadMusic'));
const UploadVideo = lazy(() => import('@uploadVideo/pages/UploadVideo'));
const MusicAndVideos = lazy(() => import('@musicVideos/pages/MusicAndVideos'));
const EarningsAndRoyalty = lazy(() => import('@earningRoyalty/pages/EarningsAndRoyalty'));
const Leaderboard = lazy(() => import('@leaderboard/pages/Leaderboard'));
const FansAndSubscribers = lazy(() => import('@fansSubscribers/pages/FansAndSubscribers'));
const SalesReport = lazy(() => import('@salesReport/pages/SalesReport'));
const Payments = lazy(() => import('@payments/pages/Payments'));
const AddArtist = lazy(() => import('@addArtist/pages/AddArtist'));
const Settings = lazy(() => import('@settings/pages/Settings'));

export const appRoutes: RouteObject[] = [
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    { path: '/join', element: <JoinMuxify /> },
    { path: '/onboarding/artist', element: <ArtistOnboarding /> },
    { path: '/onboarding/artist/register', element: <ArtistRegistration /> },
    { path: '/onboarding/artist/verify-email', element: <ArtistEmailVerification /> },
    { path: '/onboarding/artist/complete-information', element: <CompleteInformation /> },
    { path: '/onboarding/artist/display-picture', element: <DisplayPicture /> },
    { path: '/onboarding/artist/identity-verification', element: <IdentityVerification /> },
    { path: '/onboarding/company', element: <CompanyOnboarding /> },
    { path: '/onboarding/ad-manager', element: <AdManagerOnboarding /> },
    {
        path: '/',
        element: <ProtectedRoute />,
        children: [
            { path: '/dashboard', element: <Dashboard /> },
            { path: '/upload-music', element: <UploadMusic /> },
            { path: '/upload-video', element: <UploadVideo /> },
            { path: '/music-videos', element: <MusicAndVideos /> },
            { path: '/earning-royalty', element: <EarningsAndRoyalty /> },
            { path: '/leaderboard', element: <Leaderboard /> },
            { path: '/fans-subscribers', element: <FansAndSubscribers /> },
            { path: '/sales-report', element: <SalesReport /> },
            { path: '/payments', element: <Payments /> },
            { path: '/add-artist', element: <AddArtist /> },
            { path: '/settings', element: <Settings /> },
        ],
    },
];
