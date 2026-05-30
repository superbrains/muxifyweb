import type { StatusStyle } from './statusColor';

const GREEN: Omit<StatusStyle, 'label'> = { bg: '#E7FFF7', color: '#0F7B5C', dot: '#16A34A' };
const AMBER: Omit<StatusStyle, 'label'> = { bg: '#FFF9E6', color: '#92660C', dot: '#D97706' };
const BLUE: Omit<StatusStyle, 'label'> = { bg: '#ECF7FF', color: '#1D4ED8', dot: '#3B82F6' };
const RED: Omit<StatusStyle, 'label'> = { bg: '#FEF2F2', color: '#C53030', dot: '#E53E3E' };
const SLATE: Omit<StatusStyle, 'label'> = { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' };

/**
 * One palette for every finance status string (purchase / withdrawal / payout /
 * airtime). Green = settled, blue = in-flight, amber = waiting, red = failed,
 * slate = reversed/neutral.
 */
export const financeStatusStyle = (status?: string | null): StatusStyle => {
    const label = status ?? '—';
    switch (status) {
        case 'Completed':
        case 'Paid':
        case 'Active':
            return { ...GREEN, label };
        case 'Processing':
            return { ...BLUE, label };
        case 'Pending':
            return { ...AMBER, label };
        case 'Failed':
        case 'Cancelled':
        case 'Rejected':
            return { ...RED, label };
        case 'Refunded':
        case 'Expired':
            return { ...SLATE, label };
        default:
            return { ...SLATE, label };
    }
};

/** Transaction-type pill — credits read green, debits red, neutral grey. */
export const transactionTypeStyle = (type: string, isCredit: boolean): StatusStyle =>
    isCredit ? { ...GREEN, label: type } : { ...RED, label: type };

/** Colour for a signed monetary/coin cell. */
export const amountColor = (isCredit: boolean): string => (isCredit ? '#0F7B5C' : '#C53030');
