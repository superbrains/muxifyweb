export type VerificationStatus =
    | 'NotSubmitted'
    | 'Pending'
    | 'Verified'
    | 'Rejected';

export interface LabelSummaryDto {
    rosterCount: number;
    releasesLast30d: number;
    mtdRevenueMinor: number;
    prevMonthRevenueMinor: number;
    currency: string;
    pendingPayoutsCount: number;
    pendingPayoutsAmountMinor: number;
    streamsLast30d: number;
    rosterGrowthLast30d: number;
    verificationStatus: VerificationStatus;
    verificationRejectionReason?: string;
    verificationSubmittedAt?: string;
}

export type RosterOnboardingStatus = 'Active' | 'PendingOnboarding';

export interface RosterArtistDto {
    artistUserId: string;
    performingName: string;
    fullName: string;
    avatarUrl?: string;
    isVerified: boolean;
    monthlyStreams: number;
    monthlyRevenueMinor: number;
    joinedAt: string;
    onboardingStatus: RosterOnboardingStatus;
}

export type RosterEntryStatus =
    | 'Active'
    | 'PendingOnboarding'
    | 'Invited'
    | 'Declined'
    | 'Expired'
    | 'Revoked'
    | 'Deactivated';

export type RosterEntryKind = 'Roster' | 'Invitation';

/**
 * Unified roster-page row. A "Roster" entry is a current roster member (Active or
 * PendingOnboarding); an "Invitation" entry is a sent invite that hasn't joined the
 * roster (Invited / Declined / Expired / Revoked) or a previously-deactivated artist
 * (Deactivated, with an artistUserId so they can be reactivated).
 */
export interface RosterEntryDto {
    kind: RosterEntryKind;
    artistUserId?: string;
    invitationId?: string;
    displayName: string;
    email?: string;
    avatarUrl?: string;
    isVerified: boolean;
    monthlyStreams: number;
    monthlyRevenueMinor: number;
    joinedAt?: string;
    invitedAt?: string;
    expiresAt?: string;
    deactivatedAt?: string;
    status: RosterEntryStatus;
}

export interface InviteArtistRequest {
    email: string;
    personalNote?: string;
}

export interface InviteArtistResponse {
    invitationId: string;
    expiresAt: string;
    /**
     * Accept URL containing the raw token. The backend dispatches the email
     * fire-and-forget (matching the OTP-verification pattern), so this URL is
     * returned as a reliable copy-paste fallback that the label can share
     * directly with the artist.
     */
    acceptUrl: string;
}

export interface AcceptInvitationRequest {
    token: string;
}

export interface AcceptInvitationResponse {
    labelUserId: string;
    labelName: string;
}

export interface InvitationLookupResponse {
    inviteeEmail: string;
    labelName: string;
    personalNote?: string;
    expiresAt: string;
    status: 'Pending' | 'Accepted' | 'Declined' | 'Revoked' | 'Expired';
    userExists: boolean;
}

export type SplitRecipientRole =
    | 'Artist'
    | 'Label'
    | 'Featured'
    | 'Producer'
    | 'Songwriter';

export const SPLIT_ROLES: readonly SplitRecipientRole[] = [
    'Artist',
    'Label',
    'Featured',
    'Producer',
    'Songwriter',
];

export type SplitAccountType = 'Artist' | 'Label' | 'Other';

export interface ReleaseSplitDto {
    recipientUserId: string;
    recipientName: string;
    recipientAvatarUrl?: string;
    recipientRole: SplitRecipientRole;
    accountType: SplitAccountType;
    isVerified: boolean;
    percentBps: number;
}

export interface ReleaseSplitsDto {
    trackId: string;
    totalBps: number;
    splits: ReleaseSplitDto[];
}

export interface SetSplitsRequest {
    splits: Array<{
        recipientUserId: string;
        recipientRole: SplitRecipientRole;
        percentBps: number;
    }>;
}

export type PayoutStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed';

export interface PayoutDto {
    id: string;
    batchId: string;
    recipientArtistUserId: string;
    recipientName: string;
    amountMinor: number;
    currency: string;
    status: PayoutStatus;
    initiatedAt: string;
    completedAt?: string;
    failureReason?: string;
}

export type PayoutPeriod = 'mtd' | 'last-month' | 'custom';

export interface TriggerPayoutRequest {
    period: PayoutPeriod;
    from?: string;
    to?: string;
    artistIds?: string[];
}

/**
 * One batch per distinct currency produced by a single trigger call. A label with
 * NGN-only earnings yields one entry; mixed-currency earnings yield one entry per
 * currency. Each entry is mono-currency by construction (backend invariant).
 */
export interface PayoutBatchSummary {
    batchId: string;
    currency: string;
    payoutCount: number;
    totalAmountMinor: number;
}

export interface TriggerPayoutResponse {
    batches: PayoutBatchSummary[];
}

/**
 * Frontend-side filters for the payouts list. Mirrors the backend query string
 * (`status`, `from`, `to`, `page`, `pageSize`). `search` is applied client-side
 * to the currently-loaded page.
 */
export interface PayoutsFilters {
    status?: PayoutStatus;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
    search?: string;
}

export interface LabelAnalyticsDto {
    range: { from: string; to: string; granularity: 'day' | 'week' | 'month' };
    streamsSeries: Array<{ bucket: string; streams: number }>;
    revenueByArtist: Array<{
        artistUserId: string;
        name: string;
        revenueMinor: number;
        streams: number;
    }>;
    topTracks: Array<{
        trackId: string;
        title: string;
        artistName: string;
        streams: number;
        revenueMinor: number;
    }>;
}

export type ReleaseKind = 'track' | 'video';

export type ReleaseStatus =
    | 'Draft'
    | 'Scheduled'
    | 'Live'
    | 'Processing'
    | 'Failed';

export type ReleaseTypeName =
    | 'Single'
    | 'EP'
    | 'Album'
    | 'Mix'
    | 'Compilation'
    | 'MusicVideo';

export type UploadSource = 'Artist' | 'Label';

export interface LabelReleaseDto {
    id: string;
    kind: ReleaseKind;
    title: string;
    artistUserId: string;
    artistName: string;
    coverArtUrl?: string;
    releaseDate?: string;
    createdAt: string;
    streams: number;
    status: ReleaseStatus;
    releaseType: ReleaseTypeName;
    albumId?: string;
    albumTitle?: string;
    uploadSource: UploadSource;
    isPublished: boolean;
    splitsComplete: boolean;
}

export interface LabelReleasesPageDto {
    items: LabelReleaseDto[];
    total: number;
    page: number;
    pageSize: number;
}

export type ReleaseSortKey = 'recent' | 'streams' | 'title';

export interface ReleaseFilters {
    kind?: 'all' | ReleaseKind;
    status?: ReleaseStatus[];
    artistIds?: string[];
    search?: string;
    sort?: ReleaseSortKey;
    page?: number;
    pageSize?: number;
}

export interface LabelReleaseSummaryDto {
    total: number;
    live: number;
    scheduled: number;
    drafts: number;
    processing: number;
    musicVideos: number;
    streamsLast30d: number;
    streamsPrev30d: number;
}
