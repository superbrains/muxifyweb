import { useRoutes, BrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import { creatorRoutes } from './routes.creator';
import { LoadingScreen } from '@shared/components';

const AppRouter = () => {
    const routes = useRoutes(creatorRoutes);
    return <Suspense fallback={<LoadingScreen />}>{routes}</Suspense>;
};

export const RouterProvider = () => (
    <BrowserRouter>
        <AppRouter />
    </BrowserRouter>
);
