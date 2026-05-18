import type { NavigateFunction } from 'react-router-dom';
import { useUserStore } from '@app/store/useUserStore';
import { useUserManagementStore } from '@/features/auth/store/useUserManagementStore';
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore';
import { queryClient } from '@app/lib/queryClient';

/**
 * Clears every piece of per-user state so the next person to sign in on this
 * browser starts clean — previously only some stores were cleared, which let a
 * prior user's name/data leak into the next session:
 * - SignalR connection (real-time notifications)
 * - notification store
 * - onboarding store
 * - identity store + JWT tokens
 * - React Query cache (cached `/users/me` and other responses)
 *
 * The identity store and tokens are cleared synchronously; only the SignalR
 * teardown is async.
 */
export const clearSession = async (): Promise<void> => {
    useUserStore.getState().logout();
    useUserManagementStore.getState().clearAllUsers();
    useNotificationStore.getState().clearAllNotifications();
    queryClient.clear();
    await useNotificationStore.getState().disconnectSignalR();
};

/**
 * Full logout: clears all session state, then redirects to /login.
 */
export const logoutAndRedirect = async (navigate: NavigateFunction): Promise<void> => {
    await clearSession();
    navigate('/login', { replace: true });
};
