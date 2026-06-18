/**
 * Shared dispute vocabulary for the self-service (non-admin) dispute experience.
 *
 * The backend `DisputeSubjectType` enum is reused across roles; the frontend
 * groups those subjects into two human "families" — copyright (over a piece of
 * content) and payment (over money owed) — which drives the two-step raise flow.
 */

export type DisputeSubjectType =
    | 'Track'
    | 'Video'
    | 'Withdrawal'
    | 'Earning'
    | 'Split'
    | 'AdCampaign'
    | 'AdWallet'
    | 'Other';

export type DisputeStatus =
    | 'Open'
    | 'UnderReview'
    | 'AwaitingInfo'
    | 'Resolved'
    | 'Rejected'
    | 'Escalated';

export type DisputeFamily = 'copyright' | 'payment';

const COPYRIGHT_SUBJECTS: ReadonlySet<string> = new Set<DisputeSubjectType>([
    'Track',
    'Video',
    'AdCampaign',
]);

/** Which family a subject belongs to — copyright (content) or payment (money). */
export const familyOf = (subjectType: string): DisputeFamily =>
    COPYRIGHT_SUBJECTS.has(subjectType) ? 'copyright' : 'payment';

/** Friendly label for a subject type, shown in tables, drawers and chips. */
export const SUBJECT_LABEL: Record<string, string> = {
    Track: 'Track copyright',
    Video: 'Video copyright',
    AdCampaign: 'Ad creative',
    Withdrawal: 'Payout',
    Earning: 'Earning',
    Split: 'Royalty split',
    AdWallet: 'Ad wallet',
    Other: 'Other',
};

export const subjectLabel = (subjectType: string): string =>
    SUBJECT_LABEL[subjectType] ?? subjectType;

/** Human size string for an attachment (e.g. "2.4 MB", "640 KB"). */
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Whether a stored attachment can be previewed inline as an image. */
export const isImageAttachment = (contentType: string): boolean =>
    contentType.startsWith('image/');

/* ----------------------------- Status presentation ----------------------------- */

const STATUS_LABEL: Record<DisputeStatus, string> = {
    Open: 'Open',
    UnderReview: 'Under review',
    AwaitingInfo: 'Awaiting info',
    Resolved: 'Resolved',
    Rejected: 'Rejected',
    Escalated: 'Escalated',
};

export const statusLabel = (status: string): string =>
    STATUS_LABEL[status as DisputeStatus] ?? status;

export const STATUS_FILTER_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'Open', label: 'Open' },
    { value: 'UnderReview', label: 'Under review' },
    { value: 'AwaitingInfo', label: 'Awaiting info' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Escalated', label: 'Escalated' },
];

/* ------------------------ Evidence upload guardrails ------------------------ */
/** Kept in sync with MeDisputeService AllowedContentTypes + size limits. */
export const MAX_EVIDENCE_FILES = 5;
export const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_EVIDENCE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const ACCEPTED_EVIDENCE_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx';
