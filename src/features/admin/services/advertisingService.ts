import { api } from '@shared/services/api';
import type {
    AdAnalyticsDto,
    AdCampaignDetailDto,
    AdCampaignQuery,
    AdCampaignsPage,
    AdCreativeQuery,
    AdCreativesPage,
    AdInvoiceDto,
    AdInvoiceQuery,
    AdInvoicesPage,
    AdModerationQuery,
    AdOverviewDto,
    AdPlacementDto,
    AdPlacementInventoryDto,
    AdReviewPage,
    AdvertiserDetailDto,
    AdvertiserQuery,
    AdvertisersPage,
    AdWalletQuery,
    AdWalletsPage,
    AdWalletTransactionsPage,
    AnalyticsQuery,
    BillingQuery,
    BillingReportDto,
    CreatePlacementRequest,
    GenerateInvoiceRequest,
    OptionalReasonRequest,
    ReasonRequest,
    ReviewQuery,
    UpdatePlacementRequest,
    VoidInvoiceRequest,
    WalletAdjustRequest,
    WalletPagedQuery,
} from '../types/advertising';

/**
 * Typed client for the admin Advertising suite (Phase 3 Group 7 — Towers 17 & 18).
 * Every method targets `/api/v1/admin/ads/*`. Read-only summaries (overview,
 * placements, billing, analytics) plus advertiser/campaign/wallet lifecycle.
 * Mirrors `monetizationService` / `financeService` style.
 */
const ADS = '/admin/ads';

/** Strips undefined/empty params so axios doesn't serialise `?from=undefined`. */
const clean = (query: object): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') out[k] = v;
    });
    return out;
};

