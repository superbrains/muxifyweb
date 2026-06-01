import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { spotlightService } from '../services/spotlightService';
import type { UpsertSpotlightRequest } from '../types/spotlight';

const keys = {
    list: ['admin', 'spotlight', 'list'] as const,
};

export function useSpotlights() {
    return useQuery({
        queryKey: keys.list,
        queryFn: ({ signal }) => spotlightService.list(signal),
        staleTime: 30_000,
    });
}

export function useCreateSpotlight() {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (payload: UpsertSpotlightRequest) => spotlightService.create(payload),
        onSuccess: () => {
            toast.success('Spotlight created', 'It will appear on the home feed while active and in-window.');
            qc.invalidateQueries({ queryKey: keys.list });
        },
        onError: (err) =>
            toast.error('Could not create spotlight', getApiErrorMessage(err, 'Please try again.')),
    });
}

export function useUpdateSpotlight() {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpsertSpotlightRequest }) =>
            spotlightService.update(id, payload),
        onSuccess: () => {
            toast.success('Spotlight updated');
            qc.invalidateQueries({ queryKey: keys.list });
        },
        onError: (err) =>
            toast.error('Could not update spotlight', getApiErrorMessage(err, 'Please try again.')),
    });
}

export function useSetSpotlightActive() {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) =>
            spotlightService.setActive(id, active),
        onSuccess: (_d, { active }) => {
            toast.success(active ? 'Spotlight activated' : 'Spotlight deactivated');
            qc.invalidateQueries({ queryKey: keys.list });
        },
        onError: (err) =>
            toast.error('Could not update spotlight', getApiErrorMessage(err, 'Please try again.')),
    });
}

export function useDeleteSpotlight() {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (id: string) => spotlightService.remove(id),
        onSuccess: () => {
            toast.success('Spotlight deleted');
            qc.invalidateQueries({ queryKey: keys.list });
        },
        onError: (err) =>
            toast.error('Could not delete spotlight', getApiErrorMessage(err, 'Please try again.')),
    });
}
