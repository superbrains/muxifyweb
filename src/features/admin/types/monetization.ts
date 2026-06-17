/* ------------------------------------------------------------------ *
 * Monetization admin types (Phase 3 Group 5) — mirror the backend
 * `/admin/monetization`, `/admin/royalties`, `/admin/sponsorships` and
 * `/admin/disputes` DTOs. Enum-ish fields are typed as `string` so the UI
 * tolerates whatever the backend emits (enums are serialised as strings).
 * ------------------------------------------------------------------ */

import type { PagedResult } from './index';

/* ------------------------------------------------------------------ *
 * Enum string vocab (kept as plain `string` on DTOs; these unions and
 * option arrays drive the filter selects + lifecycle action labels).
 * ------------------------------------------------------------------ */

export type SponsorshipStatus =
    | 'Pending'
    | 'Approved'
    | 'Active'
    | 'Rejected'
    | 'Completed'
    | 'Cancelled';

export type SponsoredContentType = 'Track' | 'Video';

export type DisputeStatus =
    | 'Open'
    | 'UnderReview'
    | 'AwaitingInfo'
    | 'Resolved'
    | 'Rejected'
    | 'Escalated';

export type DisputeType = 'Refund' | 'Chargeback' | 'Reversal' | 'Complaint';

export type DisputeSubjectType =
    | 'CoinPurchase'
    | 'Gift'
    | 'Unlock'
    | 'Withdrawal'
    | 'AdCampaign'
    | 'AdWallet'
    | 'Other';

export type SplitDisputeStatus = 'None' | 'UnderReview' | 'Resolved';

export type SplitRecipientRole = 'Artist' | 'Label' | 'Featured' | 'Producer' | 'Songwriter';

export const SPONSORSHIP_STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Active', label: 'Active' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
];

export const SPONSORED_CONTENT_TYPE_OPTIONS = [
    { value: 'All', label: 'All content' },
    { value: 'Track', label: 'Track' },
    { value: 'Video', label: 'Video' },
];

export const DISPUTE_STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Open', label: 'Open' },
    { value: 'UnderReview', label: 'Under review' },
    { value: 'AwaitingInfo', label: 'Awaiting info' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Escalated', label: 'Escalated' },
];

export const DISPUTE_TYPE_OPTIONS = [
    { value: 'All', label: 'All types' },
    { value: 'Refund', label: 'Refund' },
    { value: 'Chargeback', label: 'Chargeback' },
    { value: 'Reversal', label: 'Reversal' },
    { value: 'Complaint', label: 'Complaint' },
];

export const DISPUTE_SUBJECT_TYPE_OPTIONS = [
    { value: 'All', label: 'All subjects' },
    { value: 'CoinPurchase', label: 'Coin purchase' },
    { value: 'Gift', label: 'Gift' },
    { value: 'Unlock', label: 'Unlock' },
    { value: 'Withdrawal', label: 'Withdrawal' },
    { value: 'AdCampaign', label: 'Ad campaign' },
    { value: 'AdWallet', label: 'Ad wallet' },
    { value: 'Other', label: 'Other' },
];

/** Subject types specific to advertising disputes (Group 7 reuse). */
export const AD_DISPUTE_SUBJECT_TYPE_OPTIONS = [
    { value: 'All', label: 'All ad subjects' },
    { value: 'AdCampaign', label: 'Ad campaign' },
    { value: 'AdWallet', label: 'Ad wallet' },
];

export const SPLIT_RECIPIENT_ROLE_OPTIONS: { value: string; label: string }[] = [
    { value: 'Artist', label: 'Artist' },
    { value: 'Label', label: 'Label' },
    { value: 'Featured', label: 'Featured' },
    { value: 'Producer', label: 'Producer' },
    { value: 'Songwriter', label: 'Songwriter' },
];

/* ------------------------------------------------------------------ *
 * Revenue / commission / royalties summaries (read-only)
 * ------------------------------------------------------------------ */

export interface DateRangeQuery {
    from?: string;
    to?: string;
}

