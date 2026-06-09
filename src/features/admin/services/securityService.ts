import { api } from '@shared/services/api';
import type {
    SecurityActivityPageDto,
    SecurityActivityQuery,
    SecurityDeviceDto,
    SecuritySessionDto,
    SecurityUserDetailDto,
} from '../types/security';

/**
 * Typed client for the admin Security Activity API (Towers 4 + 29).
 *
 * Every method targets `/api/v1/admin/security/*`. The console only ever reads
 * device / session / IP metadata — it never requests or transmits raw tokens.
 */
const BASE = '/admin/security';

export const securityService = {
    getActivity: async (
        query: SecurityActivityQuery,
    ): Promise<SecurityActivityPageDto> => {
        const { data } = await api.get<SecurityActivityPageDto>(`${BASE}/activity`, {
            params: query,
        });
        return data;
    },

    getUser: async (userId: string): Promise<SecurityUserDetailDto> => {
        const { data } = await api.get<SecurityUserDetailDto>(
            `${BASE}/users/${userId}`,
        );
        return data;
    },

    getSessions: async (userId: string): Promise<SecuritySessionDto[]> => {
        const { data } = await api.get<SecuritySessionDto[]>(
            `${BASE}/users/${userId}/sessions`,
        );
        return data;
    },

    getDevices: async (userId: string): Promise<SecurityDeviceDto[]> => {
        const { data } = await api.get<SecurityDeviceDto[]>(
            `${BASE}/users/${userId}/devices`,
        );
        return data;
    },

    forceLogout: async (userId: string): Promise<void> => {
        await api.post(`${BASE}/users/${userId}/force-logout`);
    },

    lockUser: async (userId: string, reason: string): Promise<void> => {
        await api.post(`${BASE}/users/${userId}/lock`, { reason });
    },

    unlockUser: async (userId: string): Promise<void> => {
        await api.post(`${BASE}/users/${userId}/unlock`);
    },

    flagPasswordReset: async (userId: string): Promise<void> => {
        await api.post(`${BASE}/users/${userId}/flag-password-reset`);
    },
};
