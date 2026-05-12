export type VerificationStatus =
    | 'NotSubmitted'
    | 'Pending'
    | 'Verified'
    | 'Rejected';

export interface LabelSummaryDto {
    rosterCount: number;
    releasesLast30d: number;
    mtdRevenueMinor: number;
    currency: string;
    pendingPayoutsCount: number;
    pendingPayoutsAmountMinor: number;
    streamsLast30d: number;
    verificationStatus: VerificationStatus;
    verificationRejectionReason?: string;
    verificationSubmittedAt?: string;
}

export interface RosterArtistDto {
    artistUserId: string;
    performingName: string;
    fullName: string;
    avatarUrl?: string;
    isVerified: boolean;
    monthlyStreams: number;
    monthlyRevenueMinor: number;
    joinedAt: string;
}

export interface InvitationDto {
    id: string;
    email: string;
    status: 'Pending' | 'Accepted' | 'Declined' | 'Revoked' | 'Expired';
    createdAt: string;
    expiresAt: string;
    acceptedAt?: string;
    revokedAt?: string;
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

export type SplitRecipientRole = 'Artist' | 'Label' | 'Featured';

export interface ReleaseSplitDto {
    recipientUserId: string;
    recipientName: string;
    recipientRole: SplitRecipientRole;
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

export interface TriggerPayoutResponse {
    batchId: string;
    payoutCount: number;
    totalAmountMinor: number;
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

export interface LabelReleaseDto {
    trackId: string;
    title: string;
    artistUserId: string;
    artistName: string;
    coverArtUrl?: string;
    releasedAt: string;
    streams: number;
}
