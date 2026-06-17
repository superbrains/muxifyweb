import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { adminService } from '../services/adminService';
import { adminKeys } from './adminKeys';
import type { UserQuery } from '../types';

export const useUsers = (query: UserQuery) =>
    useQuery({
        queryKey: adminKeys.users(query),
        queryFn: () => adminService.getUsers(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useUsersSummary = (role?: string) =>
    useQuery({
        queryKey: adminKeys.usersSummary(role),
        queryFn: () => adminService.getUsersSummary(role),
        staleTime: 30_000,
    });

export const useUser = (userId: string | null) =>
    useQuery({
        queryKey: adminKeys.user(userId ?? ''),
        queryFn: () => adminService.getUser(userId as string),
        enabled: !!userId,
    });

export const useUserProfile = (userId: string | null) =>
    useQuery({
        queryKey: adminKeys.userProfile(userId ?? ''),
        queryFn: () => adminService.getUserProfile(userId as string),
        enabled: !!userId,
        staleTime: 30_000,
    });

export const useUserAudit = (userId: string | null, page: number, pageSize = 20) =>
    useQuery({
        queryKey: adminKeys.userAudit(userId ?? '', { page, pageSize }),
        queryFn: () => adminService.getUserAudit(userId as string, page, pageSize),
        enabled: !!userId,
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

const invalidateUserViews = (
    qc: ReturnType<typeof useQueryClient>,
    userId: string,
) => {
    qc.invalidateQueries({ queryKey: adminKeys.users() });
    qc.invalidateQueries({ queryKey: adminKeys.usersSummaryRoot });
    qc.invalidateQueries({ queryKey: adminKeys.user(userId) });
    qc.invalidateQueries({ queryKey: adminKeys.userProfile(userId) });
    qc.invalidateQueries({ queryKey: adminKeys.userAudit(userId) });
    qc.invalidateQueries({ queryKey: adminKeys.overview });
};

export const useSuspendUser = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
            adminService.suspendUser(userId, reason),
        onSuccess: (_data, { userId }) => {
            toast.success('Account suspended', 'The user can no longer sign in.');
            invalidateUserViews(qc, userId);
        },
        onError: (err) => {
            toast.error(
                'Could not suspend account',
                getApiErrorMessage(err, 'Please try again.'),
            );
        },
    });
};

export const useActivateUser = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (userId: string) => adminService.activateUser(userId),
        onSuccess: (_data, userId) => {
            toast.success('Account reactivated', 'The user can sign in again.');
            invalidateUserViews(qc, userId);
        },
        onError: (err) => {
            toast.error(
                'Could not reactivate account',
                getApiErrorMessage(err, 'Please try again.'),
            );
        },
    });
};

export const useSoftDeleteUser = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
            adminService.softDeleteUser(userId, reason),
        onSuccess: (_data, { userId }) => {
            toast.success('Account soft-deleted', 'The account is hidden but can be restored.');
            invalidateUserViews(qc, userId);
        },
        onError: (err) => {
            toast.error(
                'Could not soft-delete account',
                getApiErrorMessage(err, 'Please try again.'),
            );
        },
    });
};

export const useRestoreUser = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (userId: string) => adminService.restoreUser(userId),
        onSuccess: (_data, userId) => {
            toast.success('Account restored', 'The account is active again.');
            invalidateUserViews(qc, userId);
        },
        onError: (err) => {
            toast.error(
                'Could not restore account',
                getApiErrorMessage(err, 'Please try again.'),
            );
        },
    });
};

export const usePermanentDeleteUser = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
            adminService.permanentDeleteUser(userId, reason),
        onSuccess: (_data, { userId }) => {
            toast.success('User permanently deleted', 'This cannot be undone.');
            invalidateUserViews(qc, userId);
        },
        onError: (err) => {
            toast.error(
                'Could not delete user',
                getApiErrorMessage(err, 'This user may have financial or content records — soft-delete instead.'),
            );
        },
    });
};

export const useChangeUserRole = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: string }) =>
            adminService.changeUserRole(userId, role),
        onSuccess: (_data, { userId }) => {
            toast.success('Role updated', 'The user has been reassigned to their new role.');
            invalidateUserViews(qc, userId);
        },
        onError: (err) => {
            toast.error(
                'Could not change role',
                getApiErrorMessage(err, 'Please try again.'),
            );
        },
    });
};
