import { api } from '@shared/services/api';
import type { DisputeStatus } from '../lib/disputeFamily';

/* ------------------------------------------------------------------ *
 * Self-service dispute DTOs — mirror MeDisputeService (backend) and
 * the contributor dispute DTOs (same shape, minus attachments on the
 * older contributor endpoint).
 * ------------------------------------------------------------------ */

export interface DisputeListItem {
    id: string;
    reference: string;
    subjectType: string;
    status: DisputeStatus;
    amountMinor?: number | null;
    currency?: string | null;
    /** Present on the /me/disputes endpoint; absent (undefined) on the contributor one. */
    attachmentCount?: number;
    createdAt: string;
    resolvedAt?: string | null;
}

export interface DisputeEvent {
    id: string;
    action: string;
    note?: string | null;
    byYou: boolean;
    createdAt: string;
}

export interface DisputeAttachment {
    id: string;
    fileName: string;
    contentType: string;
    /** Authenticated proxy path (GET /api/v1/media/file/...). */
    url: string;
    sizeBytes: number;
    createdAt: string;
}

export interface DisputeDetail {
    id: string;
    reference: string;
    subjectType: string;
    subjectId?: string | null;
    type: string;
    status: DisputeStatus;
    amountMinor?: number | null;
    currency?: string | null;
    description: string;
    createdAt: string;
    resolvedAt?: string | null;
    resolutionNotes?: string | null;
    events: DisputeEvent[];
    /** Absent on the contributor endpoint; defaults to [] when reading. */
    attachments?: DisputeAttachment[];
}

export interface RaiseDisputePayload {
    subjectType: string;
    subjectId?: string | null;
    description: string;
    amountMinor?: number | null;
    currency?: string;
}

/** Server `PagedResult<T>` shape: `{ items, total, page, pageSize }`. */
export interface DisputesPage {
    items: DisputeListItem[];
    total: number;
    page: number;
    pageSize: number;
}

export interface DisputeListOptions {
    page?: number;
    pageSize?: number;
    status?: string;
}

/* ------------------------------------------------------------------ *
 * Service — parameterized by `base` so the same UI drives both the
 * shared `/me/disputes` endpoint (artist/label/ad) and the existing
 * `/contributor/disputes` endpoint. The `api` wrapper already prefixes
 * `/api/v1`, so bases are written without it.
 * ------------------------------------------------------------------ */
export const disputeService = {
    list: (base: string, options: DisputeListOptions = {}) => {
        const { page = 1, pageSize = 20, status } = options;
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (status) params.set('status', status);
        return api.get<DisputesPage>(`${base}?${params.toString()}`);
    },
    get: (base: string, id: string) => api.get<DisputeDetail>(`${base}/${id}`),
    raise: (base: string, payload: RaiseDisputePayload) =>
        api.post<DisputeDetail>(base, payload),
    /**
     * Uploads evidence files to a raised dispute via multipart form-data.
     * Only the `/me/disputes` endpoint supports attachments; callers gate on that.
     */
    uploadAttachments: (base: string, id: string, files: File[]) => {
        const form = new FormData();
        files.forEach((f) => form.append('files', f));
        return api.post<DisputeDetail>(`${base}/${id}/attachments`, form);
    },
};

export default disputeService;
