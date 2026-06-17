// Types mirroring the backend AdminFinance DTOs (/api/v1/admin/finance/*).

export interface PagedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface FinanceOverview {
    currency: string;
    grossFundingMinor: number;
    feesCollectedMinor: number;
    grossCoinVolume: number;
    coinsInCirculation: number;
    pendingWithdrawalsCount: number;
    pendingWithdrawalsMinor: number;
    pendingPayoutsCount: number;
    pendingPayoutsMinor: number;
    failedPayoutsCount: number;
    totalPaidOutMinor: number;
    unwithdrawnEarningsMinor: number;
    fundingTrendPct?: number | null;
}

export interface FinanceTransaction {
    id: string;
    userId: string;
    userDisplayName: string;
    userEmail?: string | null;
    type: string;
    isCredit: boolean;
    amount: number;
    balanceAfter: number;
    description?: string | null;
    referenceId?: string | null;
    referenceType?: string | null;
    counterpartyId?: string | null;
    counterpartyName?: string | null;
    status?: string | null;
    transactionDate: string;
}

export interface FinanceTransactionDetail {
    transaction: FinanceTransaction;
    fundingAmountMinor?: number | null;
    fundingCurrency?: string | null;
    fundingProvider?: string | null;
    fundingPaymentReference?: string | null;
    fundingGatewayTransactionId?: string | null;
    giftType?: string | null;
    giftMessage?: string | null;
}

export interface FanLedger {
    userId: string;
    userDisplayName: string;
    userEmail?: string | null;
    walletBalance: number;
    lifetimePurchased: number;
    lifetimeSpent: number;
    lifetimeReceived: number;
    walletActive: boolean;
    transactions: PagedResult<FinanceTransaction>;
}

export interface CreatorEarningSummary {
    artistId: string;
    artistName: string;
    artistEmail?: string | null;
    totalCoinEarned: number;
    totalNetMinor: number;
    totalPlatformFeeMinor: number;
    unwithdrawnMinor: number;
    earningCount: number;
    currency: string;
}

export interface CreatorEarningLine {
    id: string;
    type: string;
    trackId?: string | null;
    trackTitle?: string | null;
    coinAmount: number;
    platformFeeMinor: number;
    netAmountMinor: number;
    currency: string;
    description?: string | null;
    contributorId?: string | null;
    contributorName?: string | null;
    isWithdrawn: boolean;
    earnedAt: string;
}

export interface CreatorEarningsDetail {
    artistId: string;
    artistName: string;
    artistEmail?: string | null;
    totalNetMinor: number;
    unwithdrawnMinor: number;
    currency: string;
    earnings: PagedResult<CreatorEarningLine>;
}

export interface SplitRecipient {
    recipientUserId: string;
    recipientName: string;
    role: string;
    percentBps: number;
    allocatedNetMinor: number;
}

export interface TrackSplitBreakdown {
    trackId: string;
    trackTitle: string;
    trackNetEarnedMinor: number;
    trackEarnedCoins: number;
    recipients: SplitRecipient[];
}

export interface FinanceGift {
    id: string;
    senderId: string;
    senderName: string;
    recipientId?: string | null;
    recipientName?: string | null;
    recipientKind: string;
    giftType: string;
    coinValue: number;
    message?: string | null;
    acknowledged: boolean;
    reversed: boolean;
    sentAt: string;
}

export interface GiftTypeBreakdown {
    giftType: string;
    count: number;
    coinTotal: number;
}

export interface FinanceGiftSummary {
    totalGifts: number;
    totalCoinValue: number;
    reversedCount: number;
    toArtistsCount: number;
    toFansCount: number;
    byType: GiftTypeBreakdown[];
}

export interface FinanceUnlock {
    id: string;
    kind: string;
    userId: string;
    userDisplayName: string;
    trackId?: string | null;
    videoId?: string | null;
    contentTitle?: string | null;
    coinsSpent?: number | null;
    airtimeAmount?: number | null;
    provider?: string | null;
    phoneNumber?: string | null;
    status?: string | null;
    createdAt: string;
}

export interface AirtimeStatusCount {
    status: string;
    count: number;
    amount: number;
}

export interface FinanceUnlockSummary {
    totalContentUnlocks: number;
    totalCoinsSpent: number;
    trackUnlockCount: number;
    videoUnlockCount: number;
    totalAirtimeUnlocks: number;
    totalAirtimeAmount: number;
    airtimeByStatus: AirtimeStatusCount[];
}

export interface WithdrawalListItem {
    id: string;
    artistId: string;
    artistName: string;
    artistEmail?: string | null;
    amountMinor: number;
    processingFeeMinor: number;
    netAmountMinor: number;
    currency: string;
    status: string;
    bankName?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
    requestedAt: string;
    completedAt?: string | null;

