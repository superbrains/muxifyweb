import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { platformService } from '../services/platformService';
import { adminKeys } from './adminKeys';
import type {
    BroadcastQuery,
    CreateBroadcastPayload,
    DateWindow,
    Granularity,
} from '../types/platform';

// ----- Analytics queries -----

export const useBusinessAnalytics = (range: DateWindow) =>
    useQuery({
        queryKey: adminKeys.platform.business(range),
        queryFn: () => platformService.getBusiness(range),
        staleTime: 60_000,
    });

export const useGrowthAnalytics = (range: DateWindow & { granularity?: Granularity }) =>
    useQuery({
        queryKey: adminKeys.platform.growth(range),
        queryFn: () => platformService.getGrowth(range),
        staleTime: 60_000,
    });

export const useRevenueOverview = (range: DateWindow) =>
    useQuery({
        queryKey: adminKeys.platform.revenue(range),
        queryFn: () => platformService.getRevenue(range),
        staleTime: 60_000,
    });

export const useGeographyAnalytics = (range: DateWindow) =>
    useQuery({
        queryKey: adminKeys.platform.geography(range),
        queryFn: () => platformService.getGeography(range),
        staleTime: 60_000,
    });

export const useRiskCompliance = () =>
    useQuery({
        queryKey: adminKeys.platform.risk,
        queryFn: () => platformService.getRisk(),
        staleTime: 30_000,
    });

export const useTodayQueue = () =>
    useQuery({
        queryKey: adminKeys.platform.todayQueue,
        queryFn: () => platformService.getTodayQueue(),
        staleTime: 30_000,
    });

// ----- Notifications -----

export const useBroadcasts = (query: BroadcastQuery) =>
    useQuery({
        queryKey: adminKeys.platform.broadcasts(query),
        queryFn: () => platformService.getBroadcasts(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useDeliveryStats = (range: DateWindow) =>
    useQuery({
        queryKey: adminKeys.platform.deliveryStats(range),
        queryFn: () => platformService.getDeliveryStats(range),
        staleTime: 60_000,
    });

export const useCreateBroadcast = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (payload: CreateBroadcastPayload) => platformService.createBroadcast(payload),
        onSuccess: (broadcast) => {
            toast.success(
                'Broadcast sent',
                `“${broadcast.title}” reached ${broadcast.recipientCount.toLocaleString()} recipients.`,
            );
            qc.invalidateQueries({ queryKey: adminKeys.platform.root });
        },
        onError: (err) =>
            toast.error('Could not send broadcast', getApiErrorMessage(err, 'Please try again.')),
    });
};

// ----- Settings -----

export const usePlatformSettings = () =>
    useQuery({
        queryKey: adminKeys.platform.settings,
        queryFn: () => platformService.getSettings(),
        staleTime: 60_000,
    });

export const useUpdateSetting = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ key, value }: { key: string; value: string }) =>
            platformService.updateSetting(key, value),
        onSuccess: (_data, vars) => {
            toast.success('Setting updated', `“${vars.key}” has been saved.`);
            qc.invalidateQueries({ queryKey: adminKeys.platform.settings });
        },
        onError: (err) =>
            toast.error('Could not update setting', getApiErrorMessage(err, 'Please try again.')),
    });
};
