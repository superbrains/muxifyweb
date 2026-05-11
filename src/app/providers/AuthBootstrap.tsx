import React, { useEffect, useState } from 'react';
import { tokenStorage } from '@app/lib/axiosInstance';
import { useUserStore } from '@app/store/useUserStore';
import { userService } from '@shared/services/userService';
import { useUserManagementStore } from '@/features/auth/store/useUserManagementStore';
import type { UserRole } from '@shared/types/user';

/**
 * On app boot, if a JWT is present in storage, fetch the current user's
 * profile and hydrate the auth + onboarding stores. This is what keeps the
 * dashboard navbar showing the actual signed-in artist after a hard refresh
 * instead of falling back to seeded defaults.
 *
 * Renders children unconditionally — hydration runs in the background. If
 * the token is invalid the axios interceptor handles redirecting to /login.
 */
export const AuthBootstrap = ({ children }: { children: React.ReactNode }) => {
    const [done, setDone] = useState(false);

    useEffect(() => {
        const token = tokenStorage.getAccessToken();
        if (!token) {
            setDone(true);
            return;
        }

        let cancelled = false;
        userService
            .getCurrentUser()
            .then((profile) => {
                if (cancelled) return;
                useUserManagementStore.getState().hydrateFromProfile(profile);
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
                console.warn('AuthBootstrap profile load failed', error);
            })
            .finally(() => {
                if (!cancelled) setDone(true);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // We render children immediately so that the existing splash / route
    // resolution stays responsive; hydration completes in the background and
    // selectors re-render once the stores update.
    void done;
    return <>{children}</>;
};
