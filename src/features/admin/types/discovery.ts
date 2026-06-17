/* ------------------------------------------------------------------ *
 * Discovery & Leaderboards admin types — mirror the backend
 * `/admin/discovery` and `/admin/leaderboards` DTOs. Enum-ish fields are
 * typed as `string` so the UI tolerates whatever the backend emits.
 * ------------------------------------------------------------------ */

import type { PagedResult } from './index';

/* ------------------------------------------------------------------ *
 * Shared vocab
 * ------------------------------------------------------------------ */

/**
 * Trending/chart period window. These are the canonical `TrendingPeriod` tokens the
 * backend parses directly (and maps to the gift-feed vocabulary for the gifting surfaces).
 */
export type DiscoveryPeriod = 'Day' | 'Week' | 'Month' | 'AllTime';

export const DISCOVERY_PERIODS: DiscoveryPeriod[] = ['Day', 'Week', 'Month', 'AllTime'];

export const DISCOVERY_PERIOD_OPTIONS = [
    { value: 'Day', label: 'Daily' },
    { value: 'Week', label: 'Weekly' },
    { value: 'Month', label: 'Monthly' },
    { value: 'AllTime', label: 'All time' },
];

/** The content kinds a trending row can describe. */
export type DiscoveryContentType = 'Track' | 'Video' | 'Album' | 'Playlist';

export const DISCOVERY_CONTENT_TYPE_OPTIONS = [
    { value: 'All', label: 'All content' },
    { value: 'Track', label: 'Tracks' },
    { value: 'Video', label: 'Videos' },
    { value: 'Album', label: 'Albums' },
    { value: 'Playlist', label: 'Playlists' },
];

/**
 * The mobile app reads every discovery surface in two verticals (music tracks vs videos).
 * `vertical` decides which feed query the admin mirror calls.
 */
export const DISCOVERY_VERTICAL_OPTIONS = [
    { value: 'music', label: 'Music' },
    { value: 'video', label: 'Video' },
];

/**
 * Creator-category filter — mirrors the mobile home tabs. The token maps to a creator role on
 * the backend (`?category=`). 'All' clears the filter.
 */
export const CREATOR_CATEGORY_OPTIONS = [
    { value: 'All', label: 'All creators' },
    { value: 'artist', label: 'Artists' },
    { value: 'dj', label: 'DJs' },
    { value: 'podcaster', label: 'Podcasters' },
    { value: 'creator', label: 'Creators' },
];

/** Video sub-segment filter (video vertical only) — mirrors the mobile music/content split. */
export const VIDEO_TYPE_OPTIONS = [
    { value: 'All', label: 'All videos' },
    { value: 'music', label: 'Music videos' },
    { value: 'content', label: 'Content videos' },
];

/** The four most-gifted dimensions the mobile spotlight exposes. */
export const MOST_GIFTED_VARIANT_OPTIONS = [
    { value: 'tracks', label: 'Tracks' },
    { value: 'artists', label: 'Artists' },
    { value: 'videos', label: 'Videos' },
    { value: 'creators', label: 'Creators' },
];

/** Gift-leaderboard window — the mobile spotlight toggles between this week and all-time. */
export const GIFT_PERIOD_OPTIONS = [
    { value: 'Week', label: 'This week' },
    { value: 'AllTime', label: 'All time' },
];

/** Curation surfaces an override / featured item can target. */
export type DiscoverySurface =
    | 'Trending'
    | 'TopCharts'
    | 'HotReleases'
    | 'NewReleases'
    | 'MostGifted'
    | 'TopGivers'
    | 'HomeFeed';

/** The action a curation override applies to a piece of content. */
export type CurationAction = 'Pin' | 'Boost' | 'Suppress' | 'Exclude';

export const CURATION_ACTIONS: CurationAction[] = ['Pin', 'Boost', 'Suppress', 'Exclude'];

/* ------------------------------------------------------------------ *
 * Trending / charts / releases (read-only ranked lists)
 * ------------------------------------------------------------------ */

