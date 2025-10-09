import { RouterProvider } from './routes/router';
import { AppProviders } from './providers/AppProviders';
import '@app/styles/globals.css';

export const App = () => (
    <AppProviders>
        <RouterProvider />
    </AppProviders>
);