export interface RevenueBySourceDto {
    source: string;
    amountMinor: number;
}

export interface RevenueSummaryDto {
    currency: string;
    grossFundingMinor: number;
    coinsSold: number;
    feesCollectedMinor: number;
    netRevenueMinor: number;
    purchaseCount: number;
    bySource: RevenueBySourceDto[];
}

export interface CommissionByTypeDto {
    earningType: string;
    commissionCoins: number;
    commissionMinor: number;
}

export interface CommissionSummaryDto {
    currency: string;
    totalCommissionCoins: number;
    totalCommissionMinor: number;
    earningCount: number;
    byType: CommissionByTypeDto[];
}

export interface RoyaltiesByRoleDto {
    role: string;
    allocatedMinor: number;
}

export interface RoyaltiesSummaryDto {
    currency: string;
    totalNetMinor: number;
    totalNetCoins: number;
    creatorCount: number;
    earningCount: number;
    byRole: RoyaltiesByRoleDto[];
}

/* ------------------------------------------------------------------ *
 * Royalty splits (tracks list / detail / edit / freeze / dispute)
 * ------------------------------------------------------------------ */

export interface RoyaltyTrackListItemDto {
    trackId: string;
    trackTitle: string;
    artistId: string;
    artistName: string;
    recipientCount: number;
    isFrozen: boolean;
    disputeStatus: string;
}

export interface RoyaltyRecipientDto {
    recipientUserId: string;
    recipientName: string;
    role: string;
    percentBps: number;
}

export interface RoyaltyAuditEntryDto {
    id: string;
    action: string;
    reason: string;
    actorUserId: string;
    beforeJson?: string | null;
    afterJson?: string | null;
    createdAt: string;
}

export interface RoyaltyTrackDetailDto {
    trackId: string;
    trackTitle: string;
    artistId: string;
    artistName: string;
    isFrozen: boolean;
    freezeReason?: string | null;
    disputeStatus: string;
    disputeReason?: string | null;
    recipients: RoyaltyRecipientDto[];
    audit: RoyaltyAuditEntryDto[];
}

export interface RoyaltyTracksQuery {
    search?: string;
    frozen?: boolean;
    page: number;
    pageSize: number;
}

export interface UpdateSplitsRequest {
    recipients: { recipientUserId: string; role: string; percentBps: number }[];
    reason?: string;
}

export interface ReasonRequest {
    reason: string;
}

/* ------------------------------------------------------------------ *
 * Commission configuration (editable platform fee + per-type overrides)
 * ------------------------------------------------------------------ */

export interface CommissionSettingsDto {
    currency: string;
    platformFeePercent: number;
    /** Per-type override for gifts; null = inherit the default. */
    giftFeePercent?: number | null;
    /** Per-type override for content unlocks; null = inherit the default. */
    contentUnlockFeePercent?: number | null;
}

export interface UpdateCommissionSettingsRequest {
    platformFeePercent: number;
    giftFeePercent?: number | null;
    contentUnlockFeePercent?: number | null;
}

/* ------------------------------------------------------------------ *
 * Per-artist commission waivers / discounts
 * ------------------------------------------------------------------ */

export interface CommissionWaiverDto {
    id: string;
    artistId: string;
    artistName: string;
    feePercent: number;
    reason: string;
    isActive: boolean;
    effectiveFrom: string;
    effectiveTo?: string | null;
    createdByUserId: string;
    createdAt: string;
}

export interface UpsertCommissionWaiverRequest {
    artistId: string;
    feePercent: number;
    reason: string;
    effectiveFrom?: string | null;
    effectiveTo?: string | null;
}

/* ------------------------------------------------------------------ *
 * Split templates (reusable split layouts) + contributor management
 * ------------------------------------------------------------------ */

export interface SplitTemplateRecipientDto {
    recipientUserId: string;
    role: string;
    percentBps: number;
}

export interface SplitTemplateDto {
    id: string;
    name: string;
    description?: string | null;
    recipients: SplitTemplateRecipientDto[];
    createdByUserId: string;
    createdAt: string;
}

