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
export type VerificationEntityType = 'artist' | 'label' | 'contributor' | 'ad_manager';

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

/** Role-appropriate headline numbers for a user row (only the fields matching the role are set). */
export interface AdminUserMetricsDto {
    // artist / dj / creator / podcaster
    followers?: number;
    tracks?: number;
    earningsMinor?: number;
    // record label
    rosterCount?: number;
    tradingName?: string;
    // fan
    coinBalance?: number;
    medal?: string;
    giftsSentCount?: number;
    // ad manager
    companyName?: string;
    activeCampaigns?: number;
    adSpendMinor?: number;
    // contributor
    activeSplits?: number;
    currency?: string;
}

export interface AdminUserDto {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    status: AccountStatus;
    isVerified: boolean;
    isDeleted: boolean;
    createdAt: string;
    lastActiveAt?: string;
    metrics?: AdminUserMetricsDto;
}

export interface AdminUsersSummaryDto {
    total: number;
    active: number;
    suspended: number;
    pending: number;
    verified: number;
    newLast30Days: number;
    deleted: number;
}

export interface UserAuditEntryDto {
    id: string;
    action: string;
    summary: string;
    actorName: string;
    createdAt: string;
}

export interface VerificationSummaryDto {
    entityType: VerificationEntityType;
    pending: number;
    verified: number;
    rejected: number;
    oldestPendingSubmittedAt?: string;
}

/* ---- Role-discriminated profile detail (admin user page) ---- */

export interface AccountSecuritySummaryDto {
    isEmailVerified: boolean;
    phoneVerified: boolean;
    onboardingCompleted: boolean;
    lastLoginAt?: string;
}

export interface VerificationBlockDto {
    status: VerificationStatus;
    submittedAt?: string;
    reviewedAt?: string;
    rejectionReason?: string;
    documents: VerificationDocumentDto[];
}

export interface AdminAddressDto {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}

export interface AdminFanProfileDto {
    username?: string;
    displayName?: string;
    bio?: string;
    gender?: string;
    dateOfBirth?: string;
    country?: string;
    state?: string;
    preferredGenres?: string;
    coinBalance: number;
    totalCoinsPurchased: number;
    totalCoinsSpent: number;
    totalGiftsSentValue: number;
    totalGiftsSentCount: number;
    totalUnlocksCount: number;
    followingCount: number;
    followerCount: number;
    currentMedal: string;
}

export interface AdminRecentUploadDto {
    id: string;
    title: string;
    status: string;
    createdAt: string;
}

export interface AdminCreatorProfileDto {
    performingName: string;
    bio?: string;
    country?: string;
    state?: string;
    website?: string;
    socialLinks: Record<string, string | undefined>;
    verification: VerificationBlockDto;
    followerCount: number;
    trackCount: number;
    totalEarningsMinor: number;
    currency: string;
    uploads: number;
    recentUploads: AdminRecentUploadDto[];
}

export interface AdminDirectorDto {
    fullName: string;
    email: string;
    phoneNumber?: string;
    position: string;
    isPrimaryContact: boolean;
    hasIdentityDocument: boolean;
}

export interface AdminRosterMemberDto {
    userId: string;
    name: string;
    avatarUrl?: string;
    status: AccountStatus;
}

export interface AdminLabelProfileDto {
    legalName: string;
    tradingName?: string;
    natureOfBusiness: string;
    registrationNumber?: string;
    website?: string;
    logoUrl?: string;
    address?: AdminAddressDto;
    socialLinks: Record<string, string | undefined>;
    verification: VerificationBlockDto;
    directors: AdminDirectorDto[];
    artistCount: number;
    roster: AdminRosterMemberDto[];
    uploads: number;
}

export interface AdminAdManagerProfileDto {
    companyName?: string;
    businessPhone?: string;
    website?: string;
    industry?: string;
    businessAddress?: AdminAddressDto;
    verification: VerificationBlockDto;
    totalAdSpendMinor: number;
    activeCampaignCount: number;
    totalCampaignCount: number;
}

export interface AdminContributorSplitDto {
    trackId: string;
    trackTitle: string;
    artistName: string;
    percent: number;
    isActive: boolean;
}

export interface AdminContributorProfileDto {
    displayName: string;
    legalName?: string;
    country?: string;
    verification: VerificationBlockDto;
    activeSplitCount: number;
    splits: AdminContributorSplitDto[];
}

export interface AdminUserProfileDto {
    role: UserRole;
    account: AccountSecuritySummaryDto;
    fan?: AdminFanProfileDto;
    creator?: AdminCreatorProfileDto;
    label?: AdminLabelProfileDto;
    adManager?: AdminAdManagerProfileDto;
    contributor?: AdminContributorProfileDto;
}

export interface AdminUserDetailDto extends AdminUserDto {
    verificationStatus: VerificationStatus;
    verificationRejectionReason?: string;
    phoneNumber?: string;
    country?: string;
    suspendedAt?: string;
    suspendedReason?: string;
    deletedAt?: string;
    deletedReason?: string;
    stats: {
        uploads?: number;
        rosterCount?: number;
        totalRevenueMinor?: number;
        currency?: string;
    };
}

export interface UserQuery {
    role?: UserRole | 'All';
    status?: AccountStatus | 'All' | 'Deleted';
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
    /**
     * Snake_case platform role of the ticket opener. When set, the backend
     * filters tickets to users of that role (CR1 per-role support queues).
     */
    role?: string;
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

    /** When a moderator last issued a non-terminal warning, if any. */
    warnedAt?: string | null;

    /** The most recent warning note from a moderator, if any. */
    warningNote?: string | null;

    // Duplicate-detection context (populated only for automated duplicate reports).
    /** True when the report was opened by the automated duplicate-detection screen. */
    isAutomatedDuplicateReport?: boolean;
    /** Confidence tier of the duplicate match ("Exact" | "High" | "Medium"). */
    duplicateTier?: 'Exact' | 'High' | 'Medium' | 'Low' | null;
    /** Similarity score of the duplicate match, 0..1. */
    duplicateScore?: number | null;
    /** Existing catalog track/video the flagged content matched. */
    duplicateMatchedContentId?: string | null;
    /** Artist's dispute explanation, if they have disputed the flag. */
    artistDisputeNote?: string | null;
    /** When the artist submitted their dispute, if any. */
    disputedAt?: string | null;
}

export interface ModerationQuery {
    status?: ModerationStatus | 'All';
    type?: ModerationContentType | 'All';
    search?: string;
    /**
     * Snake_case platform role of the flagged content's owner. When set, the
     * backend filters reports to content owned by users of that role (CR1
     * per-role moderation queues).
     */
    ownerRole?: string;
    page?: number;
    pageSize?: number;
}

export type ModerationPageDto = PagedResult<ModerationItemDto>;
