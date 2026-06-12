import { api } from '@shared/services/api';
import type {
    ContentAuditEntryDto,
    ContentItemDetailDto,
    ContentItemPageDto,
    ContentItemQuery,
    ContentKind,
    ContentStatsDto,
    CreateLyricsPayload,
    DuplicateMatchDto,
    DuplicateMatchPageDto,
    DuplicateMatchQuery,
    DuplicateStatsDto,
    LyricsDto,
    LyricsPageDto,
    LyricsQuery,
    LyricsStatsDto,
    ModerationStatsDto,
    ProcessingItemPageDto,
    ProcessingQuery,
    UploadSessionDetailDto,
    UploadSessionPageDto,
    UploadSessionQuery,
    UploadStatsDto,
} from '../types/content';

/**
 * Typed client for the admin Content suite (Towers 5/6/7/23/27/28). Every
 * method targets `/api/v1/admin/{content|uploads|duplicates|lyrics}/*`. Money is
 * absent here; timestamps are ISO-8601; list endpoints return a `PagedResult`.
 */
const CONTENT = '/admin/content';
const UPLOADS = '/admin/uploads';
const DUPLICATES = '/admin/duplicates';
const LYRICS = '/admin/lyrics';

export const contentService = {
    /* ------------------------------ Content items ----------------------------- */
    getItems: async (query: ContentItemQuery): Promise<ContentItemPageDto> => {
        const { data } = await api.get<ContentItemPageDto>(`${CONTENT}/items`, {
            params: query,
        });
        return data;
    },
    getItem: async (kind: ContentKind, id: string): Promise<ContentItemDetailDto> => {
        const { data } = await api.get<ContentItemDetailDto>(`${CONTENT}/items/${kind}/${id}`);
        return data;
    },
    publish: async (kind: ContentKind, id: string): Promise<void> => {
        await api.post(`${CONTENT}/items/${kind}/${id}/publish`);
    },
    unpublish: async (kind: ContentKind, id: string): Promise<void> => {
        await api.post(`${CONTENT}/items/${kind}/${id}/unpublish`);
    },
    restore: async (kind: ContentKind, id: string): Promise<void> => {
        await api.post(`${CONTENT}/items/${kind}/${id}/restore`);
    },
    remove: async (kind: ContentKind, id: string, reason: string): Promise<void> => {
        await api.post(`${CONTENT}/items/${kind}/${id}/remove`, { reason });
    },
    restrict: async (kind: ContentKind, id: string, reason: string): Promise<void> => {
        await api.post(`${CONTENT}/items/${kind}/${id}/restrict`, { reason });
    },
    unrestrict: async (kind: ContentKind, id: string, reason: string): Promise<void> => {
        await api.post(`${CONTENT}/items/${kind}/${id}/unrestrict`, { reason });
    },
    reschedule: async (id: string, releaseDate: string): Promise<void> => {
        await api.post(`${CONTENT}/items/track/${id}/reschedule`, { releaseDate });
    },
    getStats: async (query?: {
        kind?: string; ownerRole?: string; releaseType?: string; videoType?: string;
    }): Promise<ContentStatsDto> => {
        const { data } = await api.get<ContentStatsDto>(`${CONTENT}/stats`, { params: query });
        return data;
    },
    getItemAudit: async (kind: ContentKind, id: string): Promise<ContentAuditEntryDto[]> => {
        const { data } = await api.get<ContentAuditEntryDto[]>(`${CONTENT}/items/${kind}/${id}/audit`);
        return data;
    },

    /* -------------------------------- Uploads -------------------------------- */
    getUploadSessions: async (query: UploadSessionQuery): Promise<UploadSessionPageDto> => {
        const { data } = await api.get<UploadSessionPageDto>(`${UPLOADS}/sessions`, {
            params: query,
        });
        return data;
    },
    getProcessing: async (query: ProcessingQuery): Promise<ProcessingItemPageDto> => {
        const { data } = await api.get<ProcessingItemPageDto>(`${UPLOADS}/processing`, {
            params: query,
        });
        return data;
    },
    retryProcessing: async (kind: string, id: string): Promise<void> => {
        await api.post(`${UPLOADS}/retry/${kind}/${id}`);
    },
    getUploadStats: async (): Promise<UploadStatsDto> => {
        const { data } = await api.get<UploadStatsDto>(`${UPLOADS}/stats`);
        return data;
    },
    getUploadSession: async (id: string): Promise<UploadSessionDetailDto> => {
        const { data } = await api.get<UploadSessionDetailDto>(`${UPLOADS}/sessions/${id}`);
        return data;
    },

    /* ------------------------------- Duplicates ------------------------------ */
    getMatches: async (query: DuplicateMatchQuery): Promise<DuplicateMatchPageDto> => {
        const { data } = await api.get<DuplicateMatchPageDto>(`${DUPLICATES}/matches`, {
            params: query,
        });
        return data;
    },
    getMatch: async (id: string): Promise<DuplicateMatchDto> => {
        const { data } = await api.get<DuplicateMatchDto>(`${DUPLICATES}/matches/${id}`);
        return data;
    },
    confirmMatch: async (id: string, reason: string): Promise<void> => {
        await api.post(`${DUPLICATES}/matches/${id}/confirm`, { reason });
    },
    dismissMatch: async (id: string, reason: string): Promise<void> => {
        await api.post(`${DUPLICATES}/matches/${id}/dismiss`, { reason });
    },
    getDuplicateStats: async (): Promise<DuplicateStatsDto> => {
        const { data } = await api.get<DuplicateStatsDto>(`${DUPLICATES}/stats`);
        return data;
    },

    /* --------------------------------- Lyrics -------------------------------- */
    getLyrics: async (query: LyricsQuery): Promise<LyricsPageDto> => {
        const { data } = await api.get<LyricsPageDto>(`${LYRICS}`, { params: query });
        return data;
    },
    createLyrics: async (payload: CreateLyricsPayload): Promise<void> => {
        await api.post(`${LYRICS}`, payload);
    },
    approveLyrics: async (id: string): Promise<void> => {
        await api.post(`${LYRICS}/${id}/approve`);
    },
    rejectLyrics: async (id: string, reason: string): Promise<void> => {
        await api.post(`${LYRICS}/${id}/reject`, { reason });
    },
    getLyricsById: async (id: string): Promise<LyricsDto> => {
        const { data } = await api.get<LyricsDto>(`${LYRICS}/${id}`);
        return data;
    },
    getLyricsStats: async (): Promise<LyricsStatsDto> => {
        const { data } = await api.get<LyricsStatsDto>(`${LYRICS}/stats`);
        return data;
    },

    /* ------------------------------ Moderation ------------------------------- */
    getModerationStats: async (ownerRole?: string): Promise<ModerationStatsDto> => {
        const { data } = await api.get<ModerationStatsDto>(`/admin/moderation/stats`, {
            params: ownerRole ? { ownerRole } : undefined,
        });
        return data;
    },
};