export interface AdminTrendingItemDto {
    contentId: string;
    contentType: string;
    period: string;
    trendingScore: number;
    playCount: number;
    likeCount: number;
    shareCount: number;
    giftCoins: number;
    rank: number;
    rankChange: number;
    genreId?: string | null;
    calculatedAt: string;
    /** Title/owner/cover metadata resolved from the underlying content. */
    title?: string | null;
    ownerName?: string | null;
    ownerId?: string | null;
    coverArtUrl?: string | null;
    genreName?: string | null;
    /** If an active override touches this row, its action + id. */
    overrideAction?: string | null;
    overrideId?: string | null;
}

export type AdminTrendingPageDto = PagedResult<AdminTrendingItemDto>;

/**
 * Shared filter shape for the trending-family surfaces. `vertical` picks the music-track vs video
 * feed query; `category` is the creator-category role; `videoType` narrows the video segment;
 * `genre` is a genre NAME (music vertical). All mirror the mobile feed query params 1:1.
 */
export interface TrendingQuery {
    vertical?: string;
    category?: string;
    period?: string;
    videoType?: string;
    genre?: string;
    page?: number;
    pageSize?: number;
}

export interface TopChartsQuery {
    vertical?: string;
    category?: string;
    period?: string;
    videoType?: string;
    genre?: string;
    page?: number;
    pageSize?: number;
}

export interface HotReleasesQuery {
    vertical?: string;
    category?: string;
    videoType?: string;
    genre?: string;
    days?: number;
    page?: number;
    pageSize?: number;
}

export interface NewReleasesQuery {
    vertical?: string;
    category?: string;
    videoType?: string;
    genre?: string;
    days?: number;
    page?: number;
    pageSize?: number;
}

/* ------------------------------------------------------------------ *
 * Gifting leaderboards (most-gifted / top-givers)
 * ------------------------------------------------------------------ */

export interface AdminMostGiftedDto {
    /** Gifted artist id. */
    artistId: string;
    artistName: string;
    avatarUrl?: string | null;
    totalGiftValue: number;
    totalGiftsReceived: number;
    followerCount?: number | null;
    rank: number;
    overrideAction?: string | null;
    overrideId?: string | null;
}

/**
 * Unified most-gifted row across every mobile variant (tracks / artists / videos / creators).
 * Content variants (tracks/videos) carry `contentType` + override overlay (curate via the override
 * modal); entity variants (artists/creators) carry `followerCount` and are managed via exclusions.
 */
export interface AdminMostGiftedRowDto {
    variant: string;
    rank: number;
    id: string;
    name: string;
    artistName?: string | null;
    artistId?: string | null;
    imageUrl?: string | null;
    totalGiftsReceived: number;
    totalGiftValue: number;
    followerCount?: number | null;
    contentType?: string | null;
    overrideAction?: string | null;
    overrideId?: string | null;
}

export interface AdminTopGiversDto {
    rank: number;
    userId: string;
    displayName?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
    totalGiftValue: number;
    giftCount: number;
    currentMedal?: string | null;
    overrideAction?: string | null;
    overrideId?: string | null;
}

/** Most-gifted query: `variant` selects tracks/artists/videos/creators; `category` is the creator role. */
export interface MostGiftedQuery {
    variant?: string;
    category?: string;
    period?: string;
    take?: number;
}

/** Top-givers query: `vertical` selects the music vs video gift scope. */
export interface TopGiversQuery {
    vertical?: string;
    period?: string;
    take?: number;
}

/* ------------------------------------------------------------------ *
 * Home feed preview (read-only — modelled defensively)
 * ------------------------------------------------------------------ */

export interface AdminHomeFeedSectionDto {
    key?: string | null;
    title?: string | null;
    type?: string | null;
    items?: AdminHomeFeedItemDto[] | null;
    [extra: string]: unknown;
}

