import type { PagedResult } from './index';

/* ------------------------------------------------------------------ *
 * Content library (Towers 5/6/7) — tracks / videos / albums / playlists
 * ------------------------------------------------------------------ */

/** The four content kinds the library can list. */
export type ContentKind = 'track' | 'video' | 'album' | 'playlist';

/**
 * A row in the unified content library list. Spans every content kind; some
 * fields are populated only for the relevant kind (`releaseType`/`videoType`/
 * `genreName`).
 */
export interface ContentItemDto {
    id: string;
    kind: ContentKind;
    title: string;
    ownerId: string;
    ownerName: string;
    /** Snake_case platform role of the owner, e.g. `artist`, `podcaster`. */
    ownerRole: string;
    status: string;
    isPublished: boolean;
    isRestricted: boolean;
    heldForDuplicateReview: boolean;
    /** Tracks only: Single / EP / Album / Compilation / Mix. */
    releaseType?: string;
    /** Videos only. */
    videoType?: string;
    genreName?: string;
    /** Plays / views depending on kind. */
    metricCount: number;
    likeCount: number;
    releaseDate?: string;
    createdAt: string;
}

/** Owner block on a content detail response. */
export interface ContentOwnerDto {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
}

/** Duplicate-review summary attached to a content detail response. */
export interface ContentDuplicateSummaryDto {
    heldForReview: boolean;
    matchCount: number;
    topTier?: string;
    topScore?: number;
}

export interface ContentItemDetailDto {
    item: ContentItemDto;
    reportCount: number;
    duplicate: ContentDuplicateSummaryDto;
    owner: ContentOwnerDto;
}

export interface ContentItemQuery {
    kind?: ContentKind;
    status?: string;
    releaseType?: string;
    videoType?: string;
    ownerRole?: string;
    genreId?: string;
    search?: string;
    published?: boolean;
    sort?: string;
    page?: number;
    pageSize?: number;
}

export type ContentItemPageDto = PagedResult<ContentItemDto>;

/* ------------------------------------------------------------------ *
 * Uploads & processing (Tower 23)
 * ------------------------------------------------------------------ */

export interface UploadSessionDto {
    id: string;
    ownerId: string;
    ownerName: string;
    ownerRole: string;
    kind: string;
    title?: string;
    status: string;
    createdAt: string;
    completedAt?: string;
}

export interface ProcessingItemDto {
    id: string;
    kind: string;
    title: string;
    ownerId: string;
    ownerName: string;
    status: string;
    stage?: string;
    errorMessage?: string;
    createdAt: string;
}

export interface UploadSessionQuery {
    status?: string;
    page?: number;
    pageSize?: number;
}

export interface ProcessingQuery {
    kind?: string;
    /** `processing` or `failed`. */
    status?: 'processing' | 'failed';
    page?: number;
    pageSize?: number;
}

export type UploadSessionPageDto = PagedResult<UploadSessionDto>;
export type ProcessingItemPageDto = PagedResult<ProcessingItemDto>;

/* ------------------------------------------------------------------ *
 * Duplicate detection / copyright (Towers 27/28)
 * ------------------------------------------------------------------ */

export interface DuplicateMatchDto {
    id: string;
    mediaType: string;
    tier: string;
    score: number;
    matchMethod: string;
    status: string;
    suspectTitle: string;
    suspectOwnerName: string;
    matchedTitle: string;
    matchedOwnerName: string;
    artistDisputeNote?: string;
    isDisputed: boolean;
    createdAt: string;
}

export interface DuplicateMatchQuery {
    status?: string;
    tier?: string;
    mediaType?: string;
    disputedOnly?: boolean;
    page?: number;
    pageSize?: number;
}

export type DuplicateMatchPageDto = PagedResult<DuplicateMatchDto>;

/* ------------------------------------------------------------------ *
 * Lyrics (Tower 6 — lyrics management)
 * ------------------------------------------------------------------ */

export interface LyricsDto {
    id: string;
    trackId: string;
    trackTitle: string;
    ownerName: string;
    content: string;
    format: string;
    language: string;
    source: string;
    status: string;
    rejectionReason?: string;
    createdAt: string;
}

export interface LyricsQuery {
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface CreateLyricsPayload {
    trackId: string;
    content: string;
    format?: string;
    language: string;
}

export type LyricsPageDto = PagedResult<LyricsDto>;
