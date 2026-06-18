import { api } from '@shared/services/api';
import type {
    ApprovalRequestQuery,
    CreatorEarningSummary,
    CreatorEarningsDetail,
    EarningsQuery,
    FinanceApprovalRequestDto,
    FinanceApprovalSummaryDto,
    FanLedger,
    FinanceGift,
    FinanceGiftSummary,
    FinanceOverview,
    FinanceTransaction,
    FinanceTransactionDetail,
    FinanceUnlock,
    FinanceUnlockSummary,
    GiftQuery,
    PagedResult,
    PayoutAccountDto,
    PayoutAccountQuery,
    PayoutAccountSummary,
    PayoutAuditEntryDto,
    PayoutAuditQuery,
    PayoutDetail,
    PayoutListItem,
    PayoutQuery,
    PayoutSummary,
    ReconciliationSummary,
    TrackSplitBreakdown,
    TransactionQuery,
    UnlockQuery,
    WithdrawalDetail,
    WithdrawalListItem,
    WithdrawalQuery,
    WithdrawalSummary,
} from '../types/finance';

const BASE = '/admin/finance';

/** Strips undefined/empty values so they don't reach the API as `?x=undefined`. */
const clean = (params: object): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') out[k] = v;
    });
    return out;
};

export const financeService = {
    getOverview: async (range: { from?: string; to?: string }): Promise<FinanceOverview> => {
        const { data } = await api.get<FinanceOverview>(`${BASE}/overview`, { params: clean(range) });
        return data;
    },

    getTransactions: async (query: TransactionQuery): Promise<PagedResult<FinanceTransaction>> => {
        const { data } = await api.get<PagedResult<FinanceTransaction>>(`${BASE}/transactions`, {
            params: clean(query),
        });
        return data;
    },

    getTransaction: async (id: string): Promise<FinanceTransactionDetail> => {
        const { data } = await api.get<FinanceTransactionDetail>(`${BASE}/transactions/${id}`);
        return data;
    },

    getFanLedger: async (userId: string, query: Omit<TransactionQuery, 'userId'>): Promise<FanLedger> => {
        const { data } = await api.get<FanLedger>(`${BASE}/fans/${userId}/transactions`, {
            params: clean(query),
        });
        return data;
    },

    getEarnings: async (query: EarningsQuery): Promise<PagedResult<CreatorEarningSummary>> => {
        const { data } = await api.get<PagedResult<CreatorEarningSummary>>(`${BASE}/earnings`, {
            params: clean(query),
        });
        return data;
    },

    getCreatorEarnings: async (
        artistId: string,
        query: { from?: string; to?: string; page: number; pageSize: number },
    ): Promise<CreatorEarningsDetail> => {
        const { data } = await api.get<CreatorEarningsDetail>(`${BASE}/creators/${artistId}/earnings`, {
            params: clean(query),
        });
        return data;
    },

    getCreatorSplits: async (artistId: string): Promise<TrackSplitBreakdown[]> => {
        const { data } = await api.get<TrackSplitBreakdown[]>(`${BASE}/creators/${artistId}/splits`);
        return data;
    },

    getGifts: async (query: GiftQuery): Promise<PagedResult<FinanceGift>> => {
        const { data } = await api.get<PagedResult<FinanceGift>>(`${BASE}/gifts`, { params: clean(query) });
        return data;
    },

    getGiftSummary: async (range: { from?: string; to?: string }): Promise<FinanceGiftSummary> => {
        const { data } = await api.get<FinanceGiftSummary>(`${BASE}/gifts/summary`, { params: clean(range) });
        return data;
    },

    getUnlocks: async (query: UnlockQuery): Promise<PagedResult<FinanceUnlock>> => {
        const { data } = await api.get<PagedResult<FinanceUnlock>>(`${BASE}/unlocks`, { params: clean(query) });
        return data;
    },

    getUnlockSummary: async (query: { kind?: string; from?: string; to?: string }): Promise<FinanceUnlockSummary> => {
        const { data } = await api.get<FinanceUnlockSummary>(`${BASE}/unlocks/summary`, { params: clean(query) });
        return data;
    },

    refundContentUnlock: (id: string, body: { reason: string }) =>
        api.post(`${BASE}/unlocks/${id}/refund`, body),
    refundAirtimeUnlock: (id: string, body: { reason: string }) =>
        api.post(`${BASE}/unlocks/airtime/${id}/refund`, body),

    getWithdrawals: async (query: WithdrawalQuery): Promise<PagedResult<WithdrawalListItem>> => {
        const { data } = await api.get<PagedResult<WithdrawalListItem>>(`${BASE}/withdrawals`, {
            params: clean(query),
        });
        return data;
    },

    getWithdrawalSummary: async (range: { from?: string; to?: string; role?: string }): Promise<WithdrawalSummary> => {
        const { data } = await api.get<WithdrawalSummary>(`${BASE}/withdrawals/summary`, { params: clean(range) });
        return data;
    },

    getWithdrawal: async (id: string): Promise<WithdrawalDetail> => {
        const { data } = await api.get<WithdrawalDetail>(`${BASE}/withdrawals/${id}`);
        return data;
    },

    approveWithdrawal: (id: string, body: { paymentReference?: string; adminNotes?: string }) =>
        api.post(`${BASE}/withdrawals/${id}/approve`, body),
    rejectWithdrawal: (id: string, body: { reason: string }) =>
        api.post(`${BASE}/withdrawals/${id}/reject`, body),
    retryWithdrawal: (id: string, body: { paymentReference?: string }) =>
        api.post(`${BASE}/withdrawals/${id}/retry`, body),
    markWithdrawalPaid: (id: string, body: { gatewayTransactionId?: string; gatewayMessage?: string }) =>
        api.post(`${BASE}/withdrawals/${id}/mark-paid`, body),

    getPayouts: async (query: PayoutQuery): Promise<PagedResult<PayoutListItem>> => {
        const { data } = await api.get<PagedResult<PayoutListItem>>(`${BASE}/payouts`, { params: clean(query) });
        return data;
    },

    getPayoutSummary: async (range: { from?: string; to?: string }): Promise<PayoutSummary> => {
        const { data } = await api.get<PayoutSummary>(`${BASE}/payouts/summary`, { params: clean(range) });
        return data;
    },

    getPayout: async (id: string): Promise<PayoutDetail> => {
        const { data } = await api.get<PayoutDetail>(`${BASE}/payouts/${id}`);
        return data;
    },

    retryPayout: (id: string, body: { note?: string }) => api.post(`${BASE}/payouts/${id}/retry`, body),
    cancelPayout: (id: string, body: { reason: string }) => api.post(`${BASE}/payouts/${id}/cancel`, body),

    getPayoutAccounts: async (query: PayoutAccountQuery): Promise<PagedResult<PayoutAccountDto>> => {
        const { data } = await api.get<PagedResult<PayoutAccountDto>>(`${BASE}/payout-accounts`, {
            params: clean(query),
        });
        return data;
    },

    getPayoutAccountSummary: async (): Promise<PayoutAccountSummary> => {
        const { data } = await api.get<PayoutAccountSummary>(`${BASE}/payout-accounts/summary`);
        return data;
    },

    setDefaultPayoutAccount: (id: string) => api.post(`${BASE}/payout-accounts/${id}/set-default`),
    forceVerifyPayoutAccount: (id: string, body: { note?: string }) =>
        api.post(`${BASE}/payout-accounts/${id}/force-verify`, body),
    deactivatePayoutAccount: (id: string, body: { reason: string }) =>
        api.post(`${BASE}/payout-accounts/${id}/deactivate`, body),
    reactivatePayoutAccount: (id: string) => api.post(`${BASE}/payout-accounts/${id}/reactivate`),
    deletePayoutAccount: (id: string, body: { reason: string }) =>
        api.delete(`${BASE}/payout-accounts/${id}`, { data: body }),

    getPayoutAudit: async (query: PayoutAuditQuery): Promise<PagedResult<PayoutAuditEntryDto>> => {
        const { data } = await api.get<PagedResult<PayoutAuditEntryDto>>(`${BASE}/payout-audit`, {
            params: clean(query),
        });
        return data;
    },

    creditWallet: (userId: string, body: { amount: number; reason: string }) =>
        api.post(`${BASE}/fans/${userId}/wallet/credit`, body),
    debitWallet: (userId: string, body: { amount: number; reason: string }) =>
        api.post(`${BASE}/fans/${userId}/wallet/debit`, body),
    reverseGift: (id: string, body: { reason: string }) => api.post(`${BASE}/gifts/${id}/reverse`, body),
    refundPurchase: (transactionId: string, body: { reason: string }) =>
        api.post(`${BASE}/transactions/${transactionId}/refund`, body),

    getReconciliation: async (range: { from?: string; to?: string; currency?: string }): Promise<ReconciliationSummary> => {
        const { data } = await api.get<ReconciliationSummary>(`${BASE}/reconciliation`, { params: clean(range) });
        return data;
    },

    // ----- Maker-checker (dual-approval) -----

    getApprovalRequests: async (
        query: ApprovalRequestQuery,
    ): Promise<PagedResult<FinanceApprovalRequestDto>> => {
        const { data } = await api.get<PagedResult<FinanceApprovalRequestDto>>(`${BASE}/approvals`, {
            params: clean(query),
        });
        return data;
    },

    getApprovalSummary: async (): Promise<FinanceApprovalSummaryDto> => {
        const { data } = await api.get<FinanceApprovalSummaryDto>(`${BASE}/approvals/summary`);
        return data;
    },

    approveRequest: (id: string) => api.post(`${BASE}/approvals/${id}/approve`),
    rejectRequest: (id: string, reason: string) =>
        api.post(`${BASE}/approvals/${id}/reject`, { reason }),
};