export interface AdminHomeFeedItemDto {
    id?: string | null;
    contentId?: string | null;
    contentType?: string | null;
    title?: string | null;
    subtitle?: string | null;
    imageUrl?: string | null;
    [extra: string]: unknown;
}

export interface AdminHomeFeedDto {
    sections?: AdminHomeFeedSectionDto[] | null;
    generatedAt?: string | null;
    [extra: string]: unknown;
}

/* ------------------------------------------------------------------ *
 * Curation overrides
 * ------------------------------------------------------------------ */

export interface AdminCurationOverrideDto {
    id: string;
    surface: string;
    contentType: string;
    contentId: string;
    action: string;
    weight?: number | null;
    pinnedRank?: number | null;
    isActive: boolean;
    /** Active AND inside its scheduled window right now (backend-computed). */
    isCurrentlyActive?: boolean;
    startDate?: string | null;
    endDate?: string | null;
    reason: string;
    createdByUserId: string;
    createdAt: string;
}

export interface UpsertCurationOverrideRequest {
    surface: string;
    contentType: string;
    contentId: string;
    action: string;
    weight?: number | null;
    pinnedRank?: number | null;
    reason: string;
    startDate?: string | null;
    endDate?: string | null;
    isActive?: boolean | null;
}

export interface CurationOverrideQuery {
    surface?: string;
    activeOnly?: boolean;
}

/* ------------------------------------------------------------------ *
 * Batch curation (apply one action to many items on a surface)
 * ------------------------------------------------------------------ */

export interface BatchOverrideItem {
    contentType: string;
    contentId: string;
}

export interface BatchCurationOverrideRequest {
    surface: string;
    action: string;
    weight?: number | null;
    pinnedRank?: number | null;
    reason: string;
    startDate?: string | null;
    endDate?: string | null;
    items: BatchOverrideItem[];
}

export interface BatchCurationOverrideResult {
    created: number;
    skipped: number;
    createdIds: string[];
    skippedReasons: string[];
}

/* ------------------------------------------------------------------ *
 * Featured content (full CRUD)
 * ------------------------------------------------------------------ */

export interface AdminFeaturedDto {
    id: string;
    contentId: string;
    contentType: string;
    section: string;
    title: string;
    subtitle?: string | null;
    imageUrl?: string | null;
    actionUrl?: string | null;
    displayOrder: number;
    isActive: boolean;
    startDate?: string | null;
    endDate?: string | null;
    genreId?: string | null;
    createdByUserId: string;
    createdAt: string;
}

export interface UpsertFeaturedRequest {
    contentId: string;
    contentType: string;
    section: string;
    title: string;
    subtitle?: string | null;
    imageUrl?: string | null;
    actionUrl?: string | null;
    displayOrder: number;
    startDate?: string | null;
    endDate?: string | null;
    genreId?: string | null;
}

export interface FeaturedQuery {
    section?: string;
    activeOnly?: boolean;
}

/* ------------------------------------------------------------------ *
 * Leaderboards (configs / exclusions / preview)
 * ------------------------------------------------------------------ */

export interface AdminLeaderboardConfigDto {
    id: string;
    leaderboardType: string;
    displayName: string;
    isEnabled: boolean;
    eligibilityPeriod: string;
    mode: string;
    updatedByUserId?: string | null;
    updatedAt?: string | null;
}

export interface UpsertLeaderboardConfigRequest {
    displayName: string;
    isEnabled: boolean;
    eligibilityPeriod: string;
    mode: string;
}

export interface AdminLeaderboardExclusionDto {
    id: string;
    leaderboardType: string;
    entityId: string;
    entityType: string;
    reason: string;
    createdByUserId: string;
    createdAt: string;
}

export interface CreateLeaderboardExclusionRequest {
    leaderboardType: string;
    entityId: string;
    entityType: string;
    reason: string;
}

export interface LeaderboardExclusionQuery {
    leaderboardType?: string;
}

export interface LeaderboardPreviewQuery {
    period?: string;
    take?: number;
}
