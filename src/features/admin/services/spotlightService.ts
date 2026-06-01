import { api } from '@shared/services/api';
import type { AdminSpotlight, UpsertSpotlightRequest } from '../types/spotlight';

const BASE = '/admin/spotlight';

export const spotlightService = {
    async list(signal?: AbortSignal): Promise<AdminSpotlight[]> {
        const { data } = await api.get<AdminSpotlight[]>(`${BASE}/`, { signal });
        return data;
    },

    async create(payload: UpsertSpotlightRequest): Promise<AdminSpotlight> {
        const { data } = await api.post<AdminSpotlight>(`${BASE}/`, payload);
        return data;
    },

    async update(id: string, payload: UpsertSpotlightRequest): Promise<AdminSpotlight> {
        const { data } = await api.put<AdminSpotlight>(`${BASE}/${id}`, payload);
        return data;
    },

    async setActive(id: string, active: boolean): Promise<void> {
        await api.post(`${BASE}/${id}/${active ? 'activate' : 'deactivate'}`);
    },

    async remove(id: string): Promise<void> {
        await api.delete(`${BASE}/${id}`);
    },

    /** Uploads a spotlight banner image and returns the media-proxy URL to store on `imageUrl`. */
    async uploadImage(file: File): Promise<{ imageUrl: string }> {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post<{ imageUrl: string }>(`${BASE}/image`, formData);
        return data;
    },
};
