import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';

/**
 * Single source of truth for status pills across the entire admin console.
 * Every status string the backend can emit (user / content / payout / campaign
 * / verification / dispute / moderation / withdrawal) resolves to one of five
 * tones so a "Pending" looks identical whether it is a payout, a ticket or a
 * verification. New towers should resolve through here rather than inventing
 * per-page colour maps.
 */
export type StatusTone = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

export interface StatusStyle {
    bg: string;
    color: string;
    dot: string;
    label: string;
}

const TONES: Record<StatusTone, Omit<StatusStyle, 'label'>> = {
    success: { bg: '#E7FFF7', color: '#0F7B5C', dot: '#16A34A' },
    warning: { bg: '#FFF9E6', color: '#92660C', dot: '#D97706' },
    info: { bg: '#ECF7FF', color: '#1D4ED8', dot: '#3B82F6' },
    danger: { bg: '#FEF2F2', color: '#C53030', dot: '#E53E3E' },
    neutral: { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' },
};

/** Lower-cased status string → tone. Unknown statuses fall back to neutral. */
const STATUS_TONE: Record<string, StatusTone> = {
    // settled / positive
    verified: 'success',
    active: 'success',
    approved: 'success',
    resolved: 'success',
    completed: 'success',
    paid: 'success',
    published: 'success',
    live: 'success',
    enabled: 'success',
    accepted: 'success',
    won: 'success',
    // in-flight / informational
    open: 'info',
    processing: 'info',
    inprogress: 'info',
    'in progress': 'info',
    inreview: 'info',
    'in review': 'info',
    pendingreview: 'info',
    submitted: 'info',
    scheduled: 'info',
    running: 'info',
    // waiting / caution
    pending: 'warning',
    pendinglabelapproval: 'warning',
    'awaiting label': 'warning',
    awaitingreview: 'warning',
    onhold: 'warning',
    draft: 'warning',
    flagged: 'warning',
    paused: 'warning',
    restricted: 'warning',
    disputed: 'warning',
    // failure / negative
    rejected: 'danger',
    failed: 'danger',
    cancelled: 'danger',
    canceled: 'danger',
    suspended: 'danger',
    banned: 'danger',
    removed: 'danger',
    blocked: 'danger',
    overdue: 'danger',
    // neutral / terminal
    notsubmitted: 'neutral',
    'not submitted': 'neutral',
    closed: 'neutral',
    dismissed: 'neutral',
    refunded: 'neutral',
    reversed: 'neutral',
    expired: 'neutral',
    deactivated: 'neutral',
    archived: 'neutral',
    inactive: 'neutral',
    revoked: 'neutral',
    declined: 'neutral',
    withdrawn: 'neutral',
};

/** Friendly label for a raw status string, e.g. `PendingLabelApproval` → `Pending label approval`. */
const humanizeStatus = (status: string): string => {
    if (status.toLowerCase() === 'pendinglabelapproval') return 'Awaiting label';
    if (status.toLowerCase() === 'notsubmitted') return 'Not submitted';
    if (status.toLowerCase() === 'inprogress') return 'In progress';
    // CamelCase / snake_case → spaced sentence case
    const spaced = status
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/** Resolve any status string to a full pill style. */
export const resolveStatusStyle = (
    status?: string | null,
    labelOverride?: string,
): StatusStyle => {
    const raw = (status ?? '').trim();
    const tone = STATUS_TONE[raw.toLowerCase()] ?? 'neutral';
    return {
        ...TONES[tone],
        label: labelOverride ?? (raw ? humanizeStatus(raw) : '—'),
    };
};

/** Build a pill style directly from a tone (for non-status badges, e.g. role tags). */
export const toneStyle = (tone: StatusTone, label: string): StatusStyle => ({
    ...TONES[tone],
    label,
});

interface StatusBadgeProps {
    /** Raw status string — resolved via the shared tone map. */
    status?: string | null;
    /** Or pass a pre-resolved style (back-compat with legacy status maps). */
    style?: StatusStyle;
    /** Override the displayed label. */
    label?: string;
    size?: 'sm' | 'md';
}

/**
 * Status pill — bg + foreground + accent dot. Pass a raw `status` string (it is
 * resolved through {@link resolveStatusStyle}) or a pre-built `style`.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    style,
    label,
    size = 'sm',
}) => {
    const resolved = style ?? resolveStatusStyle(status, label);
    const px = size === 'md' ? 3 : 2.5;
    const py = size === 'md' ? 1.5 : 1;
    return (
        <HStack
            gap={1.5}
            bg={resolved.bg}
            color={resolved.color}
            fontSize={size === 'md' ? '11px' : '10px'}
            fontWeight="semibold"
            px={px}
            py={py}
            borderRadius="full"
            display="inline-flex"
            w="fit-content"
            whiteSpace="nowrap"
        >
            <Box boxSize="6px" borderRadius="full" bg={resolved.dot} />
            <Text>{label ?? resolved.label}</Text>
        </HStack>
    );
};
