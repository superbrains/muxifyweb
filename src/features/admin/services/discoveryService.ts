import { api } from '@shared/services/api';
import type {
    AdminCurationOverrideDto,
    AdminFeaturedDto,
    AdminHomeFeedDto,
    AdminLeaderboardConfigDto,
    AdminLeaderboardExclusionDto,
    AdminMostGiftedDto,
    AdminTopGiversDto,
    AdminTrendingPageDto,
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

/**
 * Typed clients for the admin Discovery + Leaderboards suite. Every method
 * targets `/api/v1/admin/{discovery|leaderboards}/*`. List/ranked endpoints are
 * read-only; overrides/featured/configs/exclusions are the mutating surfaces.
 * Timestamps are ISO-8601. Mirrors `contentService` / `spotlightService` style.
 */
const DISCOVERY = '/admin/discovery';
const LEADERBOARDS = '/admin/leaderboards';

/**
 * Some "most-gifted" / "top-givers" endpoints return a bare array, others a
 * `{ items }` wrapper. Normalise both to an array.
 */
const unwrapList = <T>(data: T[] | { items?: T[] } | null | undefined): T[] => {
    if (Array.isArray(data)) return data;
    return data?.items ?? [];
};

export const discoveryService = {
    /* -------------------------------- Trending ------------------------------- */
    getTrending: async (query: TrendingQuery): Promise<AdminTrendingPageDto> => {
        const { data } = await api.get<AdminTrendingPageDto>(`${DISCOVERY}/trending`, {
            params: query,
        });
        return data;
    },
    getTopCharts: async (query: TopChartsQuery): Promise<AdminTrendingPageDto> => {
        const { data } = await api.get<AdminTrendingPageDto>(`${DISCOVERY}/top-charts`, {
            params: query,
        });
        return data;
    },
    getHotReleases: async (query: HotReleasesQuery): Promise<AdminTrendingPageDto> => {
        const { data } = await api.get<AdminTrendingPageDto>(`${DISCOVERY}/hot-releases`, {
            params: query,
        });
        return data;
    },
    getNewReleases: async (query: NewReleasesQuery): Promise<AdminTrendingPageDto> => {
        const { data } = await api.get<AdminTrendingPageDto>(`${DISCOVERY}/new-releases`, {
            params: query,
        });
        return data;
    },

    /* ------------------------------- Gifting ranks --------------------------- */
    getMostGifted: async (query: GiftLeaderboardQuery): Promise<AdminMostGiftedDto[]> => {
        const { data } = await api.get<AdminMostGiftedDto[] | { items?: AdminMostGiftedDto[] }>(
            `${DISCOVERY}/most-gifted`,
            { params: query },
        );
        return unwrapList(data);
    },
    getTopGivers: async (query: GiftLeaderboardQuery): Promise<AdminTopGiversDto[]> => {
        const { data } = await api.get<AdminTopGiversDto[] | { items?: AdminTopGiversDto[] }>(
            `${DISCOVERY}/top-givers`,
            { params: query },
        );
        return unwrapList(data);
    },

    /* -------------------------------- Home feed ------------------------------ */
    getHomeFeed: async (): Promise<AdminHomeFeedDto> => {
        const { data } = await api.get<AdminHomeFeedDto>(`${DISCOVERY}/home-feed`);
        return data;
    },

    /* ------------------------------- Overrides ------------------------------- */
    getOverrides: async (query: CurationOverrideQuery): Promise<AdminCurationOverrideDto[]> => {
        const { data } = await api.get<AdminCurationOverrideDto[]>(`${DISCOVERY}/overrides`, {
            params: query,
        });
        return data;
    },
    createOverride: async (
        payload: UpsertCurationOverrideRequest,
    ): Promise<AdminCurationOverrideDto> => {
        const { data } = await api.post<AdminCurationOverrideDto>(`${DISCOVERY}/overrides`, payload);
        return data;
    },
    updateOverride: async (
        id: string,
        payload: UpsertCurationOverrideRequest,
    ): Promise<AdminCurationOverrideDto> => {
        const { data } = await api.put<AdminCurationOverrideDto>(
            `${DISCOVERY}/overrides/${id}`,
            payload,
        );
        return data;
    },
    activateOverride: async (id: string): Promise<void> => {
        await api.post(`${DISCOVERY}/overrides/${id}/activate`);
    },
    deactivateOverride: async (id: string): Promise<void> => {
        await api.post(`${DISCOVERY}/overrides/${id}/deactivate`);
    },
    deleteOverride: async (id: string): Promise<void> => {
        await api.delete(`${DISCOVERY}/overrides/${id}`);
    },

    /* -------------------------------- Featured ------------------------------- */
    getFeatured: async (query: FeaturedQuery): Promise<AdminFeaturedDto[]> => {
        const { data } = await api.get<AdminFeaturedDto[]>(`${DISCOVERY}/featured`, {
            params: query,
        });
        return data;
    },
    createFeatured: async (payload: UpsertFeaturedRequest): Promise<AdminFeaturedDto> => {
        const { data } = await api.post<AdminFeaturedDto>(`${DISCOVERY}/featured`, payload);
        return data;
    },
    updateFeatured: async (id: string, payload: UpsertFeaturedRequest): Promise<AdminFeaturedDto> => {
        const { data } = await api.put<AdminFeaturedDto>(`${DISCOVERY}/featured/${id}`, payload);
        return data;
    },
    activateFeatured: async (id: string): Promise<void> => {
        await api.post(`${DISCOVERY}/featured/${id}/activate`);
    },
    deactivateFeatured: async (id: string): Promise<void> => {
        await api.post(`${DISCOVERY}/featured/${id}/deactivate`);
    },
    deleteFeatured: async (id: string): Promise<void> => {
        await api.delete(`${DISCOVERY}/featured/${id}`);
    },
    /** Uploads a featured image and returns the media-proxy URL to store on `imageUrl`. */
    uploadFeaturedImage: async (file: File): Promise<{ imageUrl: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post<{ imageUrl: string }>(`${DISCOVERY}/featured/image`, formData);
        return data;
    },
};

export const leaderboardService = {
    /* --------------------------------- Configs ------------------------------- */
    getConfigs: async (): Promise<AdminLeaderboardConfigDto[]> => {
        const { data } = await api.get<AdminLeaderboardConfigDto[]>(`${LEADERBOARDS}/configs`);
        return data;
    },
    updateConfig: async (
        leaderboardType: string,
        payload: UpsertLeaderboardConfigRequest,
    ): Promise<AdminLeaderboardConfigDto> => {
        const { data } = await api.put<AdminLeaderboardConfigDto>(
            `${LEADERBOARDS}/configs/${leaderboardType}`,
            payload,
        );
        return data;
    },
    enableConfig: async (leaderboardType: string): Promise<void> => {
        await api.post(`${LEADERBOARDS}/configs/${leaderboardType}/enable`);
    },
    disableConfig: async (leaderboardType: string): Promise<void> => {
        await api.post(`${LEADERBOARDS}/configs/${leaderboardType}/disable`);
    },

    /* ------------------------------- Exclusions ------------------------------ */
    getExclusions: async (
        query: LeaderboardExclusionQuery,
    ): Promise<AdminLeaderboardExclusionDto[]> => {
        const { data } = await api.get<AdminLeaderboardExclusionDto[]>(`${LEADERBOARDS}/exclusions`, {
            params: query,
        });
        return data;
    },
    createExclusion: async (
        payload: CreateLeaderboardExclusionRequest,
    ): Promise<AdminLeaderboardExclusionDto> => {
        const { data } = await api.post<AdminLeaderboardExclusionDto>(
            `${LEADERBOARDS}/exclusions`,
            payload,
        );
        return data;
    },
    deleteExclusion: async (id: string): Promise<void> => {
        await api.delete(`${LEADERBOARDS}/exclusions/${id}`);
    },

    /* --------------------------------- Preview ------------------------------- */
    getPreview: async (
        leaderboardType: string,
        query: LeaderboardPreviewQuery,
    ): Promise<(AdminTopGiversDto | AdminMostGiftedDto)[]> => {
        // Backend returns LeaderboardPreviewDto { leaderboardType, period, entries: [...] }.
        const { data } = await api.get<
            | (AdminTopGiversDto | AdminMostGiftedDto)[]
            | { entries?: (AdminTopGiversDto | AdminMostGiftedDto)[]; items?: (AdminTopGiversDto | AdminMostGiftedDto)[] }
        >(`${LEADERBOARDS}/${leaderboardType}/preview`, { params: query });
        if (Array.isArray(data)) return data;
        return data?.entries ?? data?.items ?? [];
    },
};
