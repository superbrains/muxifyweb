/* ------------------------------------------------------------------ *
 * Support & Governance admin types (Phase 3 Group 8). Mirror the backend
 * `/admin/governance/*`, `/admin/labels/*` and `/admin/onboarding/*` DTOs.
 * Enum-ish fields serialise as strings; payloads are camelCase. Reuses the
 * generic {@link PagedResult} envelope. `import type` only.
 * ------------------------------------------------------------------ */

import type { PagedResult } from './index';

/* ------------------------------------------------------------------ *
 * Audit Trail (GET /admin/governance/audit-trail)
 * ------------------------------------------------------------------ */

export interface AuditTrailEntryDto {
    id: string;
    actorUserId: string;
    actorName: string;
    action: string;
    targetType: string;
    targetId?: string | null;
    summary: string;
    metadataJson?: string | null;
    beforeJson?: string | null;
    afterJson?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: string;
}

export interface AuditTrailQuery {
    action?: string;
    actorId?: string;
    targetType?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
}

export type AuditTrailPage = PagedResult<AuditTrailEntryDto>;

/* ------------------------------------------------------------------ *
 * Compliance (GET /admin/governance/compliance)
 * ------------------------------------------------------------------ */

export interface ComplianceSummaryDto {
    pendingArtistVerifications: number;
    pendingLabelVerifications: number;
    pendingAdvertiserVerifications: number;
    openDisputes: number;
    frozenSplits: number;
    restrictedTracks: number;
    pendingContentReports: number;
    suspendedUsers: number;
    pendingFinanceApprovals: number;
    generatedAt: string;
}

/* ------------------------------------------------------------------ *
 * Record Label Operations (GET /admin/labels, /admin/labels/{userId})
 * ------------------------------------------------------------------ */

export interface LabelListItemDto {
    userId: string;
    name: string;
    email: string;
    rosterCount: number;
    pendingInviteCount: number;
    pendingApprovalWithdrawals: number;
    createdAt: string;
}

export interface LabelRosterEntryDto {
    artistUserId: string;
    artistName: string;
    acceptedAt?: string | null;
}

export interface LabelPendingInviteDto {
    id: string;
    inviteeEmail: string;
    status: string;
    expiresAt: string;
}

export interface LabelDetailDto {
    userId: string;
    name: string;
    email: string;
    createdAt: string;
    roster: LabelRosterEntryDto[];
    pendingInvites: LabelPendingInviteDto[];
    pendingApprovalWithdrawalCount: number;
}

export interface LabelOpsQuery {
    search?: string;
    page?: number;
    pageSize?: number;
}

export type LabelListPage = PagedResult<LabelListItemDto>;

/* ------------------------------------------------------------------ *
 * Onboarding & Empty-State (GET /admin/onboarding/stuck, POST nudge)
 * ------------------------------------------------------------------ */

export type StuckReason = 'IncompleteOnboarding' | 'NoContent' | 'Inactive';

export interface StuckUserDto {
    userId: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: string;
    lastLoginAt?: string | null;
    onboardingCompleted: boolean;
    hasProfile: boolean;
    contentCount: number;
    stuckReasons: string[];
}

export interface StuckUserQuery {
    reason?: string;
    role?: string;
    page?: number;
    pageSize?: number;
}

export type StuckUserPage = PagedResult<StuckUserDto>;

export interface NudgeRequest {
    title?: string;
    message: string;
}

/* ------------------------------------------------------------------ *
 * Filter option vocab (drives the page selects)
 * ------------------------------------------------------------------ */

export const STUCK_REASON_OPTIONS = [
    { value: 'All', label: 'All reasons' },
    { value: 'IncompleteOnboarding', label: 'Incomplete onboarding' },
    { value: 'NoContent', label: 'No content' },
    { value: 'Inactive', label: 'Inactive' },
];

export const ONBOARDING_ROLE_OPTIONS = [
    { value: 'All', label: 'All roles' },
    { value: 'artist', label: 'Artist' },
    { value: 'dj', label: 'DJ' },
    { value: 'creator', label: 'Creator' },
    { value: 'podcaster', label: 'Podcaster' },
    { value: 'record_label', label: 'Record label' },
    { value: 'contributor', label: 'Contributor' },
    { value: 'ad_manager', label: 'Ad manager' },
    { value: 'fan', label: 'Fan' },
];

/** Friendly label for a stuck-reason string. */
export const stuckReasonLabel = (reason: string): string => {
    switch (reason) {
        case 'IncompleteOnboarding':
            return 'Incomplete onboarding';
        case 'NoContent':
            return 'No content';
        case 'Inactive':
            return 'Inactive';
        default:
            return reason;
    }
};
