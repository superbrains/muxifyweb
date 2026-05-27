import { axiosInstance } from '@app/lib/axiosInstance';
import type { SplitRecipientRole } from '@/features/record-label/types';

export type CollaboratorAccountType =
    | 'Artist'
    | 'DJ'
    | 'Creator'
    | 'Label'
    | 'Podcaster';

export interface CollaboratorSearchResult {
    userId: string;
    displayName: string;
    fullName: string;
    avatarUrl?: string | null;
    accountType: CollaboratorAccountType;
    accountTypeLabel: string;
    defaultRole: SplitRecipientRole;
    isVerified: boolean;
}

interface UserSearchResponse {
    query: string;
    results: CollaboratorSearchResult[];
}

export const userSearchService = {
    /**
     * Search the global creator directory. Returns Artists, DJs, Record
     * Labels, Podcasters, and Creators — excludes Fans and Admins.
     */
    search: async (
        query: string,
        pageSize = 12,
    ): Promise<CollaboratorSearchResult[]> => {
        const response = await axiosInstance.get<UserSearchResponse>('/users/search', {
            params: { q: query.trim(), pageSize },
        });
        return response.data.results;
    },
};
