import { api } from '@shared/services/api';
import type {
    AdminActivityDto,
    AdminOverviewDto,
    AdminUserDetailDto,
    ActivityRange,
    ModerationAction,
    ModerationPageDto,
    ModerationQuery,
    TicketDetailDto,
    TicketMessageDto,
    TicketPageDto,
    TicketQuery,
    TicketStatus,
    UserPageDto,
    UserQuery,
    VerificationDetailDto,
    VerificationPageDto,
    VerificationQuery,
} from '../types';

/**
 * Typed client for the Muxify Super Admin API.
 *
 * Every method targets `/api/v1/admin/*`. These endpoints are NOT yet
 * implemented server-side — they are the contract the backend team builds
 * against. The backend MUST enforce the `admin` role on each route (403 for
 * non-admins); the client-side `AdminRoute` guard is UX only.
 *
 * Conventions: money is integer minor units + a `currency` field; timestamps
 * are ISO-8601 strings; list endpoints return a `PagedResult` envelope.
 */
const BASE = '/admin';

export const adminService = {
    /* -------------------------------- Overview ------------------------------- */
    getOverview: async (): Promise<AdminOverviewDto> => {
        const { data } = await api.get<AdminOverviewDto>(`${BASE}/overview`);
        return data;
    },
    getActivitySeries: async (range: ActivityRange): Promise<AdminActivityDto> => {
        const { data } = await api.get<AdminActivityDto>(`${BASE}/overview/activity`, {
            params: range,
        });
        return data;
    },

    /* ----------------------------- Verifications ----------------------------- */
    getVerifications: async (query: VerificationQuery): Promise<VerificationPageDto> => {
        const { data } = await api.get<VerificationPageDto>(`${BASE}/verifications`, {
            params: query,
        });
        return data;
    },
    getVerification: async (id: string): Promise<VerificationDetailDto> => {
        const { data } = await api.get<VerificationDetailDto>(
            `${BASE}/verifications/${id}`,
        );
        return data;
    },
    approveVerification: async (id: string): Promise<void> => {
        await api.post(`${BASE}/verifications/${id}/approve`);
    },
    rejectVerification: async (id: string, reason: string): Promise<void> => {
        await api.post(`${BASE}/verifications/${id}/reject`, { reason });
    },

    /* -------------------------------- Users --------------------------------- */
    getUsers: async (query: UserQuery): Promise<UserPageDto> => {
        const { data } = await api.get<UserPageDto>(`${BASE}/users`, { params: query });
        return data;
    },
    getUser: async (userId: string): Promise<AdminUserDetailDto> => {
        const { data } = await api.get<AdminUserDetailDto>(`${BASE}/users/${userId}`);
        return data;
    },
    suspendUser: async (userId: string, reason: string): Promise<void> => {
        await api.post(`${BASE}/users/${userId}/suspend`, { reason });
    },
    activateUser: async (userId: string): Promise<void> => {
        await api.post(`${BASE}/users/${userId}/activate`);
    },

    /* ----------------------------- Support tickets --------------------------- */
    getTickets: async (query: TicketQuery): Promise<TicketPageDto> => {
        const { data } = await api.get<TicketPageDto>(`${BASE}/support/tickets`, {
            params: query,
        });
        return data;
    },
    getTicket: async (id: string): Promise<TicketDetailDto> => {
        const { data } = await api.get<TicketDetailDto>(`${BASE}/support/tickets/${id}`);
        return data;
    },
    replyToTicket: async (id: string, message: string): Promise<TicketMessageDto> => {
        const { data } = await api.post<TicketMessageDto>(
            `${BASE}/support/tickets/${id}/reply`,
            { message },
        );
        return data;
    },
    updateTicketStatus: async (
        id: string,
        body: { status?: TicketStatus; assigneeId?: string },
    ): Promise<void> => {
        await api.patch(`${BASE}/support/tickets/${id}`, body);
    },

    /* ------------------------------ Moderation ------------------------------- */
    getModerationItems: async (query: ModerationQuery): Promise<ModerationPageDto> => {
        const { data } = await api.get<ModerationPageDto>(`${BASE}/moderation`, {
            params: query,
        });
        return data;
    },
    resolveModerationItem: async (
        id: string,
        body: { action: ModerationAction; reason?: string },
    ): Promise<void> => {
        await api.post(`${BASE}/moderation/${id}/resolve`, body);
    },
};
