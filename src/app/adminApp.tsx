import { useRoutes, BrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import { adminAppRoutes } from './routes/routes.admin';
import { AppProviders } from './providers/AppProviders';
import { LoadingScreen } from '@shared/components';
import '@app/styles/globals.css';

/**
 * Root of the admin-only build served from `admin.getmuxify.com`.
 *
 * Mirrors `app/index.tsx` but mounts `adminAppRoutes` instead of the combined
 * table, so no creator route or page is reachable — or even present — in this
 * bundle. The two apps run on different origins and therefore do not share a
 * `localStorage` session: staff sign in here, separately from the fan/artist
 * app, which is the point of the split.
 */
const AdminRouter = () => {
    const routes = useRoutes(adminAppRoutes);
    return <Suspense fallback={<LoadingScreen />}>{routes}</Suspense>;
};

export const AdminApp = () => (
    <AppProviders>
        <BrowserRouter>
            <AdminRouter />
        </BrowserRouter>
    </AppProviders>
);
