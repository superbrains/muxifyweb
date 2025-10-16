import { useRoutes, BrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import { appRoutes } from './routes';
import { LoadingScreen } from '@shared/components';

const AppRouter = () => {
    const routes = useRoutes(appRoutes);
    return <Suspense fallback={<LoadingScreen />}>{routes}</Suspense>;
};

export const RouterProvider = () => (
    <BrowserRouter>
        <AppRouter />
    </BrowserRouter>
);
