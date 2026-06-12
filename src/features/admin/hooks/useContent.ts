import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { contentService } from '../services/contentService';
import { adminKeys } from './adminKeys';
import type {
    ContentItemQuery,
    ContentKind,
    CreateLyricsPayload,
    DuplicateMatchQuery,
    LyricsQuery,
    ProcessingQuery,
    UploadSessionQuery,
} from '../types/content';

export type { ContentItemQuery, ContentKind };

/* --------------------------------- Queries -------------------------------- */

export const useContentItems = (query: ContentItemQuery) =>
    useQuery({
        queryKey: adminKeys.content.items(query),
        queryFn: () => contentService.getItems(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useContentItem = (kind: ContentKind | null, id: string | null) =>
    useQuery({
        queryKey: adminKeys.content.item(kind ?? '', id ?? ''),
        queryFn: () => contentService.getItem(kind as ContentKind, id as string),
        enabled: !!kind && !!id,
    });

export const useUploadSessions = (query: UploadSessionQuery) =>
    useQuery({
        queryKey: adminKeys.content.uploadSessions(query),
        queryFn: () => contentService.getUploadSessions(query),
        placeholderData: keepPreviousData,
        staleTime: 15_000,
    });

export const useProcessingItems = (query: ProcessingQuery) =>
    useQuery({
        queryKey: adminKeys.content.processing(query),
        queryFn: () => contentService.getProcessing(query),
        placeholderData: keepPreviousData,
        staleTime: 15_000,
    });

export const useDuplicateMatches = (query: DuplicateMatchQuery) =>
    useQuery({
        queryKey: adminKeys.content.matches(query),
        queryFn: () => contentService.getMatches(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useMatch = (id: string | null) =>
    useQuery({
        queryKey: adminKeys.content.match(id ?? ''),
        queryFn: () => contentService.getMatch(id as string),
        enabled: !!id,
    });

export const useLyrics = (query: LyricsQuery) =>
    useQuery({
        queryKey: adminKeys.content.lyrics(query),
        queryFn: () => contentService.getLyrics(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useLyricsById = (id: string | null) =>
    useQuery({
        queryKey: adminKeys.content.lyricsById(id ?? ''),
        queryFn: () => contentService.getLyricsById(id as string),
        enabled: !!id,
    });

export const useLyricsStats = () =>
    useQuery({
        queryKey: adminKeys.content.lyricsStats,
        queryFn: () => contentService.getLyricsStats(),
        staleTime: 60_000,
    });

export const useContentStats = (query?: {
    kind?: string; ownerRole?: string; releaseType?: string; videoType?: string;
}) =>
    useQuery({
        queryKey: adminKeys.content.stats(query),
        queryFn: () => contentService.getStats(query),
        staleTime: 60_000,
    });

export const useContentItemAudit = (kind: ContentKind | null, id: string | null) =>
    useQuery({
        queryKey: adminKeys.content.itemAudit(kind ?? '', id ?? ''),
        queryFn: () => contentService.getItemAudit(kind as ContentKind, id as string),
        enabled: !!kind && !!id,
    });

export const useUploadStats = () =>
    useQuery({
        queryKey: adminKeys.content.uploadStats,
        queryFn: () => contentService.getUploadStats(),
        staleTime: 30_000,
    });

export const useUploadSession = (id: string | null) =>
    useQuery({
        queryKey: adminKeys.content.uploadSession(id ?? ''),
        queryFn: () => contentService.getUploadSession(id as string),
        enabled: !!id,
    });

export const useDuplicateStats = () =>
    useQuery({
        queryKey: adminKeys.content.duplicateStats,
        queryFn: () => contentService.getDuplicateStats(),
        staleTime: 60_000,
    });

export const useModerationStats = (ownerRole?: string) =>
    useQuery({
        queryKey: adminKeys.content.moderationStats(ownerRole),
        queryFn: () => contentService.getModerationStats(ownerRole),
        staleTime: 60_000,
    });

/* ------------------------------- Item mutations --------------------------- */

const invalidateItems = (qc: ReturnType<typeof useQueryClient>) =>
    qc.invalidateQueries({ queryKey: adminKeys.content.root });

interface ItemMutationArgs {
    kind: ContentKind;
    id: string;
    reason?: string;
}

/**
 * Shared factory for the per-item state-change mutations (publish/unpublish/
 * restore/remove/restrict/unrestrict). Each emits a toast and invalidates the
 * whole content namespace so list + detail views refresh.
 */
const useItemMutation = (
    mutationFn: (args: ItemMutationArgs) => Promise<unknown>,
    success: string,
    failure: string,
) => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn,
        onSuccess: () => {
            toast.success(success);
            invalidateItems(qc);
        },
        onError: (err) => toast.error(failure, getApiErrorMessage(err, 'Please try again.')),
    });
};

export const usePublishItem = () =>
    useItemMutation(
        ({ kind, id }) => contentService.publish(kind, id),
        'Content published.',
        'Could not publish',
    );

export const useUnpublishItem = () =>
    useItemMutation(
        ({ kind, id }) => contentService.unpublish(kind, id),
        'Content unpublished.',
        'Could not unpublish',
    );

export const useRestoreItem = () =>
    useItemMutation(
        ({ kind, id }) => contentService.restore(kind, id),
        'Content restored.',
        'Could not restore',
    );

export const useRemoveItem = () =>
    useItemMutation(
        ({ kind, id, reason }) => contentService.remove(kind, id, reason ?? ''),
        'Content removed.',
        'Could not remove',
    );

export const useRestrictItem = () =>
    useItemMutation(
        ({ kind, id, reason }) => contentService.restrict(kind, id, reason ?? ''),
        'Content restricted.',
        'Could not restrict',
    );

export const useUnrestrictItem = () =>
    useItemMutation(
        ({ kind, id, reason }) => contentService.unrestrict(kind, id, reason ?? ''),
        'Restriction lifted.',
        'Could not lift restriction',
    );

export const useRescheduleTrack = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ id, releaseDate }: { id: string; releaseDate: string }) =>
            contentService.reschedule(id, releaseDate),
        onSuccess: () => {
            toast.success('Release rescheduled.');
            invalidateItems(qc);
        },
        onError: (err) =>
            toast.error('Could not reschedule', getApiErrorMessage(err, 'Please try again.')),
    });
};

/* ------------------------------ Upload mutations -------------------------- */

export const useRetryProcessing = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ kind, id }: { kind: string; id: string }) =>
            contentService.retryProcessing(kind, id),
        onSuccess: () => {
            toast.success('Retry queued', 'Processing has been re-triggered.');
            invalidateItems(qc);
        },
        onError: (err) =>
            toast.error('Could not retry', getApiErrorMessage(err, 'Please try again.')),
    });
};

