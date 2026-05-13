import { api } from '@shared/services/api';
import type {
    AddLabelDirectorRequest,
    LabelDirectorDto,
    LabelSettingsDto,
    UpdateLabelDirectorRequest,
    UpdateLabelProfileRequest,
} from '../types';

const BASE = '/labels/me/settings';

export const labelSettingsService = {
    getSettings: async (): Promise<LabelSettingsDto> => {
        const { data } = await api.get<LabelSettingsDto>(`${BASE}/`);
        return data;
    },

    updateProfile: async (
        req: UpdateLabelProfileRequest,
    ): Promise<LabelSettingsDto> => {
        const { data } = await api.put<LabelSettingsDto>(`${BASE}/profile`, req);
        return data;
    },

    uploadLogo: async (file: File): Promise<{ logoUrl: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post<{ logoUrl: string }>(
            `${BASE}/logo`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        return data;
    },

    addDirector: async (
        req: AddLabelDirectorRequest,
    ): Promise<LabelDirectorDto> => {
        const { data } = await api.post<LabelDirectorDto>(
            `${BASE}/directors`,
            req,
        );
        return data;
    },

    updateDirector: async (
        directorId: string,
        req: UpdateLabelDirectorRequest,
    ): Promise<LabelDirectorDto> => {
        const { data } = await api.put<LabelDirectorDto>(
            `${BASE}/directors/${directorId}`,
            req,
        );
        return data;
    },

    removeDirector: async (directorId: string): Promise<void> => {
        await api.delete(`${BASE}/directors/${directorId}`);
    },

    uploadDirectorIdentity: async (
        directorId: string,
        file: File,
    ): Promise<{ identityDocumentUrl: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post<{ identityDocumentUrl: string }>(
            `${BASE}/directors/${directorId}/identity-document`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        return data;
    },

    submitVerification: async (file: File): Promise<void> => {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`${BASE}/verification`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};
