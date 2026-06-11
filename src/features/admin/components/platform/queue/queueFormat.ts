import type { QueueSlaStatus } from '../../../types/platform';

/**
 * The operational queue's SLA language. Unlike the risk register's severity ramp
 * (which grades *exposure*), this grades *timeliness*: is the oldest waiting item
 * still inside its target, creeping toward it, or already past due? Four tones —
 * neutral when empty, green on-track, amber at-risk, rose breached.
 */
export interface SlaStyle {
    label: string;
    /** Foreground / text. */
    color: string;
    /** Soft fill behind pills and tiles. */
    bg: string;
    /** Saturated accent for dots, rails and bars. */
    accent: string;
}

export const SLA_STYLE: Record<QueueSlaStatus, SlaStyle> = {
    clear: { label: 'Clear', color: '#5A6B85', bg: '#EEF2F7', accent: '#94A3B8' },
    ontrack: { label: 'On track', color: '#0F7B5C', bg: '#E7FBF3', accent: '#16A34A' },
    atrisk: { label: 'At risk', color: '#92660C', bg: '#FFF8E8', accent: '#D97706' },
    breached: { label: 'Breached', color: '#C01744', bg: '#FEEEF2', accent: '#E11D48' },
};

export const slaStyle = (status: QueueSlaStatus): SlaStyle => SLA_STYLE[status] ?? SLA_STYLE.clear;

const SLA_RANK: Record<QueueSlaStatus, number> = {
    breached: 3,
    atrisk: 2,
    ontrack: 1,
    clear: 0,
};

/** Sort comparator: most urgent SLA first, then by open volume. */
export const bySlaSeverityDesc = (
    a: { slaStatus: QueueSlaStatus; openCount: number },
    b: { slaStatus: QueueSlaStatus; openCount: number },
): number => SLA_RANK[b.slaStatus] - SLA_RANK[a.slaStatus] || b.openCount - a.openCount;

/** Aging-bucket palette: fresh → green, then warming as items get older. */
export const AGING_COLORS = ['#16A34A', '#D97706', '#F97316', '#E11D48'];

/**
 * Compact age label from a number of hours: "—" when nothing waits, "8h" within a
 * day, "3d 4h" beyond. Keeps the register scannable at a glance.
 */
export const formatAge = (hours: number): string => {
    if (!hours || hours <= 0) return '—';
    if (hours < 1) return '<1h';
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    const rem = Math.round(hours - days * 24);
    return rem > 0 ? `${days}d ${rem}h` : `${days}d`;
};
