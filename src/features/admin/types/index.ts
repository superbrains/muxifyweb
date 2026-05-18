import type { UserRole } from '@shared/types/user';

/* ------------------------------------------------------------------ *
 * Shared enums / unions
 * ------------------------------------------------------------------ */

/** Mirrors the backend `VerificationStatus` enum. */
export type VerificationStatus =
    | 'NotSubmitted'
    | 'Pending'
    | 'Verified'
    | 'Rejected';

/** Account lifecycle status (mirrors backend `UserStatus`). */
export type AccountStatus =
    | 'Pending'
    | 'Active'
    | 'Suspended'
    | 'Deactivated';

/** Which kind of profile a verification request belongs to. */
export type VerificationEntityType = 'artist' | 'label';

export type TicketStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type ModerationStatus = 'Pending' | 'Resolved' | 'Dismissed';
export type ModerationContentType = 'track' | 'video' | 'comment' | 'profile';
export type ModerationAction = 'dismiss' | 'remove' | 'warn' | 'suspend';

/** Generic paged envelope returned by every admin list endpoint. */
export interface PagedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

/* ------------------------------------------------------------------ *
 * Overview
 * ------------------------------------------------------------------ */

export interface AdminOverviewDto {
    totalUsers: number;
    usersByRole: {
        artist: number;
        recordLabel: number;
        fan: number;
        adManager: number;
        admin: number;
    };
    pendingVerifications: number;
    openTickets: number;
    flaggedContent: number;
    newSignups30d: number;
    activeSubscriptions: number;
    /** Directional change of `newSignups30d` vs the prior 30-day window. */
    signupsTrendPct: number;
    recentSignups: AdminUserDto[];
}

export type ActivityGranularity = 'day' | 'week' | 'month';

export interface ActivityRange {
    from: string;
    to: string;
    granularity: ActivityGranularity;
}

export interface AdminActivityDto {
    range: ActivityRange;
    signupsSeries: Array<{ bucket: string; count: number }>;
    streamsSeries: Array<{ bucket: string; streams: number }>;
}

/* ------------------------------------------------------------------ *
 * Verification Center
 * ------------------------------------------------------------------ */

export interface VerificationListItemDto {
    id: string;
    entityType: VerificationEntityType;
    /** Profile id (ArtistProfile / CompanyProfile). */
    entityId: string;
    applicantUserId: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
    status: VerificationStatus;
    submittedAt?: string;
    reviewedAt?: string;
}

export interface VerificationDocumentDto {
    kind: 'identity' | 'registration' | 'director-identity';
    label: string;
    url: string;
    /** Director name for `director-identity` documents. */
    ownerName?: string;
}

export interface VerificationDetailDto extends VerificationListItemDto {
    rejectionReason?: string;
    documents: VerificationDocumentDto[];
    /** Flat profile fields rendered as a read-only key/value list. */
    profile: Record<string, string | number | null | undefined>;
}

export interface VerificationQuery {
    entityType: VerificationEntityType;
    status?: VerificationStatus | 'All';
    search?: string;
    sort?: 'newest' | 'oldest';
    page?: number;
    pageSize?: number;
}

export type VerificationPageDto = PagedResult<VerificationListItemDto>;

/* ------------------------------------------------------------------ *
 * User Management
 * ------------------------------------------------------------------ */

export interface AdminUserDto {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    status: AccountStatus;
    isVerified: boolean;
    createdAt: string;
    lastActiveAt?: string;
}

export interface AdminUserDetailDto extends AdminUserDto {
    verificationStatus: VerificationStatus;
    verificationRejectionReason?: string;
    phoneNumber?: string;
    country?: string;
    suspendedAt?: string;
    suspendedReason?: string;
    stats: {
        uploads?: number;
        rosterCount?: number;
        totalRevenueMinor?: number;
        currency?: string;
    };
}

export interface UserQuery {
    role?: UserRole | 'All';
    status?: AccountStatus | 'All';
    verification?: VerificationStatus | 'All';
    search?: string;
    page?: number;
    pageSize?: number;
}

export type UserPageDto = PagedResult<AdminUserDto>;

/* ------------------------------------------------------------------ *
 * Support tickets
 * ------------------------------------------------------------------ */

export interface TicketDto {
    id: string;
    subject: string;
    requesterUserId: string;
    requesterName: string;
    priority: TicketPriority;
    status: TicketStatus;
    assigneeId?: string;
    assigneeName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TicketMessageDto {
    id: string;
    authorUserId: string;
    authorName: string;
    authorRole: UserRole;
    body: string;
    createdAt: string;
}

export interface TicketDetailDto extends TicketDto {
    messages: TicketMessageDto[];
}

export interface TicketQuery {
    status?: TicketStatus | 'All';
    priority?: TicketPriority | 'All';
    search?: string;
    page?: number;
    pageSize?: number;
}

export type TicketPageDto = PagedResult<TicketDto>;

/* ------------------------------------------------------------------ *
 * Content moderation
 * ------------------------------------------------------------------ */

export interface ModerationItemDto {
    id: string;
    contentType: ModerationContentType;
    contentId: string;
    contentTitle: string;
    reason: string;
    reporterUserId: string;
    reporterName: string;
    ownerUserId: string;
    ownerName: string;
    status: ModerationStatus;
    reportedAt: string;
}

export interface ModerationQuery {
    status?: ModerationStatus | 'All';
    type?: ModerationContentType | 'All';
    search?: string;
    page?: number;
    pageSize?: number;
}

export type ModerationPageDto = PagedResult<ModerationItemDto>;
