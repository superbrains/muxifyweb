import type { PayoutStatus } from '../types';

/**
 * Shared payout-status colour map. Mirrors the pattern used by `STATUS_STYLES`
 * in `ReleaseDetailDrawer.tsx` (bg + foreground + accent dot) so payouts feel
 * native to the Label UI. Used by the row pill, KPI strip, and drawer timeline.
 */
export interface PayoutStatusStyle {
    bg: string;
    color: string;
    dot: string;
    label: string;
}

const STYLES: Record<PayoutStatus, PayoutStatusStyle> = {
    Paid: { bg: '#E7FFF7', color: '#0F7B5C', dot: '#16A34A', label: 'Paid' },
    Processing: { bg: '#ECF7FF', color: '#1D4ED8', dot: '#3B82F6', label: 'Processing' },
    Pending: { bg: '#FFF9E6', color: '#92660C', dot: '#D97706', label: 'Pending' },
    Failed: { bg: '#FEF2F2', color: '#C53030', dot: '#E53E3E', label: 'Failed' },
};

export function payoutStatusStyle(status: PayoutStatus): PayoutStatusStyle {
    return STYLES[status] ?? STYLES.Pending;
}

export const PAYOUT_STATUSES: readonly PayoutStatus[] = ['Pending', 'Processing', 'Paid', 'Failed'];
