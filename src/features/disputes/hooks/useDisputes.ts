import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    disputeService,
    type DisputeListOptions,
    type RaiseDisputePayload,
} from '../services/disputeService';

/**
 * React-query hooks for the self-service dispute experience. Every key is scoped
 * by `base` (the endpoint root) so the artist/label/ad `/me/disputes` cache never
 * collides with the contributor `/contributor/disputes` cache.
 */
const keys = {
    list: (base: string, opts: DisputeListOptions) => ['disputes', base, 'list', opts] as const,
    detail: (base: string, id: string) => ['disputes', base, 'detail', id] as const,
};

export const useDisputes = (base: string, opts: DisputeListOptions = {}) =>
    useQuery({
        queryKey: keys.list(base, opts),
        queryFn: async () => (await disputeService.list(base, opts)).data,
    });

export const useDispute = (base: string, id: string | null) =>
    useQuery({
        queryKey: keys.detail(base, id ?? ''),
        queryFn: async () => (await disputeService.get(base, id!)).data,
        enabled: !!id,
    });

/**
 * Raises a dispute and, when evidence files are supplied, uploads them to the new
 * case in the same mutation (create → attach). Returns the created dispute.
 */
export const useRaiseDispute = (base: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            payload,
            files,
        }: {
            payload: RaiseDisputePayload;
            files?: File[];
        }) => {
            const created = (await disputeService.raise(base, payload)).data;
            if (files && files.length > 0) {
                const withFiles = (await disputeService.uploadAttachments(base, created.id, files)).data;
                return withFiles;
            }
            return created;
        },
        onSuccess: (created) => {
            qc.invalidateQueries({ queryKey: ['disputes', base] });
            if (created?.id) {
                qc.invalidateQueries({ queryKey: keys.detail(base, created.id) });
            }
        },
    });
};
