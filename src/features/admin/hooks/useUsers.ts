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

export const useUser = (userId: string | null) =>
    useQuery({
        queryKey: adminKeys.user(userId ?? ''),
        queryFn: () => adminService.getUser(userId as string),
        enabled: !!userId,
    });

const invalidateUserViews = (
    qc: ReturnType<typeof useQueryClient>,
    userId: string,
) => {
    qc.invalidateQueries({ queryKey: adminKeys.users() });
    qc.invalidateQueries({ queryKey: adminKeys.user(userId) });
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
