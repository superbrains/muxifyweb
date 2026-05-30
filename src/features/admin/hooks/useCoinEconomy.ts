import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { coinEconomyService } from '../services/coinEconomyService';
import type {
    UpdateCoinEconomySettingsRequest,
    UpsertCoinPackageRequest,
    UpsertGiftTypeRequest,
} from '../types/coinEconomy';

const keys = {
    settings: ['admin', 'coinEconomy', 'settings'] as const,
    packages: ['admin', 'coinEconomy', 'packages'] as const,
    giftTypes: ['admin', 'coinEconomy', 'gifts'] as const,
    availableGiftTypes: ['admin', 'coinEconomy', 'gifts', 'available'] as const,
};

/* ----------------------------- Settings ----------------------------- */

export function useCoinEconomySettings() {
    return useQuery({
        queryKey: keys.settings,
        queryFn: ({ signal }) => coinEconomyService.getSettings(signal),
        staleTime: 30_000,
    });
}

export function useUpdateCoinEconomySettings() {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (payload: UpdateCoinEconomySettingsRequest) =>
            coinEconomyService.updateSettings(payload),
        onSuccess: () => {
            toast.success('Conversion rate updated', 'New rate applies to future unlocks and payouts.');
            qc.invalidateQueries({ queryKey: keys.settings });
        },
        onError: (err) =>
            toast.error('Could not update rate', getApiErrorMessage(err, 'Please try again.')),
    });
}

/* --------------------------- Coin packages -------------------------- */

export function useCoinPackages() {
    return useQuery({
        queryKey: keys.packages,
        queryFn: ({ signal }) => coinEconomyService.getPackages(signal),
        staleTime: 30_000,
    });
}

export function useCreateCoinPackage() {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (payload: UpsertCoinPackageRequest) => coinEconomyService.createPackage(payload),
        onSuccess: () => {
            toast.success('Coin package created');
            qc.invalidateQueries({ queryKey: keys.packages });
        },
        onError: (err) =>
            toast.error('Could not create package', getApiErrorMessage(err, 'Please try again.')),
    });
}

export function useUpdateCoinPackage() {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpsertCoinPackageRequest }) =>
            coinEconomyService.updatePackage(id, payload),
        onSuccess: () => {
            toast.success('Coin package updated');
            qc.invalidateQueries({ queryKey: keys.packages });
        },
        onError: (err) =>
            toast.error('Could not update package', getApiErrorMessage(err, 'Please try again.')),
    });
}

export function useSetCoinPackageActive() {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) =>
            coinEconomyService.setPackageActive(id, active),
        onSuccess: (_d, { active }) => {
            toast.success(active ? 'Package activated' : 'Package deactivated');
            qc.invalidateQueries({ queryKey: keys.packages });
        },
        onError: (err) =>
            toast.error('Could not update package', getApiErrorMessage(err, 'Please try again.')),
    });
}

/* ----------------------------- Gift types --------------------------- */

export function useGiftTypes() {
    return useQuery({
        queryKey: keys.giftTypes,
        queryFn: ({ signal }) => coinEconomyService.getGiftTypes(signal),
        staleTime: 30_000,
    });
}

export function useAvailableGiftTypes() {
    return useQuery({
        queryKey: keys.availableGiftTypes,
        queryFn: ({ signal }) => coinEconomyService.getAvailableGiftTypes(signal),
        staleTime: 30_000,
    });
}

export function useCreateGiftType() {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (payload: UpsertGiftTypeRequest) => coinEconomyService.createGiftType(payload),
        onSuccess: () => {
            toast.success('Gift created');
            qc.invalidateQueries({ queryKey: keys.giftTypes });
            qc.invalidateQueries({ queryKey: keys.availableGiftTypes });
        },
        onError: (err) =>
            toast.error('Could not create gift', getApiErrorMessage(err, 'Please try again.')),
    });
}

export function useUpdateGiftType() {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpsertGiftTypeRequest }) =>
            coinEconomyService.updateGiftType(id, payload),
        onSuccess: () => {
            toast.success('Gift updated');
            qc.invalidateQueries({ queryKey: keys.giftTypes });
        },
        onError: (err) =>
            toast.error('Could not update gift', getApiErrorMessage(err, 'Please try again.')),
    });
}

export function useSetGiftTypeActive() {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) =>
            coinEconomyService.setGiftTypeActive(id, active),
        onSuccess: (_d, { active }) => {
            toast.success(active ? 'Gift activated' : 'Gift deactivated');
            qc.invalidateQueries({ queryKey: keys.giftTypes });
        },
        onError: (err) =>
            toast.error('Could not update gift', getApiErrorMessage(err, 'Please try again.')),
    });
}
