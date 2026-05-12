import { api } from '@shared/services/api';
import type {
    AcceptInvitationRequest,
    AcceptInvitationResponse,
    InvitationDto,
    InvitationLookupResponse,
    InviteArtistRequest,
    InviteArtistResponse,
    LabelAnalyticsDto,
    LabelReleaseSummaryDto,
    LabelReleasesPageDto,
    LabelSummaryDto,
    PayoutDto,
    ReleaseFilters,
    ReleaseSplitsDto,
    RosterArtistDto,
    SetSplitsRequest,
    TriggerPayoutRequest,
    TriggerPayoutResponse,
} from '../types';

const BASE = '/labels/me';

export const recordLabelService = {
    getSummary: async (): Promise<LabelSummaryDto> => {
        const { data } = await api.get<LabelSummaryDto>(`${BASE}/summary`);
        return data;
    },

    // Roster
    getRoster: async (): Promise<RosterArtistDto[]> => {
        const { data } = await api.get<RosterArtistDto[]>(`${BASE}/artists`);
        return data;
    },
    inviteArtist: async (req: InviteArtistRequest): Promise<InviteArtistResponse> => {
        const { data } = await api.post<InviteArtistResponse>(
            `${BASE}/artists/invite`,
            req,
        );
        return data;
    },
    removeArtist: async (artistUserId: string): Promise<void> => {
        await api.delete(`${BASE}/artists/${artistUserId}`);
    },
    getInvitations: async (): Promise<InvitationDto[]> => {
        const { data } = await api.get<InvitationDto[]>(`${BASE}/artists/invitations`);
        return data;
    },
    revokeInvitation: async (invitationId: string): Promise<void> => {
        await api.post(`${BASE}/artists/invitations/${invitationId}/revoke`);
    },
    resendInvitation: async (invitationId: string): Promise<InviteArtistResponse> => {
        const { data } = await api.post<InviteArtistResponse>(
            `${BASE}/artists/invitations/${invitationId}/resend`,
        );
        return data;
    },
    acceptInvitation: async (req: AcceptInvitationRequest): Promise<AcceptInvitationResponse> => {
        const { data } = await api.post<AcceptInvitationResponse>(
            `${BASE}/artists/invitations/accept`,
            req,
        );
        return data;
    },
    /**
     * Public (no-auth) lookup used by the accept page to render label context
     * and decide whether to send the invitee into sign-in or registration.
     */
    lookupInvitation: async (token: string): Promise<InvitationLookupResponse> => {
        const { data } = await api.get<InvitationLookupResponse>(
            `/labels/invitations/lookup`,
            { params: { token } },
        );
        return data;
    },

    // Releases
    getReleases: async (
        filters: ReleaseFilters = {},
        limit?: number,
    ): Promise<LabelReleasesPageDto> => {
        const params: Record<string, string | number | undefined> = {
            kind: filters.kind,
            status: filters.status?.join(','),
            artistId: filters.artistIds?.join(','),
            search: filters.search,
            sort: filters.sort,
            page: filters.page,
            pageSize: filters.pageSize,
            limit,
        };
        const { data } = await api.get<LabelReleasesPageDto>(`${BASE}/releases`, {
            params,
        });
        return data;
    },
    getReleasesSummary: async (): Promise<LabelReleaseSummaryDto> => {
        const { data } = await api.get<LabelReleaseSummaryDto>(`${BASE}/releases/summary`);
        return data;
    },

    // Splits
    getSplits: async (trackId: string): Promise<ReleaseSplitsDto> => {
        const { data } = await api.get<ReleaseSplitsDto>(
            `/releases/tracks/${trackId}/splits`,
        );
        return data;
    },
    setSplits: async (trackId: string, req: SetSplitsRequest): Promise<ReleaseSplitsDto> => {
        const { data } = await api.put<ReleaseSplitsDto>(
            `/releases/tracks/${trackId}/splits`,
            req,
        );
        return data;
    },

    // Payouts
    getPayouts: async (params?: {
        status?: string;
        from?: string;
        to?: string;
        page?: number;
        pageSize?: number;
    }): Promise<PayoutDto[]> => {
        const { data } = await api.get<PayoutDto[]>(`${BASE}/payouts`, { params });
        return data;
    },
    getPayout: async (id: string): Promise<PayoutDto> => {
        const { data } = await api.get<PayoutDto>(`${BASE}/payouts/${id}`);
        return data;
    },
    triggerPayout: async (
        req: TriggerPayoutRequest,
        idempotencyKey: string,
    ): Promise<TriggerPayoutResponse> => {
        const { data } = await api.post<TriggerPayoutResponse>(
            `${BASE}/payouts/trigger`,
            req,
            { headers: { 'Idempotency-Key': idempotencyKey } },
        );
        return data;
    },

    // Analytics
    getAnalytics: async (params: {
        from: string;
        to: string;
        granularity: 'day' | 'week' | 'month';
    }): Promise<LabelAnalyticsDto> => {
        const { data } = await api.get<LabelAnalyticsDto>(`${BASE}/analytics`, {
            params,
        });
        return data;
    },
};