/* ---------------------------- Duplicate mutations ------------------------- */

export const useConfirmMatch = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            contentService.confirmMatch(id, reason),
        onSuccess: () => {
            toast.success('Match confirmed', 'The flagged content has been actioned.');
            invalidateItems(qc);
        },
        onError: (err) =>
            toast.error('Could not confirm match', getApiErrorMessage(err, 'Please try again.')),
    });
};

export const useDismissMatch = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            contentService.dismissMatch(id, reason),
        onSuccess: () => {
            toast.success('Match dismissed', 'No further action will be taken.');
            invalidateItems(qc);
        },
        onError: (err) =>
            toast.error('Could not dismiss match', getApiErrorMessage(err, 'Please try again.')),
    });
};

/* ------------------------------ Lyrics mutations -------------------------- */

export const useCreateLyrics = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (payload: CreateLyricsPayload) => contentService.createLyrics(payload),
        onSuccess: () => {
            toast.success('Lyrics added', 'The lyrics have been submitted.');
            invalidateItems(qc);
        },
        onError: (err) =>
            toast.error('Could not add lyrics', getApiErrorMessage(err, 'Please try again.')),
    });
};

export const useApproveLyrics = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (id: string) => contentService.approveLyrics(id),
        onSuccess: () => {
            toast.success('Lyrics approved.');
            invalidateItems(qc);
        },
        onError: (err) =>
            toast.error('Could not approve lyrics', getApiErrorMessage(err, 'Please try again.')),
    });
};

export const useRejectLyrics = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            contentService.rejectLyrics(id, reason),
        onSuccess: () => {
            toast.success('Lyrics rejected.');
            invalidateItems(qc);
        },
        onError: (err) =>
            toast.error('Could not reject lyrics', getApiErrorMessage(err, 'Please try again.')),
    });
};
