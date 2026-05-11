import { useQuery } from '@tanstack/react-query';
import { recordLabelService } from '../services/recordLabelService';
import { labelKeys } from './useLabelSummary';

export interface AnalyticsRange {
    from: string;
    to: string;
    granularity: 'day' | 'week' | 'month';
}

export const useLabelAnalytics = (range: AnalyticsRange) =>
    useQuery({
        queryKey: labelKeys.analytics(range),
        queryFn: () => recordLabelService.getAnalytics(range),
        staleTime: 60_000,
    });
