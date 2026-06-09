import { api } from '@shared/services/api';
import type {
    BroadcastQuery,
    Broadcast,
    BusinessAnalytics,
    CreateBroadcastPayload,
    DateWindow,
    DeliveryStats,
    GeographyAnalytics,
    Granularity,
    GrowthAnalytics,
    PagedResult,
    PlatformSetting,
    RevenueOverview,
    RiskCompliance,
    TodayQueue,
} from '../types/platform';

const ANALYTICS = '/admin/analytics';
const NOTIFICATIONS = '/admin/notifications';
const SETTINGS = '/admin/settings';

/** Strips undefined/empty values so they don't reach the API as `?x=undefined`. */
const clean = (params: object): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') out[k] = v;
    });
    return out;
};

export const platformService = {
    /* --------------------------------- Analytics -------------------------------- */

    getBusiness: async (range: DateWindow): Promise<BusinessAnalytics> => {
        const { data } = await api.get<BusinessAnalytics>(`${ANALYTICS}/business`, {
            params: clean(range),
        });
        return data;
    },

    getGrowth: async (
        range: DateWindow & { granularity?: Granularity },
    ): Promise<GrowthAnalytics> => {
        const { data } = await api.get<GrowthAnalytics>(`${ANALYTICS}/growth`, {
            params: clean(range),
        });
        return data;
    },

    getRevenue: async (range: DateWindow): Promise<RevenueOverview> => {
        const { data } = await api.get<RevenueOverview>(`${ANALYTICS}/revenue`, {
            params: clean(range),
        });
        return data;
    },

    getGeography: async (range: DateWindow): Promise<GeographyAnalytics> => {
        const { data } = await api.get<GeographyAnalytics>(`${ANALYTICS}/geography`, {
            params: clean(range),
        });
        return data;
    },

    getRisk: async (): Promise<RiskCompliance> => {
        const { data } = await api.get<RiskCompliance>(`${ANALYTICS}/risk`);
        return data;
    },

    getTodayQueue: async (): Promise<TodayQueue> => {
        const { data } = await api.get<TodayQueue>(`${ANALYTICS}/today-queue`);
        return data;
    },

    /* ------------------------------- Notifications ------------------------------ */

    getBroadcasts: async (query: BroadcastQuery): Promise<PagedResult<Broadcast>> => {
        const { data } = await api.get<PagedResult<Broadcast>>(`${NOTIFICATIONS}/broadcasts`, {
            params: clean(query),
        });
        return data;
    },

    createBroadcast: async (payload: CreateBroadcastPayload): Promise<Broadcast> => {
        const { data } = await api.post<Broadcast>(`${NOTIFICATIONS}/broadcasts`, payload);
        return data;
    },

    getDeliveryStats: async (range: DateWindow): Promise<DeliveryStats> => {
        const { data } = await api.get<DeliveryStats>(`${NOTIFICATIONS}/delivery-stats`, {
            params: clean(range),
        });
        return data;
    },

    /* --------------------------------- Settings -------------------------------- */

    getSettings: async (): Promise<PlatformSetting[]> => {
        const { data } = await api.get<PlatformSetting[]>(SETTINGS);
        return data;
    },

    updateSetting: (key: string, value: string) =>
        api.put(`${SETTINGS}/${encodeURIComponent(key)}`, { value }),
};