    // Two-tier approval trail
    requesterRole?: string;
    labelUserId?: string | null;
    labelName?: string | null;
    labelDecisionAt?: string | null;
    labelRejectionReason?: string | null;
    rejectionReason?: string | null;
    rejectedByRole?: string | null;
}

export interface WithdrawalDetail {
    withdrawal: WithdrawalListItem;
    bankCode?: string | null;
    paymentReference?: string | null;
    gatewayTransactionId?: string | null;
    gatewayMessage?: string | null;
    adminNotes?: string | null;
    processingStartedAt?: string | null;
    failedAt?: string | null;
}

export interface PayoutListItem {
    id: string;
    batchId: string;
    recipientUserId: string;
    recipientName: string;
    recipientRole: string;
    amountMinor: number;
    muxifyFeeMinor: number;
    netAmountMinor: number;
    currency: string;
    status: string;
    reference?: string | null;
    providerInitiated: boolean;
    providerExecuted: boolean;
    initiatedAt: string;
    completedAt?: string | null;
    failureReason?: string | null;
}

export interface PayoutDetail {
    payout: PayoutListItem;
    labelUserId: string;
    labelName?: string | null;
}

export interface LedgerAccountBalance {
    account: string;
    debitsMinor: number;
    creditsMinor: number;
    netMinor: number;
    entryCount: number;
}

export interface ReconciliationSummary {
    currency: string;
    isBalanced: boolean;
    totalDebitsMinor: number;
    totalCreditsMinor: number;
    accounts: LedgerAccountBalance[];
}

// ----- Query shapes -----

export interface DateRange {
    from?: string;
    to?: string;
}

export interface TransactionQuery extends DateRange {
    type?: string;
    status?: string;
    userId?: string;
    minAmount?: number;
    maxAmount?: number;
    direction?: string;
    search?: string;
    sort?: string;
    page: number;
    pageSize: number;
}

export interface EarningsQuery extends DateRange {
    artistId?: string;
    type?: string;
    withdrawn?: boolean;
    search?: string;
    page: number;
    pageSize: number;
}

export interface GiftQuery extends DateRange {
    senderId?: string;
    recipientId?: string;
    type?: string;
    page: number;
    pageSize: number;
}

export interface UnlockQuery extends DateRange {
    kind?: string;
    userId?: string;
    status?: string;
    page: number;
    pageSize: number;
}

export interface WithdrawalQuery extends DateRange {
    status?: string;
    artistId?: string;
    /** snake_case platform role (artist|dj|creator|podcaster|record_label|contributor). */
    role?: string;
    search?: string;
    sort?: string;
    page: number;
    pageSize: number;
}

// ----- Maker-checker (dual-approval) -----

export interface FinanceApprovalRequestDto {
    id: string;
    actionType: string;
    targetType: string;
    targetId: string;
    summary: string;
    requestedByUserId: string;
    requestedByName: string;
    status: string;
    reviewedByUserId?: string | null;
    reviewedByName?: string | null;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
    createdAt: string;
}

export interface ApprovalRequestQuery {
    status?: string;
    page: number;
    pageSize: number;
}

export interface FinanceApprovalSummaryDto {
    pendingReview: number;
    approved: number;
    rejected: number;
}

export interface PayoutQuery extends DateRange {
    status?: string;
    batchId?: string;
    recipientUserId?: string;
    role?: string;
    page: number;
    pageSize: number;
}

// ----- Payouts group (Tower 15) — payout accounts + payout audit trail -----

/** A saved bank/payout destination for a creator. `status` ∈ Pending|Active|Inactive|Failed. */
export interface PayoutAccountDto {
    id: string;
    artistId: string;
    artistName?: string | null;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    currency: string;
    isDefault: boolean;
    status: string;
    nickname?: string | null;
    verifiedAt?: string | null;
    lastUsedAt?: string | null;
    createdAt: string;
}

export interface PayoutAccountQuery {
    status?: string;
    artistId?: string;
    search?: string;
    page: number;
    pageSize: number;
}

/**
 * A payout-related admin action record. `action` is one of WithdrawalApproved |
 * WithdrawalRejected | WithdrawalRetried | WithdrawalMarkedPaid | PayoutRetried |
 * PayoutCancelled.
 */
export interface PayoutAuditEntryDto {
    id: string;
    actorName: string;
    action: string;
    targetType: string;
    targetId?: string | null;
    summary: string;
    createdAt: string;
}

export interface PayoutAuditQuery extends DateRange {
    action?: string;
    page: number;
    pageSize: number;
}
