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

/** Earnings summary for the signed-in contributor. Mirrors the backend EarningsSummaryDto. */
export interface ContributorEarningsSummaryDto {
    totalEarnedCoins: number;
    totalEarnedAmount: number;
    currency: string;
    totalEarnedDisplay: number;

    pendingWithdrawalAmount: number;
    pendingWithdrawalDisplay: number;

    availableForWithdrawalAmount: number;
    availableForWithdrawalDisplay: number;

    /** Earnings on tracks whose splits are admin-frozen — held out of the available balance. */
    heldForFrozenSplitsAmount: number;
    heldForFrozenSplitsDisplay: number;

    totalWithdrawnAmount: number;
    totalWithdrawnDisplay: number;

    platformFees: number;
    platformFeesDisplay: number;

    // Breakdown by type (relative weights).
    giftEarnings: number;
    contentUnlockEarnings: number;
    streamingEarnings: number;
    bonusEarnings: number;

    earningsThisMonth: number;
    earningsLastMonth: number;
    growthPercentage: number;

    /** True when the contributor is signed to a record label (payouts are label-managed). */
    isLabelManaged: boolean;
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

    /** "Artist" | "Contributor" | "Label" — who submitted the request. */
    requesterRole?: string;
    /** True when the request is routed through a record label's approval first. */
    isLabelManaged?: boolean;
    labelDecisionAt?: string;
    /** Reason a record label gave when rejecting (surfaced to the contributor). */
    labelRejectionReason?: string;
    /** "Label" | "Admin" — which tier rejected, when status === Rejected. */
    rejectedByRole?: string;
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

/** A label-triggered payout where the contributor is the recipient (read-only). */
export interface ContributorPayoutDto {
    id: string;
    batchId: string;
    amountMinor: number;
    amountDisplay: number;
    muxifyFeeMinor: number;
    muxifyFeeDisplay: number;
    netAmountMinor: number;
    netAmountDisplay: number;
    currency: string;
    status: string; // Pending | Completed | Failed
    reference?: string;
    initiatedAt: string;
    completedAt?: string;
    failureReason?: string;
}

export interface ContributorPayoutHistoryDto {
    payouts: ContributorPayoutDto[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/* ------------------------------------------------------------------ *
 * Profile — the signed-in contributor's own identity + KYC state.
 * ------------------------------------------------------------------ */
export type ContributorVerificationStatus =
    | 'NotSubmitted'
    | 'Pending'
    | 'Verified'
    | 'Rejected';

export interface ContributorProfileDto {
    email: string;
    displayName: string;
    legalName?: string | null;
    country?: string | null;
    identityDocumentUrl?: string | null;
    verificationStatus: ContributorVerificationStatus;
    verificationRejectionReason?: string | null;
    verificationSubmittedAt?: string | null;
    verificationReviewedAt?: string | null;
}

/* ------------------------------------------------------------------ *
 * Splits — the tracks whose royalty splits credit the contributor.
 * ------------------------------------------------------------------ */
export type SplitRecipientRole =
    | 'Artist'
    | 'Label'
    | 'Featured'
    | 'Producer'
    | 'Songwriter';

export interface ContributorSplitDto {
    trackId: string;
    trackTitle: string;
    artistName?: string | null;
    coverArtUrl?: string | null;
    role: SplitRecipientRole | string;
    /** Share in basis-points; 10000 = 100%. */
    percentBps: number;
    isFrozen: boolean;
    /** SplitDisputeStatus: None | UnderReview | Resolved. */
    disputeStatus: string;
}

export interface ContributorSplitsResponse {
    splits: ContributorSplitDto[];
    totalCount: number;
}

/* ------------------------------------------------------------------ *
 * Disputes — self-service financial grievances (Tower 26 DisputeCase).
 * ------------------------------------------------------------------ */
export type ContributorDisputeSubject = 'Withdrawal' | 'Earning' | 'Split' | 'Other';

export type ContributorDisputeStatus =
    | 'Open'
    | 'UnderReview'
    | 'AwaitingInfo'
    | 'Resolved'
    | 'Rejected'
    | 'Escalated';

export interface ContributorDisputeListItem {
    id: string;
    reference: string;
    subjectType: string;
    status: ContributorDisputeStatus;
    amountMinor?: number | null;
    currency?: string | null;
    createdAt: string;
    resolvedAt?: string | null;
}

export interface ContributorDisputeEvent {
    id: string;
    action: string;
    note?: string | null;
    byYou: boolean;
    createdAt: string;
}

export interface ContributorDisputeDetail {
    id: string;
    reference: string;
    subjectType: string;
    subjectId?: string | null;
    type: string;
    status: ContributorDisputeStatus;
    amountMinor?: number | null;
    currency?: string | null;
    description: string;
    createdAt: string;
    resolvedAt?: string | null;
    resolutionNotes?: string | null;
    events: ContributorDisputeEvent[];
}

export interface RaiseDisputePayload {
    subjectType: ContributorDisputeSubject;
    subjectId?: string | null;
    description: string;
    amountMinor?: number | null;
    currency?: string;
}

/** Server `PagedResult<T>` shape: `{ items, total, page, pageSize }`. */
export interface ContributorDisputesPage {
    items: ContributorDisputeListItem[];
    total: number;
    page: number;
    pageSize: number;
}

export interface DisputeListOptions extends PaginationOptions {
    status?: string;
}

/* ------------------------------------------------------------------ *
 * Service — codes to the CR2 contributor contract. The `api` base
 * already prefixes `/api/v1`, so paths are written without it (matching
 * the existing earnings/payments services).
 * ------------------------------------------------------------------ */

const CLAIM_BASE = '/contributor/claim';
const EARNINGS_BASE = '/contributor/earnings';
const PROFILE_BASE = '/contributor/profile';
const SPLITS_BASE = '/contributor/splits';
const DISPUTES_BASE = '/contributor/disputes';
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

    getPayouts: (options: PaginationOptions = {}) => {
        const { page = 1, pageSize = 20 } = options;
        return api.get<ContributorPayoutHistoryDto>(
            `${EARNINGS_BASE}/payouts?page=${page}&pageSize=${pageSize}`,
        );
    },

    /* ----------------------------- Profile ------------------------------ */
    getProfile: () => api.get<ContributorProfileDto>(PROFILE_BASE),

    /* ------------------------------ Splits ------------------------------ */
    getSplits: () => api.get<ContributorSplitsResponse>(SPLITS_BASE),

    /* ----------------------------- Disputes ----------------------------- */
    getDisputes: (options: DisputeListOptions = {}) => {
        const { page = 1, pageSize = 20, status } = options;
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
        });
        if (status) params.set('status', status);
        return api.get<ContributorDisputesPage>(`${DISPUTES_BASE}?${params.toString()}`);
    },
    getDispute: (id: string) => api.get<ContributorDisputeDetail>(`${DISPUTES_BASE}/${id}`),
    raiseDispute: (payload: RaiseDisputePayload) =>
        api.post<ContributorDisputeDetail>(DISPUTES_BASE, payload),

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
