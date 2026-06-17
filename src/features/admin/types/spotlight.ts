/* Spotlight admin types — mirror the backend AdminSpotlight DTOs. */

export type SpotlightType =
    | 'Track'
    | 'Album'
    | 'Artist'
    | 'Playlist'
    | 'Video'
    | 'Promotion'
    | 'Announcement'
    | 'NewRelease';

export const SPOTLIGHT_TYPES: SpotlightType[] = [
    'Track',
    'Album',
    'Artist',
    'Playlist',
    'Video',
    'Promotion',
    'Announcement',
    'NewRelease',
];

export interface AdminSpotlight {
    id: string;
    title: string;
    subtitle?: string | null;
    type: SpotlightType;
    contentId?: string | null;
    externalUrl?: string | null;
    imageUrl: string;
    priority: number;
    isActive: boolean;
    startDate: string;
    endDate?: string | null;
    clickCount: number;
    impressionCount: number;
    createdAt: string;
}

/** A single artist row returned by GET /search?type=artists, used by the entity picker. */
export interface SpotlightArtistResult {
    id: string;
    name: string;
    avatarUrl?: string | null;
    isVerified: boolean;
    followerCount?: number;
    trackCount?: number;
}

export interface UpsertSpotlightRequest {
    title: string;
    subtitle?: string | null;
    type: SpotlightType;
    contentId?: string | null;
    externalUrl?: string | null;
    imageUrl: string;
    priority: number;
    isActive?: boolean | null;
    startDate?: string | null;
    endDate?: string | null;
}
