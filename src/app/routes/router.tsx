import { useRoutes, BrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import { appRoutes } from './routes';
import { Loader } from '@shared/components';

const AppRouter = () => {
    const routes = useRoutes(appRoutes);
    return <Suspense fallback={<Loader />}>{routes}</Suspense>;
};

export const RouterProvider = () => (
    <BrowserRouter>
        <AppRouter />
    </BrowserRouter>
);