export interface UpsertSplitTemplateRequest {
    name: string;
    description?: string | null;
    recipients: SplitTemplateRecipientDto[];
}

export interface ApplyTemplateRequest {
    templateId: string;
}

export interface AddContributorRequest {
    trackId: string;
    inviteeEmail: string;
    displayName: string;
    /** "Producer" or "Songwriter". */
    recipientRole: string;
    percentBps: number;
}

export interface EditContributorRequest {
    trackId: string;
    contributorUserId: string;
    percentBps: number;
}

export interface RemoveContributorRequest {
    trackId: string;
    contributorUserId: string;
}

/* ------------------------------------------------------------------ *
 * Sponsorships (CRUD + lifecycle)
 * ------------------------------------------------------------------ */

export interface SponsorshipDto {
    id: string;
    contentType: string;
    contentId: string;
    contentOwnerUserId: string;
    sponsorName: string;
    sponsorContact?: string | null;
    sponsorUserId?: string | null;
    amountMinor: number;
    currency: string;
    status: string;
    startDate?: string | null;
    endDate?: string | null;
    notes?: string | null;
    submittedByUserId: string;
    reviewedByUserId?: string | null;
    reviewedAt?: string | null;
    decisionReason?: string | null;
    createdAt: string;
    /** Optional enrichment on the detail endpoint. */
    contentTitle?: string | null;
    ownerName?: string | null;
}

export interface SponsorshipQuery {
    status?: string;
    contentType?: string;
    search?: string;
    page: number;
    pageSize: number;
}

export interface CreateSponsorshipRequest {
    contentType: string;
    contentId: string;
    contentOwnerUserId: string;
    sponsorName: string;
    sponsorContact?: string | null;
    sponsorUserId?: string | null;
    amountMinor: number;
    currency?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    notes?: string | null;
}

export interface UpdateSponsorshipRequest {
    sponsorName?: string | null;
    sponsorContact?: string | null;
    amountMinor?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    notes?: string | null;
}

/* ------------------------------------------------------------------ *
 * Refunds & disputes (case workflow)
 * ------------------------------------------------------------------ */

export interface DisputeListItemDto {
    id: string;
    reference: string;
    subjectType: string;
    subjectId?: string | null;
    type: string;
    status: string;
    raisedByUserId: string;
    amountMinor?: number | null;
    currency?: string | null;
    assignedToUserId?: string | null;
    createdAt: string;
}

export interface DisputeEventDto {
    id: string;
    action: string;
    actorUserId: string;
    note?: string | null;
    createdAt: string;
}

export interface DisputeDetailDto {
    id: string;
    reference: string;
    subjectType: string;
    subjectId?: string | null;
    type: string;
    status: string;
    raisedByUserId: string;
    againstUserId?: string | null;
    description?: string | null;
    amountMinor?: number | null;
    currency?: string | null;
    assignedToUserId?: string | null;
    resolvedByUserId?: string | null;
    resolvedAt?: string | null;
    resolutionNotes?: string | null;
    linkedTransactionId?: string | null;
    createdAt: string;
    events: DisputeEventDto[];
}

export interface DisputeQuery {
    status?: string;
    type?: string;
    subjectType?: string;
    search?: string;
    page: number;
    pageSize: number;
}

export interface CreateDisputeRequest {
    subjectType: string;
    subjectId?: string | null;
    type: string;
    raisedByUserId: string;
    description: string;
    againstUserId?: string | null;
    amountMinor?: number | null;
    currency?: string | null;
}

export interface AssignDisputeRequest {
    assigneeUserId: string;
    note?: string | null;
}

export interface DisputeStatusRequest {
    status: string;
    note?: string | null;
}

export interface DisputeNoteRequest {
    note: string;
}

export interface ResolveDisputeRequest {
    resolutionNotes: string;
    linkedTransactionId?: string | null;
}

export type RoyaltyTracksPage = PagedResult<RoyaltyTrackListItemDto>;
export type SponsorshipsPage = PagedResult<SponsorshipDto>;
export type DisputesPage = PagedResult<DisputeListItemDto>;
