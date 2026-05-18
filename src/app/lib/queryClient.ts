import { QueryClient } from '@tanstack/react-query';

/**
 * Shared React Query client singleton.
 *
 * Exported as a module-level instance (rather than created inside the provider
 * component) so non-React code — notably the logout flow — can call
 * `queryClient.clear()` to evict the previous user's cached responses.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});
