import { api } from '@shared/services/api';
import type {
    ContentItemDetailDto,
    ContentItemPageDto,
    ContentItemQuery,
    ContentKind,
    CreateLyricsPayload,
    DuplicateMatchDto,
    DuplicateMatchPageDto,
    DuplicateMatchQuery,
    LyricsPageDto,
    LyricsQuery,
    ProcessingItemPageDto,
    ProcessingQuery,
    UploadSessionPageDto,
    UploadSessionQuery,
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
};
