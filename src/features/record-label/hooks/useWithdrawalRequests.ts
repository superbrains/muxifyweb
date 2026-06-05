import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { recordLabelService } from '../services/recordLabelService';
import { labelKeys } from './useLabelSummary';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';

interface WithdrawalRequestFilters {
    status?: string;
    page?: number;
    pageSize?: number;
}

/** Roster-artist withdrawal requests awaiting this label's approval. */
export const useWithdrawalRequests = (filters: WithdrawalRequestFilters = {}) =>
    useQuery({
        queryKey: labelKeys.withdrawalRequests(filters),
        queryFn: () => recordLabelService.getWithdrawalRequests(filters),
        staleTime: 15_000,
    });

/** The label's own split-aware withdrawable balance. */
export const useOwnPayoutBalance = (enabled = true) =>
    useQuery({
        queryKey: labelKeys.ownBalance,
        queryFn: () => recordLabelService.getOwnPayoutBalance(),
        staleTime: 15_000,
        enabled,
    });

const invalidate = (qc: ReturnType<typeof useQueryClient>) => {
    qc.invalidateQueries({ queryKey: ['label', 'withdrawal-requests'] });
    qc.invalidateQueries({ queryKey: labelKeys.summary });
};

export const useApproveWithdrawalRequest = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ id, note }: { id: string; note?: string }) =>
            recordLabelService.approveWithdrawalRequest(id, note),
        onSuccess: () => {
            toast.success('Request approved', 'Sent to Muxify for final approval.');
            invalidate(qc);
        },
        onError: (err) => {
            toast.error('Could not approve request', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};

export const useRejectWithdrawalRequest = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            recordLabelService.rejectWithdrawalRequest(id, reason),
        onSuccess: () => {
            toast.success('Request rejected', 'The artist has been notified with your reason.');
            invalidate(qc);
        },
        onError: (err) => {
            toast.error('Could not reject request', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};

export const useRequestOwnPayout = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (amountMinor: number) => recordLabelService.requestOwnPayout(amountMinor),
        onSuccess: (data) => {
            toast.success('Payout requested', data.message ?? 'Your request is awaiting admin approval.');
            qc.invalidateQueries({ queryKey: labelKeys.ownBalance });
            qc.invalidateQueries({ queryKey: labelKeys.summary });
        },
        onError: (err) => {
            toast.error('Could not request payout', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};
