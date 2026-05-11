import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { recordLabelService } from '../services/recordLabelService';
import { labelKeys } from './useLabelSummary';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import type { SetSplitsRequest } from '../types';

export const useTrackSplits = (trackId: string | undefined) =>
    useQuery({
        queryKey: labelKeys.splits(trackId ?? ''),
        queryFn: () => recordLabelService.getSplits(trackId!),
        enabled: !!trackId,
        staleTime: 30_000,
    });

export const useSetSplits = (trackId: string) => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (req: SetSplitsRequest) => recordLabelService.setSplits(trackId, req),
        onSuccess: () => {
            toast.success('Splits saved', '');
            qc.invalidateQueries({ queryKey: labelKeys.splits(trackId) });
            qc.invalidateQueries({ queryKey: ['label', 'releases'] });
        },
        onError: (err) => {
            toast.error('Could not save splits', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};
