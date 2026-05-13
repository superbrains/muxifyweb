import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { recordLabelService } from '../services/recordLabelService';
import { labelKeys } from './useLabelSummary';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import type { PayoutsFilters, TriggerPayoutRequest } from '../types';

export const usePayouts = (filters: PayoutsFilters = {}) => {
    const { search: _search, ...serverFilters } = filters;
    return useQuery({
        queryKey: labelKeys.payouts(serverFilters),
        queryFn: () => recordLabelService.getPayouts(serverFilters),
        staleTime: 30_000,
    });
};

export const usePayout = (id: string | undefined) =>
    useQuery({
        queryKey: labelKeys.payout(id ?? '__none__'),
        queryFn: () => recordLabelService.getPayout(id!),
        enabled: Boolean(id),
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
        onSuccess: (data) => {
            const payoutCount = data.batches.reduce((sum, b) => sum + b.payoutCount, 0);
            const batchCount = data.batches.length;
            const description =
                batchCount === 0
                    ? 'No payouts were created.'
                    : batchCount === 1
                    ? `${payoutCount} ${payoutCount === 1 ? 'payout' : 'payouts'} initiated.`
                    : `${payoutCount} payouts initiated across ${batchCount} currencies.`;
            toast.success('Payout initiated', description);
            qc.invalidateQueries({ queryKey: ['label', 'payouts'] });
            qc.invalidateQueries({ queryKey: labelKeys.summary });
        },
        onError: (err) => {
            toast.error('Could not trigger payout', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};
