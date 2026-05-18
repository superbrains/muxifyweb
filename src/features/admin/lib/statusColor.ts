import type {
    AccountStatus,
    ModerationStatus,
    TicketPriority,
    TicketStatus,
    VerificationStatus,
} from '../types';

/**
 * Shared status-pill colour maps for the admin console. Mirrors the
 * `payoutStatusColor` pattern used by the record-label UI (bg + foreground +
 * accent dot) so every admin badge feels native to the Muxify palette.
 */
export interface StatusStyle {
    bg: string;
    color: string;
    dot: string;
    label: string;
}

const VERIFICATION: Record<VerificationStatus, StatusStyle> = {
    Verified: { bg: '#E7FFF7', color: '#0F7B5C', dot: '#16A34A', label: 'Verified' },
    Pending: { bg: '#FFF9E6', color: '#92660C', dot: '#D97706', label: 'Pending' },
    Rejected: { bg: '#FEF2F2', color: '#C53030', dot: '#E53E3E', label: 'Rejected' },
    NotSubmitted: { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8', label: 'Not submitted' },
};

const ACCOUNT: Record<AccountStatus, StatusStyle> = {
    Active: { bg: '#E7FFF7', color: '#0F7B5C', dot: '#16A34A', label: 'Active' },
    Pending: { bg: '#FFF9E6', color: '#92660C', dot: '#D97706', label: 'Pending' },
    Suspended: { bg: '#FEF2F2', color: '#C53030', dot: '#E53E3E', label: 'Suspended' },
    Deactivated: { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8', label: 'Deactivated' },
};

const TICKET: Record<TicketStatus, StatusStyle> = {
    Open: { bg: '#ECF7FF', color: '#1D4ED8', dot: '#3B82F6', label: 'Open' },
    InProgress: { bg: '#FFF9E6', color: '#92660C', dot: '#D97706', label: 'In progress' },
    Resolved: { bg: '#E7FFF7', color: '#0F7B5C', dot: '#16A34A', label: 'Resolved' },
    Closed: { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8', label: 'Closed' },
};

const PRIORITY: Record<TicketPriority, StatusStyle> = {
    Urgent: { bg: '#FEF2F2', color: '#C53030', dot: '#E53E3E', label: 'Urgent' },
    High: { bg: '#FFF3EC', color: '#C2410C', dot: '#F97316', label: 'High' },
    Normal: { bg: '#ECF7FF', color: '#1D4ED8', dot: '#3B82F6', label: 'Normal' },
    Low: { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8', label: 'Low' },
};

const MODERATION: Record<ModerationStatus, StatusStyle> = {
    Pending: { bg: '#FFF9E6', color: '#92660C', dot: '#D97706', label: 'Pending' },
    Resolved: { bg: '#E7FFF7', color: '#0F7B5C', dot: '#16A34A', label: 'Resolved' },
    Dismissed: { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8', label: 'Dismissed' },
};

const FALLBACK: StatusStyle = {
    bg: '#F1F5F9',
    color: '#64748B',
    dot: '#94A3B8',
    label: '—',
};

export const verificationStatusStyle = (s: VerificationStatus): StatusStyle =>
    VERIFICATION[s] ?? FALLBACK;

export const accountStatusStyle = (s: AccountStatus): StatusStyle =>
    ACCOUNT[s] ?? FALLBACK;

export const ticketStatusStyle = (s: TicketStatus): StatusStyle =>
    TICKET[s] ?? FALLBACK;

export const ticketPriorityStyle = (p: TicketPriority): StatusStyle =>
    PRIORITY[p] ?? FALLBACK;

export const moderationStatusStyle = (s: ModerationStatus): StatusStyle =>
    MODERATION[s] ?? FALLBACK;

export const VERIFICATION_STATUSES: readonly VerificationStatus[] = [
    'Pending',
    'Verified',
    'Rejected',
    'NotSubmitted',
];

export const ACCOUNT_STATUSES: readonly AccountStatus[] = [
    'Active',
    'Pending',
    'Suspended',
    'Deactivated',
];

export const TICKET_STATUSES: readonly TicketStatus[] = [
    'Open',
    'InProgress',
    'Resolved',
    'Closed',
];

export const TICKET_PRIORITIES: readonly TicketPriority[] = [
    'Urgent',
    'High',
    'Normal',
    'Low',
];

export const MODERATION_STATUSES: readonly ModerationStatus[] = [
    'Pending',
    'Resolved',
    'Dismissed',
];

/** Human label for a `UserRole` value. */
export const roleLabel = (role: string): string => {
    const map: Record<string, string> = {
        artist: 'Artist',
        dj: 'DJ',
        creator: 'Creator',
        record_label: 'Record Label',
        ad_manager: 'Ad Manager',
        fan: 'Fan',
        admin: 'Admin',
    };
    return map[role] ?? role;
};
