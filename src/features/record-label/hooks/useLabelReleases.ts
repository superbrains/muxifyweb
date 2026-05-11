import { useQuery } from '@tanstack/react-query';
import { recordLabelService } from '../services/recordLabelService';
import { labelKeys } from './useLabelSummary';

export const useLabelReleases = (limit?: number) =>
    useQuery({
        queryKey: labelKeys.releases({ limit }),
        queryFn: () => recordLabelService.getReleases(limit),
        staleTime: 60_000,
    });
