import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import {
    governanceService,
    labelOpsService,
    onboardingService,
} from '../services/governanceService';
import { adminKeys } from './adminKeys';
import type {
    AuditTrailQuery,
    LabelOpsQuery,
    NudgeRequest,
    StuckUserQuery,
} from '../types/governance';

/* --------------------------------- Queries -------------------------------- */

export const useAuditTrail = (query: AuditTrailQuery) =>
    useQuery({
        queryKey: adminKeys.governance.auditTrail(query),
        queryFn: () => governanceService.auditTrail(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useCompliance = () =>
    useQuery({
        queryKey: adminKeys.governance.compliance,
        queryFn: () => governanceService.compliance(),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useLabels = (query: LabelOpsQuery) =>
    useQuery({
        queryKey: adminKeys.labelOps.list(query),
        queryFn: () => labelOpsService.list(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useLabelDetail = (userId: string | null) =>
    useQuery({
        queryKey: adminKeys.labelOps.detail(userId ?? ''),
        queryFn: () => labelOpsService.detail(userId as string),
        enabled: userId !== null,
        staleTime: 30_000,
    });

export const useStuckUsers = (query: StuckUserQuery) =>
    useQuery({
        queryKey: adminKeys.onboarding.stuck(query),
        queryFn: () => onboardingService.stuck(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

/* -------------------------------- Mutations ------------------------------- */

type QC = ReturnType<typeof useQueryClient>;

/**
 * Shared governance mutation factory mirroring `useAdvertisingMutation` — emits a
 * toast on success/error and invalidates the supplied namespace roots.
 */
const useGovernanceMutation = <TArgs>(
    mutationFn: (args: TArgs) => Promise<unknown>,
    success: string,
    failure: string,
    invalidate?: (qc: QC) => void,
) => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn,
        onSuccess: () => {
            toast.success(success);
            invalidate?.(qc);
        },
        onError: (err) => toast.error(failure, getApiErrorMessage(err, 'Please try again.')),
    });
};

/* ------------------------------- Onboarding ------------------------------- */

export const useNudgeUser = () =>
    useGovernanceMutation(
        ({ userId, payload }: { userId: string; payload: NudgeRequest }) =>
            onboardingService.nudge(userId, payload),
        'Nudge sent.',
        'Could not send nudge',
        (qc) => qc.invalidateQueries({ queryKey: adminKeys.onboarding.root }),
    );
