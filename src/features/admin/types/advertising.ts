/* ------------------------------------------------------------------ *
 * Advertising admin types (Phase 3 Group 7 — Towers 17 & 18). Mirror the
 * backend `/admin/ads/*` DTOs. Enum-ish fields are typed as `string` on the
 * DTOs (enums serialise as strings); the unions + option arrays below drive
 * the filter selects and lifecycle action labels. Money fields end in `Minor`.
 * ------------------------------------------------------------------ */

import type { PagedResult } from './index';

/* ------------------------------------------------------------------ *
 * Enum string vocab
 * ------------------------------------------------------------------ */

export type CampaignStatus =
    | 'Draft'
    | 'PendingApproval'
    | 'Active'
    | 'Paused'
    | 'Stopped'
    | 'Completed'
    | 'Rejected';

export type CampaignType =
    | 'Banner'
    | 'Spotlight'
    | 'PromotedTrack'
    | 'PromotedArtist'
    | 'AudioAd';

export type WalletTransactionType =
    | 'Deposit'
    | 'Withdrawal'
    | 'CampaignSpend'
    | 'Refund'
    | 'Bonus';

export type AdVerificationStatus = 'NotSubmitted' | 'Pending' | 'Verified' | 'Rejected';

export const CAMPAIGN_STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Draft', label: 'Draft' },
    { value: 'PendingApproval', label: 'Pending approval' },
    { value: 'Active', label: 'Active' },
    { value: 'Paused', label: 'Paused' },
    { value: 'Stopped', label: 'Stopped' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Rejected', label: 'Rejected' },
];

export const CAMPAIGN_TYPE_OPTIONS = [
    { value: 'All', label: 'All types' },
    { value: 'Banner', label: 'Banner' },
    { value: 'Spotlight', label: 'Spotlight' },
    { value: 'PromotedTrack', label: 'Promoted track' },
    { value: 'PromotedArtist', label: 'Promoted artist' },
    { value: 'AudioAd', label: 'Audio ad' },
];

export const VERIFICATION_STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'NotSubmitted', label: 'Not submitted' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Verified', label: 'Verified' },
    { value: 'Rejected', label: 'Rejected' },
];

/* ------------------------------------------------------------------ *
 * Overview
 * ------------------------------------------------------------------ */

export interface AdStatusCountDto {
    status: string;
    count: number;
}

export interface AdOverviewDto {
    currency: string;
    totalCampaigns: number;
    activeCampaigns: number;
    pendingApprovalCount: number;
    totalSpendMinor: number;
    totalWalletBalanceMinor: number;
    totalImpressions: number;
    totalClicks: number;
    avgCtr: number;
    advertiserCount: number;
    byStatus: AdStatusCountDto[];
}

/* ------------------------------------------------------------------ *
 * Advertisers
 * ------------------------------------------------------------------ */

export interface AdvertiserListItemDto {
    userId: string;
    fullName: string;
    email: string;
    companyName?: string | null;
    industry?: string | null;
    verificationStatus: string;
    totalAdSpendNgn: number;
    activeCampaignCount: number;
    totalCampaignCount: number;
    walletBalanceMinor: number;
    createdAt: string;
}

export interface AdvertiserBusinessAddressDto {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | null;
}

export interface AdvertiserDetailDto extends AdvertiserListItemDto {
    businessPhone?: string | null;
    website?: string | null;
    businessAddress?: AdvertiserBusinessAddressDto | null;
    verificationDocumentUrl?: string | null;
    verificationRejectionReason?: string | null;
    verificationSubmittedAt?: string | null;
    verificationReviewedAt?: string | null;
}

export interface AdvertiserQuery {
    search?: string;
    verificationStatus?: string;
    page: number;
    pageSize: number;
}

/* ------------------------------------------------------------------ *
 * Campaigns
 * ------------------------------------------------------------------ */

export interface AdCampaignListItemDto {
    id: string;
    advertiserId: string;
    advertiserName: string;
    name: string;
    type: string;
    status: string;
    budgetMinor: number;
    dailyLimitMinor?: number | null;
    amountSpentMinor: number;
    remainingBudgetMinor: number;
    currency: string;
    startDate: string;
    endDate?: string | null;
    impressions: number;
    clicks: number;
    clickThroughRate: number;
    createdAt: string;
}

export interface AdCampaignDetailDto extends AdCampaignListItemDto {
    targetContentId?: string | null;
    targetContentType?: string | null;
    creativeUrl?: string | null;
    coverImageUrl?: string | null;
    clickUrl?: string | null;
    targetingSettings?: string | null;
    rejectionReason?: string | null;
}

export interface AdCampaignQuery {
    status?: string;
    type?: string;
    advertiserId?: string;
    search?: string;
    from?: string;
    to?: string;
    page: number;
    pageSize: number;
}

export interface AdModerationQuery {
    status?: string;
    page: number;
    pageSize: number;
}

export interface ReviewQuery {
    page: number;
    pageSize: number;
}

/* ------------------------------------------------------------------ *
 * Creatives
 * ------------------------------------------------------------------ */

export interface AdCreativeDto {
    campaignId: string;
    campaignName: string;
    advertiserId: string;
    advertiserName: string;
    type: string;
    status: string;
    creativeUrl?: string | null;
    coverImageUrl?: string | null;
    clickUrl?: string | null;
    targetContentType?: string | null;
    targetContentId?: string | null;
    createdAt: string;
}

export interface AdCreativeQuery {
    type?: string;
    status?: string;
    search?: string;
    page: number;
    pageSize: number;
}

