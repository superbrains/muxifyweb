import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { securityService } from '../services/securityService';
import { adminKeys } from './adminKeys';
import type { SecurityActivityQuery } from '../types/security';

/* --------------------------------- Queries -------------------------------- */

export const useSecurityActivity = (query: SecurityActivityQuery) =>
    useQuery({
        queryKey: adminKeys.security.activity(query),
        queryFn: () => securityService.getActivity(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useSecurityUser = (userId: string | null) =>
    useQuery({
        queryKey: adminKeys.security.user(userId ?? ''),
        queryFn: () => securityService.getUser(userId as string),
        enabled: !!userId,
    });

export const useSecuritySessions = (userId: string | null) =>
    useQuery({
        queryKey: adminKeys.security.sessions(userId ?? ''),
        queryFn: () => securityService.getSessions(userId as string),
        enabled: !!userId,
    });

export const useSecurityDevices = (userId: string | null) =>
    useQuery({
        queryKey: adminKeys.security.devices(userId ?? ''),
        queryFn: () => securityService.getDevices(userId as string),
        enabled: !!userId,
    });

/* -------------------------------- Mutations ------------------------------- */

/** Invalidate every cached view for one user plus the activity list + audit. */
const invalidateSecurityViews = (
    qc: ReturnType<typeof useQueryClient>,
    userId: string,
) => {
    qc.invalidateQueries({ queryKey: adminKeys.security.activity({}) });
    qc.invalidateQueries({ queryKey: adminKeys.security.user(userId) });
    qc.invalidateQueries({ queryKey: adminKeys.security.sessions(userId) });
    qc.invalidateQueries({ queryKey: adminKeys.security.devices(userId) });
    qc.invalidateQueries({ queryKey: adminKeys.audit() });
};

export const useForceLogout = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ userId }: { userId: string }) =>
            securityService.forceLogout(userId),
        onSuccess: (_data, { userId }) => {
            toast.success('Signed out everywhere', 'All active sessions were revoked.');
            invalidateSecurityViews(qc, userId);
        },
        onError: (err) =>
            toast.error('Could not force logout', getApiErrorMessage(err, 'Please try again.')),
    });
};

export const useLockUser = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
            securityService.lockUser(userId, reason),
        onSuccess: (_data, { userId }) => {
            toast.success('Account locked', 'The user is blocked from signing in.');
            invalidateSecurityViews(qc, userId);
        },
        onError: (err) =>
            toast.error('Could not lock account', getApiErrorMessage(err, 'Please try again.')),
    });
};

export const useUnlockUser = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ userId }: { userId: string }) =>
            securityService.unlockUser(userId),
        onSuccess: (_data, { userId }) => {
            toast.success('Account unlocked', 'The user can sign in again.');
            invalidateSecurityViews(qc, userId);
        },
        onError: (err) =>
            toast.error('Could not unlock account', getApiErrorMessage(err, 'Please try again.')),
    });
};

export const useFlagPasswordReset = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ userId }: { userId: string }) =>
            securityService.flagPasswordReset(userId),
        onSuccess: (_data, { userId }) => {
            toast.success('Password reset required', 'The user must reset their password to continue.');
            invalidateSecurityViews(qc, userId);
        },
        onError: (err) =>
            toast.error(
                'Could not flag password reset',
                getApiErrorMessage(err, 'Please try again.'),
            ),
    });
};
