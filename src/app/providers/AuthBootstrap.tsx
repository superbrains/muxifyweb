import React, { useEffect } from 'react';
import { tokenStorage } from '@app/lib/axiosInstance';
import { useUserStore } from '@app/store/useUserStore';
import { userService } from '@shared/services/userService';
import { useUserManagementStore } from '@/features/auth/store/useUserManagementStore';
import type { UserRole } from '@shared/types/user';

/**
 * On app boot, if a JWT is present in storage, fetch the current user's
 * profile and populate the auth store. This is the single thing that makes the
 * dashboard show the actual signed-in user after a hard refresh.
 *
 * Renders children unconditionally — hydration runs in the background and the
 * session `status` on `useUserStore` (loading → authenticated/unauthenticated)
 * is what `ProtectedRoute` gates on.
 */
export const AuthBootstrap = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        const token = tokenStorage.getAccessToken();
        if (!token) {
            useUserStore.getState().setStatus('unauthenticated');
            return;
        }

        let cancelled = false;
        userService
            .getCurrentUser()
            .then((profile) => {
                if (cancelled) return;
                // Onboarding store — used by the settings/profile screens.
                useUserManagementStore.getState().hydrateFromProfile(profile);
                // Identity store — the source of truth for the navbar/dashboard.
                useUserStore.getState().setUser({
                    id: profile.id,
                    email: profile.email,
                    name: profile.name,
                    role: profile.role as UserRole,
                    avatar: profile.avatar,
                    isVerified: profile.isVerified,
                    createdAt: profile.createdAt,
                    updatedAt: profile.updatedAt ?? profile.createdAt,
                });
            })
            .catch((error) => {
                if (cancelled) return;
                // Token is invalid/expired — drop it and treat as signed out so
                // ProtectedRoute redirects to /login instead of hanging.
                console.warn('AuthBootstrap profile load failed', error);
                tokenStorage.clearTokens();
                useUserStore.getState().setStatus('unauthenticated');
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return <>{children}</>;
};