/* ------------------------------------------------------------------ *
 * Placements
 * ------------------------------------------------------------------ */

export interface AdPlacementDto {
    placement: string;
    activeCampaigns: number;
    totalCampaigns: number;
    totalSpendMinor: number;
}

/* ------------------------------------------------------------------ *
 * Wallets
 * ------------------------------------------------------------------ */

export interface AdWalletDto {
    id: string;
    userId: string;
    advertiserName: string;
    balanceMinor: number;
    totalDepositedMinor: number;
    totalSpentMinor: number;
    totalRefundedMinor: number;
    currency: string;
    isActive: boolean;
    createdAt: string;
}

export interface AdWalletTransactionDto {
    id: string;
    type: string;
    amountMinor: number;
    balanceAfterMinor: number;
    description: string;
    referenceId?: string | null;
    referenceType?: string | null;
    paymentReference?: string | null;
    currency: string;
    createdAt: string;
}

export interface AdWalletQuery {
    search?: string;
    page: number;
    pageSize: number;
}

export interface WalletPagedQuery {
    page: number;
    pageSize: number;
}

export interface WalletAdjustRequest {
    amountMinor: number;
    reason: string;
}

/* ------------------------------------------------------------------ *
 * Billing / VAT
 * ------------------------------------------------------------------ */

export interface BillingReportRowDto {
    advertiserId: string;
    advertiserName: string;
    grossSpendMinor: number;
    vatMinor: number;
    totalMinor: number;
}

export interface BillingReportDto {
    currency: string;
    vatRatePercent: number;
    grossSpendMinor: number;
    vatMinor: number;
    totalMinor: number;
    rows: BillingReportRowDto[];
}

export interface BillingQuery {
    from?: string;
    to?: string;
    advertiserId?: string;
}

/* ------------------------------------------------------------------ *
 * Analytics
 * ------------------------------------------------------------------ */

export interface AdTopCampaignDto {
    campaignId: string;
    name: string;
    impressions: number;
    clicks: number;
    clickThroughRate: number;
    amountSpentMinor: number;
    costPerClickMinor: number;
}

export interface AdDailyMetricDto {
    date: string;
    impressions: number;
    clicks: number;
    spendMinor: number;
}

export interface AdAnalyticsDto {
    currency: string;
    totalImpressions: number;
    totalClicks: number;
    avgCtr: number;
    totalSpendMinor: number;
    topCampaigns: AdTopCampaignDto[];
    dailyMetrics: AdDailyMetricDto[];
}

export interface AnalyticsQuery {
    from?: string;
    to?: string;
    advertiserId?: string;
}

/* ------------------------------------------------------------------ *
 * Invoices (G7-A) — VAT-aware advertiser invoices with a lifecycle.
 * ------------------------------------------------------------------ */

export type AdInvoiceStatus = 'Draft' | 'Issued' | 'Paid' | 'Void';

export const AD_INVOICE_STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Issued', label: 'Issued' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Void', label: 'Void' },
];

export interface AdInvoiceDto {
    id: string;
    advertiserId: string;
    advertiserName: string;
    periodStart: string;
    periodEnd: string;
    grossSpendMinor: number;
    vatRatePercent: number;
    vatMinor: number;
    totalMinor: number;
    currency: string;
    status: AdInvoiceStatus;
    invoiceNumber: string;
    issuedAt?: string | null;
    paidAt?: string | null;
    voidReason?: string | null;
    createdAt: string;
}

export interface AdInvoiceQuery {
    status?: string;
    advertiserId?: string;
    page: number;
    pageSize: number;
}

export interface GenerateInvoiceRequest {
    advertiserId: string;
    periodStart: string;
    periodEnd: string;
}

export interface VoidInvoiceRequest {
    reason?: string;
}

/* ------------------------------------------------------------------ *
 * Placement inventory (G7-C) — managed placement slots with a
 * current-usage overlay (active/total campaigns) computed server-side.
 * ------------------------------------------------------------------ */

export interface AdPlacementInventoryDto {
    id: string;
    slug: string;
    name: string;
    surface: string;
    isEnabled: boolean;
    inventoryCap?: number | null;
    floorPriceMinor?: number | null;
    description?: string | null;
    activeCampaigns: number;
    totalCampaigns: number;
    createdAt: string;
}

export interface CreatePlacementRequest {
    slug: string;
    name: string;
    surface: string;
    isEnabled: boolean;
    inventoryCap?: number | null;
    floorPriceMinor?: number | null;
    description?: string | null;
}

export interface UpdatePlacementRequest {
    name: string;
    surface: string;
    inventoryCap?: number | null;
    floorPriceMinor?: number | null;
    description?: string | null;
}

/* ------------------------------------------------------------------ *
 * Shared request shapes
 * ------------------------------------------------------------------ */

export interface ReasonRequest {
    reason: string;
}

export interface OptionalReasonRequest {
    reason?: string | null;
}

/* ------------------------------------------------------------------ *
 * Paged aliases
 * ------------------------------------------------------------------ */

export type AdvertisersPage = PagedResult<AdvertiserListItemDto>;
export type AdCampaignsPage = PagedResult<AdCampaignListItemDto>;
export type AdCreativesPage = PagedResult<AdCreativeDto>;
export type AdReviewPage = PagedResult<AdCampaignDetailDto>;
export type AdWalletsPage = PagedResult<AdWalletDto>;
export type AdWalletTransactionsPage = PagedResult<AdWalletTransactionDto>;
export type AdInvoicesPage = PagedResult<AdInvoiceDto>;
