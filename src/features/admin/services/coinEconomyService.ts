import { api } from '@shared/services/api';
import type {
    CoinEconomySettings,
    UpdateCoinEconomySettingsRequest,
    AdminCoinPackage,
    UpsertCoinPackageRequest,
    AdminGiftType,
    AvailableGiftType,
    UpsertGiftTypeRequest,
} from '../types/coinEconomy';

const BASE = '/admin/coin-economy';

export const coinEconomyService = {
    // ---------- Settings ----------
    async getSettings(signal?: AbortSignal): Promise<CoinEconomySettings> {
        const { data } = await api.get<CoinEconomySettings>(`${BASE}/settings`, { signal });
        return data;
    },

    async updateSettings(payload: UpdateCoinEconomySettingsRequest): Promise<void> {
        await api.put(`${BASE}/settings`, payload);
    },

    // ---------- Coin packages ----------
    async getPackages(signal?: AbortSignal): Promise<AdminCoinPackage[]> {
        const { data } = await api.get<AdminCoinPackage[]>(`${BASE}/packages`, { signal });
        return data;
    },

    async createPackage(payload: UpsertCoinPackageRequest): Promise<AdminCoinPackage> {
        const { data } = await api.post<AdminCoinPackage>(`${BASE}/packages`, payload);
        return data;
    },

    async updatePackage(id: string, payload: UpsertCoinPackageRequest): Promise<AdminCoinPackage> {
        const { data } = await api.put<AdminCoinPackage>(`${BASE}/packages/${id}`, payload);
        return data;
    },

    async setPackageActive(id: string, active: boolean): Promise<void> {
        await api.post(`${BASE}/packages/${id}/${active ? 'activate' : 'deactivate'}`);
    },

    // ---------- Gift types ----------
    async getGiftTypes(signal?: AbortSignal): Promise<AdminGiftType[]> {
        const { data } = await api.get<AdminGiftType[]>(`${BASE}/gifts`, { signal });
        return data;
    },

    async getAvailableGiftTypes(signal?: AbortSignal): Promise<AvailableGiftType[]> {
        const { data } = await api.get<AvailableGiftType[]>(`${BASE}/gifts/available-types`, { signal });
        return data;
    },

    async createGiftType(payload: UpsertGiftTypeRequest): Promise<AdminGiftType> {
        const { data } = await api.post<AdminGiftType>(`${BASE}/gifts`, payload);
        return data;
    },

    async updateGiftType(id: string, payload: UpsertGiftTypeRequest): Promise<AdminGiftType> {
        const { data } = await api.put<AdminGiftType>(`${BASE}/gifts/${id}`, payload);
        return data;
    },

    async setGiftTypeActive(id: string, active: boolean): Promise<void> {
        await api.post(`${BASE}/gifts/${id}/${active ? 'activate' : 'deactivate'}`);
    },
};
