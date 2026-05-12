import { useQuery } from '@tanstack/react-query';
import { recordLabelService } from '../services/recordLabelService';
import type { ReleaseFilters } from '../types';
import { labelKeys } from './useLabelSummary';

export const useLabelReleases = (
    filters: ReleaseFilters = {},
    limit?: number,
) =>
    useQuery({
        queryKey: labelKeys.releases({ ...filters, limit }),
        queryFn: () => recordLabelService.getReleases(filters, limit),
        staleTime: 60_000,
    });

export const useLabelReleaseSummary = () =>
    useQuery({
        queryKey: labelKeys.releasesSummary,
        queryFn: () => recordLabelService.getReleasesSummary(),
        staleTime: 60_000,
    });
