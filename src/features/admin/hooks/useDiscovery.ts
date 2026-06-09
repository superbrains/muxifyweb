import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { discoveryService, leaderboardService } from '../services/discoveryService';
import { adminKeys } from './adminKeys';
import type {
    CreateLeaderboardExclusionRequest,
    CurationOverrideQuery,
    FeaturedQuery,
    GiftLeaderboardQuery,
    HotReleasesQuery,
    LeaderboardExclusionQuery,
    LeaderboardPreviewQuery,
    NewReleasesQuery,
    TopChartsQuery,
    TrendingQuery,
    UpsertCurationOverrideRequest,
    UpsertFeaturedRequest,
    UpsertLeaderboardConfigRequest,
} from '../types/discovery';

/* --------------------------------- Queries -------------------------------- */

export const useTrending = (query: TrendingQuery) =>
    useQuery({
        queryKey: adminKeys.discovery.trending(query),
        queryFn: () => discoveryService.getTrending(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useTopCharts = (query: TopChartsQuery) =>
    useQuery({
        queryKey: adminKeys.discovery.topCharts(query),
        queryFn: () => discoveryService.getTopCharts(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useHotReleases = (query: HotReleasesQuery) =>
    useQuery({
        queryKey: adminKeys.discovery.hotReleases(query),
        queryFn: () => discoveryService.getHotReleases(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useNewReleases = (query: NewReleasesQuery) =>
    useQuery({
        queryKey: adminKeys.discovery.newReleases(query),
        queryFn: () => discoveryService.getNewReleases(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useMostGifted = (query: GiftLeaderboardQuery) =>
    useQuery({
        queryKey: adminKeys.discovery.mostGifted(query),
        queryFn: () => discoveryService.getMostGifted(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useTopGivers = (query: GiftLeaderboardQuery) =>
    useQuery({
        queryKey: adminKeys.discovery.topGivers(query),
        queryFn: () => discoveryService.getTopGivers(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useHomeFeed = () =>
    useQuery({
        queryKey: adminKeys.discovery.homeFeed,
        queryFn: () => discoveryService.getHomeFeed(),
        staleTime: 30_000,
    });

export const useOverrides = (query: CurationOverrideQuery) =>
    useQuery({
        queryKey: adminKeys.discovery.overrides(query),
        queryFn: () => discoveryService.getOverrides(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useFeatured = (query: FeaturedQuery) =>
    useQuery({
        queryKey: adminKeys.discovery.featured(query),
        queryFn: () => discoveryService.getFeatured(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useLeaderboardConfigs = () =>
    useQuery({
        queryKey: adminKeys.leaderboards.configs,
        queryFn: () => leaderboardService.getConfigs(),
        staleTime: 30_000,
    });

export const useLeaderboardExclusions = (query: LeaderboardExclusionQuery) =>
    useQuery({
        queryKey: adminKeys.leaderboards.exclusions(query),
        queryFn: () => leaderboardService.getExclusions(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useLeaderboardPreview = (leaderboardType: string | null, query: LeaderboardPreviewQuery) =>
    useQuery({
        queryKey: adminKeys.leaderboards.preview(leaderboardType ?? '', query),
        queryFn: () => leaderboardService.getPreview(leaderboardType as string, query),
        enabled: !!leaderboardType,
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

/* -------------------------------- Mutations ------------------------------- */

type QC = ReturnType<typeof useQueryClient>;

const invalidateDiscovery = (qc: QC) =>
    qc.invalidateQueries({ queryKey: adminKeys.discovery.root });

const invalidateLeaderboards = (qc: QC) =>
    qc.invalidateQueries({ queryKey: adminKeys.leaderboards.root });

/**
 * Shared mutation factory mirroring `useItemMutation` in useContent.ts — emits a
 * toast on success/error and runs `invalidate` so list + preview views refresh.
 */
const useDiscoveryMutation = <TArgs>(
    mutationFn: (args: TArgs) => Promise<unknown>,
    success: string,
    failure: string,
    invalidate: (qc: QC) => void = invalidateDiscovery,
) => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn,
        onSuccess: () => {
            toast.success(success);
            invalidate(qc);
        },
        onError: (err) => toast.error(failure, getApiErrorMessage(err, 'Please try again.')),
    });
};

/* ----------------------------- Override mutations ------------------------- */

export const useCreateOverride = () =>
    useDiscoveryMutation(
        (payload: UpsertCurationOverrideRequest) => discoveryService.createOverride(payload),
        'Curation override created.',
        'Could not create override',
    );

export const useUpdateOverride = () =>
    useDiscoveryMutation(
        ({ id, payload }: { id: string; payload: UpsertCurationOverrideRequest }) =>
            discoveryService.updateOverride(id, payload),
        'Curation override updated.',
        'Could not update override',
    );

export const useActivateOverride = () =>
    useDiscoveryMutation(
        (id: string) => discoveryService.activateOverride(id),
        'Override activated.',
        'Could not activate override',
    );

export const useDeactivateOverride = () =>
    useDiscoveryMutation(
        (id: string) => discoveryService.deactivateOverride(id),
        'Override deactivated.',
        'Could not deactivate override',
    );

export const useDeleteOverride = () =>
    useDiscoveryMutation(
        (id: string) => discoveryService.deleteOverride(id),
        'Override deleted.',
        'Could not delete override',
    );

/* ----------------------------- Featured mutations ------------------------- */

export const useCreateFeatured = () =>
    useDiscoveryMutation(
        (payload: UpsertFeaturedRequest) => discoveryService.createFeatured(payload),
        'Featured item created.',
        'Could not create featured item',
    );

export const useUpdateFeatured = () =>
    useDiscoveryMutation(
        ({ id, payload }: { id: string; payload: UpsertFeaturedRequest }) =>
            discoveryService.updateFeatured(id, payload),
        'Featured item updated.',
        'Could not update featured item',
    );

export const useSetFeaturedActive = () =>
    useDiscoveryMutation(
        ({ id, active }: { id: string; active: boolean }) =>
            active ? discoveryService.activateFeatured(id) : discoveryService.deactivateFeatured(id),
        'Featured item updated.',
        'Could not update featured item',
    );

export const useDeleteFeatured = () =>
    useDiscoveryMutation(
        (id: string) => discoveryService.deleteFeatured(id),
        'Featured item deleted.',
        'Could not delete featured item',
    );

/* --------------------------- Leaderboard mutations ------------------------ */

export const useUpdateLeaderboardConfig = () =>
    useDiscoveryMutation(
        ({ leaderboardType, payload }: { leaderboardType: string; payload: UpsertLeaderboardConfigRequest }) =>
            leaderboardService.updateConfig(leaderboardType, payload),
        'Leaderboard updated.',
        'Could not update leaderboard',
        invalidateLeaderboards,
    );

export const useSetLeaderboardEnabled = () =>
    useDiscoveryMutation(
        ({ leaderboardType, enabled }: { leaderboardType: string; enabled: boolean }) =>
            enabled
                ? leaderboardService.enableConfig(leaderboardType)
                : leaderboardService.disableConfig(leaderboardType),
        'Leaderboard updated.',
        'Could not update leaderboard',
        invalidateLeaderboards,
    );

export const useCreateExclusion = () =>
    useDiscoveryMutation(
        (payload: CreateLeaderboardExclusionRequest) => leaderboardService.createExclusion(payload),
        'Exclusion added.',
        'Could not add exclusion',
        invalidateLeaderboards,
    );

export const useDeleteExclusion = () =>
    useDiscoveryMutation(
        (id: string) => leaderboardService.deleteExclusion(id),
        'Exclusion removed.',
        'Could not remove exclusion',
        invalidateLeaderboards,
    );
