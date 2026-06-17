import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { financeService } from '../services/financeService';
import { adminKeys } from './adminKeys';
import type {
    ApprovalRequestQuery,
    EarningsQuery,
    GiftQuery,
    PayoutAccountQuery,
    PayoutAuditQuery,
    PayoutQuery,
    TransactionQuery,
    UnlockQuery,
    WithdrawalQuery,
} from '../types/finance';

// ----- Queries -----

export const useFinanceOverview = (range: { from?: string; to?: string }) =>
    useQuery({
        queryKey: adminKeys.finance.overview(range),
        queryFn: () => financeService.getOverview(range),
        staleTime: 30_000,
    });

export const useFinanceTransactions = (query: TransactionQuery) =>
    useQuery({
        queryKey: adminKeys.finance.transactions(query),
        queryFn: () => financeService.getTransactions(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useFinanceTransaction = (id: string | null) =>
    useQuery({
        queryKey: adminKeys.finance.transaction(id ?? ''),
        queryFn: () => financeService.getTransaction(id as string),
        enabled: id !== null,
    });

export const useFanLedger = (
    userId: string | null,
    query: Omit<TransactionQuery, 'userId'>,
) =>
    useQuery({
        queryKey: adminKeys.finance.fanLedger(userId ?? '', query),
        queryFn: () => financeService.getFanLedger(userId as string, query),
        enabled: userId !== null,
        placeholderData: keepPreviousData,
    });

export const useFinanceEarnings = (query: EarningsQuery) =>
    useQuery({
        queryKey: adminKeys.finance.earnings(query),
        queryFn: () => financeService.getEarnings(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useCreatorEarnings = (
    artistId: string | null,
    query: { from?: string; to?: string; page: number; pageSize: number },
) =>
    useQuery({
        queryKey: adminKeys.finance.creatorEarnings(artistId ?? '', query),
        queryFn: () => financeService.getCreatorEarnings(artistId as string, query),
        enabled: artistId !== null,
        placeholderData: keepPreviousData,
    });

export const useCreatorSplits = (artistId: string | null) =>
    useQuery({
        queryKey: adminKeys.finance.creatorSplits(artistId ?? ''),
        queryFn: () => financeService.getCreatorSplits(artistId as string),
        enabled: artistId !== null,
    });

export const useFinanceGifts = (query: GiftQuery) =>
    useQuery({
        queryKey: adminKeys.finance.gifts(query),
        queryFn: () => financeService.getGifts(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useFinanceGiftSummary = (range: { from?: string; to?: string }) =>
    useQuery({
        queryKey: adminKeys.finance.giftSummary(range),
        queryFn: () => financeService.getGiftSummary(range),
        staleTime: 30_000,
    });

export const useFinanceUnlocks = (query: UnlockQuery) =>
    useQuery({
        queryKey: adminKeys.finance.unlocks(query),
        queryFn: () => financeService.getUnlocks(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useFinanceUnlockSummary = (query: { kind?: string; from?: string; to?: string }) =>
    useQuery({
        queryKey: adminKeys.finance.unlockSummary(query),
        queryFn: () => financeService.getUnlockSummary(query),
        staleTime: 30_000,
    });

export const useWithdrawals = (query: WithdrawalQuery) =>
    useQuery({
        queryKey: adminKeys.finance.withdrawals(query),
        queryFn: () => financeService.getWithdrawals(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const usePayouts = (query: PayoutQuery) =>
    useQuery({
        queryKey: adminKeys.finance.payouts(query),
        queryFn: () => financeService.getPayouts(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const usePayoutAccounts = (query: PayoutAccountQuery) =>
    useQuery({
        queryKey: adminKeys.finance.payoutAccounts(query),
        queryFn: () => financeService.getPayoutAccounts(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const usePayoutAudit = (query: PayoutAuditQuery) =>
    useQuery({
        queryKey: adminKeys.finance.payoutAudit(query),
        queryFn: () => financeService.getPayoutAudit(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useReconciliation = (range: { from?: string; to?: string; currency?: string }) =>
    useQuery({
        queryKey: adminKeys.finance.reconciliation(range),
        queryFn: () => financeService.getReconciliation(range),
        staleTime: 30_000,
    });

export const useApprovalRequests = (query: ApprovalRequestQuery) =>
    useQuery({
        queryKey: adminKeys.finance.approvals(query),
        queryFn: () => financeService.getApprovalRequests(query),
        placeholderData: keepPreviousData,
        staleTime: 15_000,
    });

export const useApprovalSummary = () =>
    useQuery({
        queryKey: adminKeys.finance.approvalsSummary(),
        queryFn: () => financeService.getApprovalSummary(),
        staleTime: 15_000,
    });

// ----- Mutations -----

const invalidateFinance = (qc: ReturnType<typeof useQueryClient>) =>
    qc.invalidateQueries({ queryKey: adminKeys.finance.root });

/**
 * Shared factory for the finance "action" mutations (approve, retry, reverse…).
 * Keeps the toast + invalidation behaviour identical across every action.
 */
function useFinanceAction<TVars>(
    fn: (vars: TVars) => Promise<unknown>,
    successTitle: string,
    successBody: string,
) {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: fn,
        onSuccess: () => {
            invalidateFinance(qc);
            toast.success(successTitle, successBody);
        },
        onError: (err) => toast.error('Action failed', getApiErrorMessage(err)),
    });
}

export const useApproveWithdrawal = () =>
    useFinanceAction(
        (v: { id: string; paymentReference?: string; adminNotes?: string }) =>
            financeService.approveWithdrawal(v.id, { paymentReference: v.paymentReference, adminNotes: v.adminNotes }),
        'Withdrawal approved',
        'The withdrawal is now processing.',
    );

export const useRejectWithdrawal = () =>
    useFinanceAction(
        (v: { id: string; reason: string }) => financeService.rejectWithdrawal(v.id, { reason: v.reason }),
        'Withdrawal rejected',
        'The withdrawal was rejected.',
    );

export const useRetryWithdrawal = () =>
    useFinanceAction(
        (v: { id: string; paymentReference?: string }) =>
            financeService.retryWithdrawal(v.id, { paymentReference: v.paymentReference }),
        'Withdrawal retried',
        'The withdrawal is processing again.',
    );

export const useMarkWithdrawalPaid = () =>
    useFinanceAction(
        (v: { id: string; gatewayTransactionId?: string; gatewayMessage?: string }) =>
            financeService.markWithdrawalPaid(v.id, {
                gatewayTransactionId: v.gatewayTransactionId,
                gatewayMessage: v.gatewayMessage,
            }),
        'Marked as paid',
        'The withdrawal is now completed.',
    );

export const useRetryPayout = () =>
    useFinanceAction(
        (v: { id: string; note?: string }) => financeService.retryPayout(v.id, { note: v.note }),
        'Payout requeued',
        'The payout will be re-driven by the settlement worker.',
    );

export const useCancelPayout = () =>
    useFinanceAction(
        (v: { id: string; reason: string }) => financeService.cancelPayout(v.id, { reason: v.reason }),
        'Payout cancelled',
        'The payout was cancelled.',
    );

export const useCreditWallet = () =>
    useFinanceAction(
        (v: { userId: string; amount: number; reason: string }) =>
            financeService.creditWallet(v.userId, { amount: v.amount, reason: v.reason }),
        'Wallet credited',
        'Coins were added to the wallet.',
    );

export const useDebitWallet = () =>
    useFinanceAction(
        (v: { userId: string; amount: number; reason: string }) =>
            financeService.debitWallet(v.userId, { amount: v.amount, reason: v.reason }),
        'Wallet debited',
        'Coins were removed from the wallet.',
    );

export const useReverseGift = () =>
    useFinanceAction(
        (v: { id: string; reason: string }) => financeService.reverseGift(v.id, { reason: v.reason }),
        'Gift reversed',
        'The gift was reversed and the sender refunded.',
    );

export const useRefundPurchase = () =>
    useFinanceAction(
        (v: { id: string; reason: string }) => financeService.refundPurchase(v.id, { reason: v.reason }),
        'Purchase refunded',
        'The purchase was refunded.',
    );

export const useRefundContentUnlock = () =>
    useFinanceAction(
        (v: { id: string; reason: string }) => financeService.refundContentUnlock(v.id, { reason: v.reason }),
        'Unlock refunded',
        'The unlock was refunded and the fan was credited back.',
    );

export const useRefundAirtimeUnlock = () =>
    useFinanceAction(
        (v: { id: string; reason: string }) => financeService.refundAirtimeUnlock(v.id, { reason: v.reason }),
        'Airtime unlock refunded',
        'The airtime unlock was marked as refunded.',
    );

// ----- Maker-checker (dual-approval) -----

export const useApproveRequest = () =>
    useFinanceAction(
        (v: { id: string }) => financeService.approveRequest(v.id),
        'Request approved',
        'The second review was recorded and the action applied.',
    );

export const useRejectRequest = () =>
    useFinanceAction(
        (v: { id: string; reason: string }) => financeService.rejectRequest(v.id, v.reason),
        'Request rejected',
        'The request was rejected.',
    );
