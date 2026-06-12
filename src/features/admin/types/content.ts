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
    /** Cover art / thumbnail URL — set for all kinds when available. */
    coverArtUrl?: string;
    /** Duration in seconds — set for tracks and videos only. */
    durationSeconds?: number;
    /** Track count — set for albums and playlists only. */
    trackCount?: number;
}

/** A track row inside an album or playlist detail. */
export interface ContentTrackRowDto {
    id: string;
    title: string;
    artistName: string;
    durationSeconds: number;
    trackNumber: number;
    status: string;
    isPublished: boolean;
    coverArtUrl?: string;
}

/** Duplicate-review summary attached to a content detail response. */
export interface DuplicateMatchSummaryDto {
    id: string;
    status: string;
    tier: string;
    score: number;
    matchMethod: string;
    isDisputed: boolean;
    artistDisputeNote?: string;
}

export interface ContentItemDetailDto {
    item: ContentItemDto;
    ownerEmail?: string;
    ownerAvatarUrl?: string;
    description?: string;
    reportCount: number;
    openReportCount: number;
    duplicateMatch?: DuplicateMatchSummaryDto;
    durationSeconds: number;
    albumId?: string;
    // Track-specific
    isrc?: string;
    upc?: string;
    bpm?: number;
    musicalKey?: string;
    bitrate?: number;
    featuredArtists: string[];
    // Video-specific
    resolution?: string;
    fps?: number;
    // Album-specific
    label?: string;
    copyright?: string;
    // Album / playlist track list
    tracks: ContentTrackRowDto[];
}

/** KPI counts for content library section headers. */
export interface ContentStatsDto {
    total: number;
    published: number;
    restricted: number;
    heldForReview: number;
    failed: number;
    newLast7Days: number;
}

/** KPI counts for the upload workflow page. */
export interface UploadStatsDto {
    processing: number;
    failed: number;
    sessionsActive: number;
    sessionsToday: number;
}

/** KPI counts for the lyrics management page. */
export interface LyricsStatsDto {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

/** KPI counts for duplicate detection / copyright review. */
export interface DuplicateStatsDto {
    total: number;
    pending: number;
    confirmed: number;
    disputed: number;
    highOrExactPending: number;
}

/** KPI counts for a per-role moderation queue. */
export interface ModerationStatsDto {
    pending: number;
    disputed: number;
    resolved: number;
    dismissed: number;
}

/** A single admin audit entry for the content item history tab. */
export interface ContentAuditEntryDto {
    id: string;
    action: string;
    summary: string;
    actorName?: string;
    timestamp: string;
}

/** An upload session with linked content summary. */
export interface UploadSessionDetailDto {
    session: UploadSessionDto;
    linkedContentTitle?: string;
    linkedContentKind?: string;
    linkedContentCoverArtUrl?: string;
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
    userId: string;
    userName?: string;
    mediaType: string;
    originalFileName: string;
    contentType: string;
    sizeBytes: number;
    status: string;
    expiresAt: string;
    createdTrackId?: string;
    createdVideoId?: string;
    failureReason?: string;
    createdAt: string;
}

export interface ProcessingItemDto {
    id: string;
    kind: string;
    title: string;
    ownerId: string;
    ownerName?: string;
    status: string;
    stage?: string;
    processingError?: string;
    errorMessage?: string;
    createdAt: string;
    updatedAt?: string;
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
    detectorProvider: string;
    status: string;
    suspectContentId?: string;
    suspectTitle?: string;
    suspectOwnerId?: string;
    suspectOwnerName?: string;
    matchedContentId?: string;
    matchedTitle?: string;
    matchedOwnerId?: string;
    matchedOwnerName?: string;
    artistDisputeNote?: string;
    isDisputed: boolean;
    disputedAtUtc?: string;
    contentReportId?: string;
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
