import { api } from '@shared/services/api';
import type {
    PayoutMethodDto,
    PayoutMethodListDto,
    AddPayoutMethodRequest,
    AddPayoutMethodResponse,
    UpdatePayoutMethodRequest,
    SuccessResponse,
    BankListDto,
    VerifyAccountRequest,
    VerifyAccountResponse,
} from '@/features/payments/types';

/* ------------------------------------------------------------------ *
 * Contributor types — mirror the backend Contributor DTOs.
 * ------------------------------------------------------------------ */

/** Public pre-auth view of a contributor claim token. */
export interface ContributorClaimLookupDto {
    email: string;
    displayName: string;
    isValid: boolean;
    expiresAt: string;
}

export interface ContributorClaimPayload {
    token: string;
    password: string;
}

export interface ContributorClaimResponse {
    userId: string;
    email: string;
}

export interface ContributorProfilePayload {
    displayName: string;
    legalName: string;
    country: string;
}

export interface ContributorVerificationPayload {
    identityDocumentUrl: string;
}

/** Earnings summary for the signed-in contributor. */
export interface ContributorEarningsSummaryDto {
    totalEarnedCoins: number;
    totalEarnedAmount: number;
    currency: string;
    totalEarnedDisplay: number;

    pendingWithdrawalAmount: number;
    pendingWithdrawalDisplay: number;

    availableForWithdrawalAmount: number;
    availableForWithdrawalDisplay: number;

    totalWithdrawnAmount: number;
    totalWithdrawnDisplay: number;

    earningsThisMonth: number;
    earningsLastMonth: number;
    growthPercentage: number;
}

export type ContributorEarningType =
    | 'gift'
    | 'unlock'
    | 'streaming'
    | 'bonus'
    | 'referral'
    | 'split';

export interface ContributorEarningDto {
    id: string;
    type: ContributorEarningType;
    coinAmount: number;
    amountInSmallestUnit: number;
    amountDisplay: number;
    currency: string;
    netAmountInSmallestUnit: number;
    netAmountDisplay: number;
    description: string;
    earnedAt: string;
    isWithdrawn: boolean;
}

export interface ContributorEarningsHistoryDto {
    earnings: ContributorEarningDto[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Server serializes the withdrawal status enum as PascalCase. Mirrors the
// artist two-tier (request → admin) approval flow.
export type ContributorWithdrawalStatus =
    | 'Pending'
    | 'Processing'
    | 'Completed'
    | 'Failed'
    | 'Cancelled'
    | 'Rejected';

export interface ContributorWithdrawalDto {
    id: string;
    amountInSmallestUnit: number;
    amountDisplay: number;
    currency: string;
    processingFee: number;
    processingFeeDisplay: number;
    netAmount: number;
    netAmountDisplay: number;
    status: ContributorWithdrawalStatus;
    bankName: string;
    accountNumber: string;
    accountName: string;
    requestedAt: string;
    completedAt?: string;
    gatewayMessage?: string;
    rejectionReason?: string;
}

export interface ContributorWithdrawalHistoryDto {
    withdrawals: ContributorWithdrawalDto[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ContributorWithdrawalRequest {
    amountInSmallestUnit: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode?: string;
}

export interface ContributorWithdrawalResponse {
    success: boolean;
    withdrawalId: string;
    status: ContributorWithdrawalStatus;
    amountRequested: number;
    processingFee: number;
    netAmount: number;
    message?: string;
}

export interface PaginationOptions {
    page?: number;
    pageSize?: number;
}

/* ------------------------------------------------------------------ *
 * Service — codes to the CR2 contributor contract. The `api` base
 * already prefixes `/api/v1`, so paths are written without it (matching
 * the existing earnings/payments services).
 * ------------------------------------------------------------------ */

const CLAIM_BASE = '/contributor/claim';
const EARNINGS_BASE = '/contributor/earnings';
const PAYOUT_METHODS_BASE = '/payments/methods';

export const contributorService = {
    /* --------------------- Public claim (pre-auth) ---------------------- */
    lookupClaim: async (token: string): Promise<ContributorClaimLookupDto> => {
        const { data } = await api.get<ContributorClaimLookupDto>(`${CLAIM_BASE}/lookup`, {
            params: { token },
        });
        return data;
    },
    claim: async (payload: ContributorClaimPayload): Promise<ContributorClaimResponse> => {
        const { data } = await api.post<ContributorClaimResponse>('/contributor/claim', payload);
        return data;
    },

    /* ----------------------- Authed onboarding -------------------------- */
    saveProfile: async (payload: ContributorProfilePayload): Promise<void> => {
        await api.post('/contributor/profile', payload);
    },
    submitVerification: async (payload: ContributorVerificationPayload): Promise<void> => {
        await api.post('/contributor/verification', payload);
    },

    /* ----------------------------- Earnings ----------------------------- */
    getEarningsSummary: () =>
        api.get<ContributorEarningsSummaryDto>(`${EARNINGS_BASE}/summary`),

    getEarningsHistory: (options: PaginationOptions = {}) => {
        const { page = 1, pageSize = 20 } = options;
        return api.get<ContributorEarningsHistoryDto>(
            `${EARNINGS_BASE}/history?page=${page}&pageSize=${pageSize}`,
        );
    },

    getWithdrawalHistory: (options: PaginationOptions = {}) => {
        const { page = 1, pageSize = 20 } = options;
        return api.get<ContributorWithdrawalHistoryDto>(
            `${EARNINGS_BASE}/withdrawals?page=${page}&pageSize=${pageSize}`,
        );
    },

    requestWithdrawal: (request: ContributorWithdrawalRequest) =>
        api.post<ContributorWithdrawalResponse>(`${EARNINGS_BASE}/withdraw`, request),

    /* ------------------- Payout accounts (reused) ----------------------- */
    getPayoutMethods: () => api.get<PayoutMethodListDto>(PAYOUT_METHODS_BASE),
    getBanks: () => api.get<BankListDto>(`${PAYOUT_METHODS_BASE}/banks`),
    verifyAccount: (request: VerifyAccountRequest) =>
        api.post<VerifyAccountResponse>(`${PAYOUT_METHODS_BASE}/verify`, request),
    addPayoutMethod: (request: AddPayoutMethodRequest) =>
        api.post<AddPayoutMethodResponse>(PAYOUT_METHODS_BASE, request),
    updatePayoutMethod: (id: string, request: UpdatePayoutMethodRequest) =>
        api.put<SuccessResponse>(`${PAYOUT_METHODS_BASE}/${id}`, request),
    deletePayoutMethod: (id: string) =>
        api.delete<SuccessResponse>(`${PAYOUT_METHODS_BASE}/${id}`),
    setDefaultPayoutMethod: (id: string) =>
        api.post<SuccessResponse>(`${PAYOUT_METHODS_BASE}/${id}/default`),
};

export type {
    PayoutMethodDto,
    AddPayoutMethodRequest,
    UpdatePayoutMethodRequest,
};

export default contributorService;
