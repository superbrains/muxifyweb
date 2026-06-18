import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import { contributorService } from '../services/contributorService';
import type {
    ContributorProfilePayload,
    ContributorVerificationPayload,
    ContributorWithdrawalRequest,
    AddPayoutMethodRequest,
    UpdatePayoutMethodRequest,
    PaginationOptions,
    DisputeListOptions,
    RaiseDisputePayload,
} from '../services/contributorService';

/* ------------------------------------------------------------------ *
 * Query keys
 * ------------------------------------------------------------------ */
export const contributorKeys = {
    all: ['contributor'] as const,
    earningsSummary: () => [...contributorKeys.all, 'earnings', 'summary'] as const,
    earningsHistory: (opts: PaginationOptions) =>
        [...contributorKeys.all, 'earnings', 'history', opts] as const,
    withdrawals: (opts: PaginationOptions) =>
        [...contributorKeys.all, 'earnings', 'withdrawals', opts] as const,
    payouts: (opts: PaginationOptions) =>
        [...contributorKeys.all, 'earnings', 'payouts', opts] as const,
    payoutMethods: () => [...contributorKeys.all, 'payout-methods'] as const,
    banks: () => [...contributorKeys.all, 'banks'] as const,
    profile: () => [...contributorKeys.all, 'profile'] as const,
    splits: () => [...contributorKeys.all, 'splits'] as const,
    disputes: (opts: DisputeListOptions) =>
        [...contributorKeys.all, 'disputes', opts] as const,
    dispute: (id: string) => [...contributorKeys.all, 'disputes', id] as const,
};

/* ------------------------------------------------------------------ *
 * Earnings
 * ------------------------------------------------------------------ */
export const useContributorEarningsSummary = () =>
    useQuery({
        queryKey: contributorKeys.earningsSummary(),
        queryFn: async () => (await contributorService.getEarningsSummary()).data,
    });

export const useContributorEarningsHistory = (opts: PaginationOptions = {}) =>
    useQuery({
        queryKey: contributorKeys.earningsHistory(opts),
        queryFn: async () => (await contributorService.getEarningsHistory(opts)).data,
    });

export const useContributorWithdrawals = (opts: PaginationOptions = {}) =>
    useQuery({
        queryKey: contributorKeys.withdrawals(opts),
        queryFn: async () => (await contributorService.getWithdrawalHistory(opts)).data,
    });

export const useContributorPayouts = (opts: PaginationOptions = {}) =>
    useQuery({
        queryKey: contributorKeys.payouts(opts),
        queryFn: async () => (await contributorService.getPayouts(opts)).data,
    });

export const useRequestContributorWithdrawal = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (request: ContributorWithdrawalRequest) =>
            (await contributorService.requestWithdrawal(request)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: contributorKeys.all });
        },
    });
};

/* ------------------------------------------------------------------ *
 * Payout accounts
 * ------------------------------------------------------------------ */
export const useContributorPayoutMethods = () =>
    useQuery({
        queryKey: contributorKeys.payoutMethods(),
        queryFn: async () => (await contributorService.getPayoutMethods()).data,
    });

export const useContributorBanks = () =>
    useQuery({
        queryKey: contributorKeys.banks(),
        queryFn: async () => (await contributorService.getBanks()).data,
        staleTime: 1000 * 60 * 30, // banks change rarely
    });

export const useAddContributorPayoutMethod = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (request: AddPayoutMethodRequest) =>
            (await contributorService.addPayoutMethod(request)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: contributorKeys.payoutMethods() });
        },
    });
};

export const useUpdateContributorPayoutMethod = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (vars: { id: string; request: UpdatePayoutMethodRequest }) =>
            (await contributorService.updatePayoutMethod(vars.id, vars.request)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: contributorKeys.payoutMethods() });
        },
    });
};

export const useDeleteContributorPayoutMethod = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) =>
            (await contributorService.deletePayoutMethod(id)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: contributorKeys.payoutMethods() });
        },
    });
};

export const useSetDefaultContributorPayoutMethod = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) =>
            (await contributorService.setDefaultPayoutMethod(id)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: contributorKeys.payoutMethods() });
        },
    });
};

/* ------------------------------------------------------------------ *
 * Profile
 * ------------------------------------------------------------------ */
export const useContributorProfile = () =>
    useQuery({
        queryKey: contributorKeys.profile(),
        queryFn: async () => (await contributorService.getProfile()).data,
    });

/* ------------------------------------------------------------------ *
 * Splits
 * ------------------------------------------------------------------ */
export const useContributorSplits = () =>
    useQuery({
        queryKey: contributorKeys.splits(),
        queryFn: async () => (await contributorService.getSplits()).data,
    });

/* ------------------------------------------------------------------ *
 * Disputes
 * ------------------------------------------------------------------ */
export const useContributorDisputes = (opts: DisputeListOptions = {}) =>
    useQuery({
        queryKey: contributorKeys.disputes(opts),
        queryFn: async () => (await contributorService.getDisputes(opts)).data,
    });

export const useContributorDispute = (id: string | null) =>
    useQuery({
        queryKey: contributorKeys.dispute(id ?? ''),
        queryFn: async () => (await contributorService.getDispute(id!)).data,
        enabled: !!id,
    });

export const useRaiseContributorDispute = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: RaiseDisputePayload) =>
            (await contributorService.raiseDispute(payload)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [...contributorKeys.all, 'disputes'] });
        },
    });
};

/* ------------------------------------------------------------------ *
 * Onboarding (authed)
 * ------------------------------------------------------------------ */
export const useSaveContributorProfile = () =>
    useMutation({
        mutationFn: (payload: ContributorProfilePayload) =>
            contributorService.saveProfile(payload),
    });

export const useSubmitContributorVerification = () =>
    useMutation({
        mutationFn: (payload: ContributorVerificationPayload) =>
            contributorService.submitVerification(payload),
    });