export const advertisingService = {
    /* ------------------------------- Overview ------------------------------ */
    getOverview: async (): Promise<AdOverviewDto> => {
        const { data } = await api.get<AdOverviewDto>(`${ADS}/overview`);
        return data;
    },

    /* ------------------------------ Advertisers ---------------------------- */
    getAdvertisers: async (query: AdvertiserQuery): Promise<AdvertisersPage> => {
        const { data } = await api.get<AdvertisersPage>(`${ADS}/advertisers`, {
            params: clean(query),
        });
        return data;
    },
    getAdvertiser: async (userId: string): Promise<AdvertiserDetailDto> => {
        const { data } = await api.get<AdvertiserDetailDto>(`${ADS}/advertisers/${userId}`);
        return data;
    },
    approveVerification: async (userId: string): Promise<void> => {
        await api.post(`${ADS}/advertisers/${userId}/verify/approve`);
    },
    rejectVerification: async (userId: string, payload: ReasonRequest): Promise<void> => {
        await api.post(`${ADS}/advertisers/${userId}/verify/reject`, payload);
    },

    /* ------------------------------- Campaigns ----------------------------- */
    getCampaigns: async (query: AdCampaignQuery): Promise<AdCampaignsPage> => {
        const { data } = await api.get<AdCampaignsPage>(`${ADS}/campaigns`, {
            params: clean(query),
        });
        return data;
    },
    getCampaign: async (id: string): Promise<AdCampaignDetailDto> => {
        const { data } = await api.get<AdCampaignDetailDto>(`${ADS}/campaigns/${id}`);
        return data;
    },
    approveCampaign: async (id: string): Promise<void> => {
        await api.post(`${ADS}/campaigns/${id}/approve`);
    },
    pauseCampaign: async (id: string): Promise<void> => {
        await api.post(`${ADS}/campaigns/${id}/pause`);
    },
    resumeCampaign: async (id: string): Promise<void> => {
        await api.post(`${ADS}/campaigns/${id}/resume`);
    },
    rejectCampaign: async (id: string, payload: ReasonRequest): Promise<void> => {
        await api.post(`${ADS}/campaigns/${id}/reject`, payload);
    },
    stopCampaign: async (id: string, payload: OptionalReasonRequest): Promise<void> => {
        await api.post(`${ADS}/campaigns/${id}/stop`, payload);
    },

    /* ------------------------------- Creatives ----------------------------- */
    getCreatives: async (query: AdCreativeQuery): Promise<AdCreativesPage> => {
        const { data } = await api.get<AdCreativesPage>(`${ADS}/creatives`, {
            params: clean(query),
        });
        return data;
    },
    getCreativeReview: async (query: ReviewQuery): Promise<AdReviewPage> => {
        const { data } = await api.get<AdReviewPage>(`${ADS}/creative-review`, {
            params: clean(query),
        });
        return data;
    },
    getTargetingReview: async (query: ReviewQuery): Promise<AdReviewPage> => {
        const { data } = await api.get<AdReviewPage>(`${ADS}/targeting-review`, {
            params: clean(query),
        });
        return data;
    },

    /* ------------------------------- Placements ---------------------------- */
    getPlacements: async (): Promise<AdPlacementDto[]> => {
        const { data } = await api.get<AdPlacementDto[]>(`${ADS}/placements`);
        return data;
    },
    getPlacementInventory: async (): Promise<AdPlacementInventoryDto[]> => {
        const { data } = await api.get<AdPlacementInventoryDto[]>(`${ADS}/placements/inventory`);
        return data;
    },
    createPlacement: async (
        payload: CreatePlacementRequest,
    ): Promise<AdPlacementInventoryDto> => {
        const { data } = await api.post<AdPlacementInventoryDto>(`${ADS}/placements`, payload);
        return data;
    },
    updatePlacement: async (
        id: string,
        payload: UpdatePlacementRequest,
    ): Promise<AdPlacementInventoryDto> => {
        const { data } = await api.put<AdPlacementInventoryDto>(
            `${ADS}/placements/${id}`,
            payload,
        );
        return data;
    },
    enablePlacement: async (id: string): Promise<void> => {
        await api.post(`${ADS}/placements/${id}/enable`);
    },
    disablePlacement: async (id: string): Promise<void> => {
        await api.post(`${ADS}/placements/${id}/disable`);
    },

    /* -------------------------------- Wallets ------------------------------ */
    getWallets: async (query: AdWalletQuery): Promise<AdWalletsPage> => {
        const { data } = await api.get<AdWalletsPage>(`${ADS}/wallets`, {
            params: clean(query),
        });
        return data;
    },
    getWalletTransactions: async (
        userId: string,
        query: WalletPagedQuery,
    ): Promise<AdWalletTransactionsPage> => {
        const { data } = await api.get<AdWalletTransactionsPage>(
            `${ADS}/wallets/${userId}/transactions`,
            { params: clean(query) },
        );
        return data;
    },
    creditWallet: async (userId: string, payload: WalletAdjustRequest): Promise<void> => {
        await api.post(`${ADS}/wallets/${userId}/credit`, payload);
    },
    refundWallet: async (userId: string, payload: WalletAdjustRequest): Promise<void> => {
        await api.post(`${ADS}/wallets/${userId}/refund`, payload);
    },

    /* ------------------------------- Billing ------------------------------- */
    getBilling: async (query: BillingQuery): Promise<BillingReportDto> => {
        const { data } = await api.get<BillingReportDto>(`${ADS}/billing`, {
            params: clean(query),
        });
        return data;
    },

    /* ------------------------------- Invoices ------------------------------ */
    getInvoices: async (query: AdInvoiceQuery): Promise<AdInvoicesPage> => {
        const { data } = await api.get<AdInvoicesPage>(`${ADS}/invoices`, {
            params: clean(query),
        });
        return data;
    },
    getInvoice: async (id: string): Promise<AdInvoiceDto> => {
        const { data } = await api.get<AdInvoiceDto>(`${ADS}/invoices/${id}`);
        return data;
    },
    generateInvoice: async (payload: GenerateInvoiceRequest): Promise<AdInvoiceDto> => {
        const { data } = await api.post<AdInvoiceDto>(`${ADS}/invoices/generate`, payload);
        return data;
    },
    issueInvoice: async (id: string): Promise<void> => {
        await api.post(`${ADS}/invoices/${id}/issue`);
    },
    markInvoicePaid: async (id: string): Promise<void> => {
        await api.post(`${ADS}/invoices/${id}/mark-paid`);
    },
    voidInvoice: async (id: string, payload: VoidInvoiceRequest): Promise<void> => {
        await api.post(`${ADS}/invoices/${id}/void`, payload);
    },

    /* ------------------------------- Analytics ----------------------------- */
    getAnalytics: async (query: AnalyticsQuery): Promise<AdAnalyticsDto> => {
        const { data } = await api.get<AdAnalyticsDto>(`${ADS}/analytics`, {
            params: clean(query),
        });
        return data;
    },

    /* ------------------------------ Moderation ----------------------------- */
    getModeration: async (query: AdModerationQuery): Promise<AdCampaignsPage> => {
        const { data } = await api.get<AdCampaignsPage>(`${ADS}/moderation`, {
            params: clean(query),
        });
        return data;
    },
};
