import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { adminKeys } from './adminKeys';
import type { ActivityRange } from '../types';

export const useAdminOverview = () =>
    useQuery({
        queryKey: adminKeys.overview,
        queryFn: () => adminService.getOverview(),
        staleTime: 60_000,
    });

export const useActivitySeries = (range: ActivityRange) =>
    useQuery({
        queryKey: adminKeys.activity(range),
        queryFn: () => adminService.getActivitySeries(range),
        staleTime: 60_000,
    });
