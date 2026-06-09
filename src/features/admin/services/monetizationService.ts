import { api } from '@shared/services/api';
import type {
    AssignDisputeRequest,
    CommissionSummaryDto,
    CreateDisputeRequest,
    CreateSponsorshipRequest,
    DateRangeQuery,
    DisputeDetailDto,
    DisputeNoteRequest,
    DisputeQuery,
    DisputeStatusRequest,
    DisputesPage,
    ReasonRequest,
    ResolveDisputeRequest,
    RevenueSummaryDto,
    RoyaltiesSummaryDto,
    RoyaltyAuditEntryDto,
    RoyaltyTrackDetailDto,
    RoyaltyTracksPage,
    RoyaltyTracksQuery,
    SponsorshipDto,
    SponsorshipQuery,
    SponsorshipsPage,
    UpdateSplitsRequest,
    UpdateSponsorshipRequest,
} from '../types/monetization';

/**
 * Typed clients for the admin Monetization suite (Phase 3 Group 5). Every method
 * targets `/api/v1/admin/{monetization|royalties|sponsorships|disputes}/*`.
 * Summary endpoints are read-only; royalties/sponsorships/disputes carry the
 * mutating lifecycle surfaces. Mirrors `discoveryService` / `financeService` style.
 */
const MONETIZATION = '/admin/monetization';
const ROYALTIES = '/admin/royalties';
const SPONSORSHIPS = '/admin/sponsorships';
const DISPUTES = '/admin/disputes';

/** Strips undefined/empty params so axios doesn't serialise `?from=undefined`. */
const clean = (query: object): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') out[k] = v;
    });
    return out;
};

export const monetizationService = {
    getRevenue: async (range: DateRangeQuery): Promise<RevenueSummaryDto> => {
        const { data } = await api.get<RevenueSummaryDto>(`${MONETIZATION}/revenue`, {
            params: clean(range),
        });
        return data;
    },
    getCommission: async (range: DateRangeQuery): Promise<CommissionSummaryDto> => {
        const { data } = await api.get<CommissionSummaryDto>(`${MONETIZATION}/commission`, {
            params: clean(range),
        });
        return data;
    },
    getRoyalties: async (range: DateRangeQuery): Promise<RoyaltiesSummaryDto> => {
        const { data } = await api.get<RoyaltiesSummaryDto>(`${MONETIZATION}/royalties`, {
            params: clean(range),
        });
        return data;
    },
    /**
     * Streams the coin report as a CSV file. The backend returns `text/csv`; we
     * fetch it as a blob and trigger a browser download (never JSON-parsed).
     */
    downloadCoinReport: async (range: DateRangeQuery): Promise<void> => {
        const { data } = await api.get(`${MONETIZATION}/coin-report`, {
            params: clean(range),
            responseType: 'blob',
        });
        const blob = new Blob([data as BlobPart], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const stamp = new Date().toISOString().slice(0, 10);
        link.href = url;
        link.download = `coin-report-${stamp}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
};

export const royaltyService = {
    getTracks: async (query: RoyaltyTracksQuery): Promise<RoyaltyTracksPage> => {
        const { data } = await api.get<RoyaltyTracksPage>(`${ROYALTIES}/tracks`, {
            params: clean(query),
        });
        return data;
    },
    getTrack: async (trackId: string): Promise<RoyaltyTrackDetailDto> => {
        const { data } = await api.get<RoyaltyTrackDetailDto>(`${ROYALTIES}/tracks/${trackId}`);
        return data;
    },
    updateSplits: async (trackId: string, payload: UpdateSplitsRequest): Promise<void> => {
        await api.put(`${ROYALTIES}/tracks/${trackId}/splits`, payload);
    },
    freeze: async (trackId: string, payload: ReasonRequest): Promise<void> => {
        await api.post(`${ROYALTIES}/tracks/${trackId}/freeze`, payload);
    },
    unfreeze: async (trackId: string, payload: ReasonRequest): Promise<void> => {
        await api.post(`${ROYALTIES}/tracks/${trackId}/unfreeze`, payload);
    },
    dispute: async (trackId: string, payload: ReasonRequest): Promise<void> => {
        await api.post(`${ROYALTIES}/tracks/${trackId}/dispute`, payload);
    },
    resolveDispute: async (trackId: string, payload: ReasonRequest): Promise<void> => {
        await api.post(`${ROYALTIES}/tracks/${trackId}/dispute/resolve`, payload);
    },
    getAudit: async (trackId: string): Promise<RoyaltyAuditEntryDto[]> => {
        const { data } = await api.get<RoyaltyAuditEntryDto[]>(`${ROYALTIES}/tracks/${trackId}/audit`);
        return data;
    },
};

export const sponsorshipService = {
    list: async (query: SponsorshipQuery): Promise<SponsorshipsPage> => {
        const { data } = await api.get<SponsorshipsPage>(SPONSORSHIPS, { params: clean(query) });
        return data;
    },
    get: async (id: string): Promise<SponsorshipDto> => {
        const { data } = await api.get<SponsorshipDto>(`${SPONSORSHIPS}/${id}`);
        return data;
    },
    create: async (payload: CreateSponsorshipRequest): Promise<SponsorshipDto> => {
        const { data } = await api.post<SponsorshipDto>(SPONSORSHIPS, payload);
        return data;
    },
    update: async (id: string, payload: UpdateSponsorshipRequest): Promise<SponsorshipDto> => {
        const { data } = await api.put<SponsorshipDto>(`${SPONSORSHIPS}/${id}`, payload);
        return data;
    },
    approve: async (id: string): Promise<void> => {
        await api.post(`${SPONSORSHIPS}/${id}/approve`);
    },
    activate: async (id: string): Promise<void> => {
        await api.post(`${SPONSORSHIPS}/${id}/activate`);
    },
    complete: async (id: string): Promise<void> => {
        await api.post(`${SPONSORSHIPS}/${id}/complete`);
    },
    reject: async (id: string, payload: ReasonRequest): Promise<void> => {
        await api.post(`${SPONSORSHIPS}/${id}/reject`, payload);
    },
    cancel: async (id: string, payload: ReasonRequest): Promise<void> => {
        await api.post(`${SPONSORSHIPS}/${id}/cancel`, payload);
    },
};

export const disputeService = {
    list: async (query: DisputeQuery): Promise<DisputesPage> => {
        const { data } = await api.get<DisputesPage>(DISPUTES, { params: clean(query) });
        return data;
    },
    get: async (id: string): Promise<DisputeDetailDto> => {
        const { data } = await api.get<DisputeDetailDto>(`${DISPUTES}/${id}`);
        return data;
    },
    open: async (payload: CreateDisputeRequest): Promise<DisputeDetailDto> => {
        const { data } = await api.post<DisputeDetailDto>(DISPUTES, payload);
        return data;
    },
    assign: async (id: string, payload: AssignDisputeRequest): Promise<void> => {
        await api.post(`${DISPUTES}/${id}/assign`, payload);
    },
    setStatus: async (id: string, payload: DisputeStatusRequest): Promise<void> => {
        await api.post(`${DISPUTES}/${id}/status`, payload);
    },
    addNote: async (id: string, payload: DisputeNoteRequest): Promise<void> => {
        await api.post(`${DISPUTES}/${id}/notes`, payload);
    },
    resolve: async (id: string, payload: ResolveDisputeRequest): Promise<void> => {
        await api.post(`${DISPUTES}/${id}/resolve`, payload);
    },
    reject: async (id: string, payload: ReasonRequest): Promise<void> => {
        await api.post(`${DISPUTES}/${id}/reject`, payload);
    },
};
