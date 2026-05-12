import { useQuery } from '@tanstack/react-query';
import { recordLabelService } from '../services/recordLabelService';

export const labelKeys = {
    summary: ['label', 'summary'] as const,
    roster: ['label', 'roster'] as const,
    invitations: ['label', 'invitations'] as const,
    releases: <T>(filters?: T) =>
        ['label', 'releases', filters ?? {}] as const,
    releasesSummary: ['label', 'releases', 'summary'] as const,
    splits: (trackId: string) => ['label', 'splits', trackId] as const,
    payouts: <T>(filters?: T) =>
        ['label', 'payouts', filters ?? {}] as const,
    payout: (id: string) => ['label', 'payout', id] as const,
    analytics: <T>(range: T) =>
        ['label', 'analytics', range] as const,
};

export const useLabelSummary = () =>
    useQuery({
        queryKey: labelKeys.summary,
        queryFn: () => recordLabelService.getSummary(),
        staleTime: 60_000,
    });
