import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { recordLabelService } from '../services/recordLabelService';
import { labelKeys } from './useLabelSummary';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import type { TriggerPayoutRequest } from '../types';

interface PayoutsFilters {
    status?: string;
    from?: string;
    to?: string;
}

export const usePayouts = (filters: PayoutsFilters = {}) =>
    useQuery({
        queryKey: labelKeys.payouts(filters),
        queryFn: () => recordLabelService.getPayouts(filters),
        staleTime: 30_000,
    });

export const useTriggerPayout = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({
            req,
            idempotencyKey,
        }: {
            req: TriggerPayoutRequest;
            idempotencyKey: string;
        }) => recordLabelService.triggerPayout(req, idempotencyKey),
        onSuccess: () => {
            toast.success('Payout initiated', 'Your roster will receive their funds shortly.');
            qc.invalidateQueries({ queryKey: ['label', 'payouts'] });
            qc.invalidateQueries({ queryKey: labelKeys.summary });
        },
        onError: (err) => {
            toast.error('Could not trigger payout', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};
