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
import type { VerificationQuery } from '../types';

export const useVerifications = (query: VerificationQuery) =>
    useQuery({
        queryKey: adminKeys.verifications(query),
        queryFn: () => adminService.getVerifications(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useVerification = (id: string | null) =>
    useQuery({
        queryKey: adminKeys.verification(id ?? ''),
        queryFn: () => adminService.getVerification(id as string),
        enabled: !!id,
    });

const invalidateVerificationViews = (
    qc: ReturnType<typeof useQueryClient>,
    id: string,
) => {
    qc.invalidateQueries({ queryKey: adminKeys.verifications() });
    qc.invalidateQueries({ queryKey: adminKeys.verification(id) });
    qc.invalidateQueries({ queryKey: adminKeys.overview });
};

export const useApproveVerification = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (id: string) => adminService.approveVerification(id),
        onSuccess: (_data, id) => {
            toast.success('Verification approved', 'The applicant is now verified.');
            invalidateVerificationViews(qc, id);
        },
        onError: (err) => {
            toast.error(
                'Could not approve verification',
                getApiErrorMessage(err, 'Please try again.'),
            );
        },
    });
};

export const useRejectVerification = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            adminService.rejectVerification(id, reason),
        onSuccess: (_data, { id }) => {
            toast.success(
                'Verification rejected',
                'The applicant has been notified with your reason.',
            );
            invalidateVerificationViews(qc, id);
        },
        onError: (err) => {
            toast.error(
                'Could not reject verification',
                getApiErrorMessage(err, 'Please try again.'),
            );
        },
    });
};
