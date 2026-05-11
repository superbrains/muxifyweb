import { api } from '@shared/services/api';
import type {
    AcceptInvitationRequest,
    AcceptInvitationResponse,
    InvitationDto,
    InviteArtistRequest,
    InviteArtistResponse,
    LabelAnalyticsDto,
    LabelReleaseDto,
    LabelSummaryDto,
    PayoutDto,
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
    acceptInvitation: async (req: AcceptInvitationRequest): Promise<AcceptInvitationResponse> => {
        const { data } = await api.post<AcceptInvitationResponse>(
            `${BASE}/artists/invitations/accept`,
            req,
        );
        return data;
    },

    // Releases
    getReleases: async (limit?: number): Promise<LabelReleaseDto[]> => {
        const { data } = await api.get<LabelReleaseDto[]>(`${BASE}/releases`, {
            params: { limit },
        });
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
