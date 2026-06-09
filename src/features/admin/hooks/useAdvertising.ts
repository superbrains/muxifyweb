import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { advertisingService } from '../services/advertisingService';
import { adminKeys } from './adminKeys';
import type {
    AdCampaignQuery,
    AdCreativeQuery,
    AdInvoiceQuery,
    AdModerationQuery,
    AdvertiserQuery,
    AdWalletQuery,
    AnalyticsQuery,
    BillingQuery,
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

/* --------------------------------- Queries -------------------------------- */

export const useAdOverview = () =>
    useQuery({
        queryKey: adminKeys.advertising.overview,
        queryFn: () => advertisingService.getOverview(),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useAdvertisers = (query: AdvertiserQuery) =>
    useQuery({
        queryKey: adminKeys.advertising.advertisers(query),
        queryFn: () => advertisingService.getAdvertisers(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useAdvertiser = (userId: string | null) =>
    useQuery({
        queryKey: adminKeys.advertising.advertiser(userId ?? ''),
        queryFn: () => advertisingService.getAdvertiser(userId as string),
        enabled: userId !== null,
        staleTime: 30_000,
    });

export const useAdCampaigns = (query: AdCampaignQuery) =>
    useQuery({
        queryKey: adminKeys.advertising.campaigns(query),
        queryFn: () => advertisingService.getCampaigns(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useAdCampaign = (id: string | null) =>
    useQuery({
        queryKey: adminKeys.advertising.campaign(id ?? ''),
        queryFn: () => advertisingService.getCampaign(id as string),
        enabled: id !== null,
        staleTime: 30_000,
    });

export const useAdCreatives = (query: AdCreativeQuery) =>
    useQuery({
        queryKey: adminKeys.advertising.creatives(query),
        queryFn: () => advertisingService.getCreatives(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useCreativeReview = (query: ReviewQuery) =>
    useQuery({
        queryKey: adminKeys.advertising.creativeReview(query),
        queryFn: () => advertisingService.getCreativeReview(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useTargetingReview = (query: ReviewQuery) =>
    useQuery({
        queryKey: adminKeys.advertising.targetingReview(query),
        queryFn: () => advertisingService.getTargetingReview(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useAdPlacements = () =>
    useQuery({
        queryKey: adminKeys.advertising.placements,
        queryFn: () => advertisingService.getPlacements(),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const usePlacementInventory = () =>
    useQuery({
        queryKey: adminKeys.advertising.placementInventory(),
        queryFn: () => advertisingService.getPlacementInventory(),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useAdInvoices = (query: AdInvoiceQuery) =>
    useQuery({
        queryKey: adminKeys.advertising.invoices(query),
        queryFn: () => advertisingService.getInvoices(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useAdInvoice = (id: string | null) =>
    useQuery({
        queryKey: adminKeys.advertising.invoice(id ?? ''),
        queryFn: () => advertisingService.getInvoice(id as string),
        enabled: id !== null,
        staleTime: 30_000,
    });

export const useAdWallets = (query: AdWalletQuery) =>
    useQuery({
        queryKey: adminKeys.advertising.wallets(query),
        queryFn: () => advertisingService.getWallets(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useAdWalletTransactions = (userId: string | null, query: WalletPagedQuery) =>
    useQuery({
        queryKey: adminKeys.advertising.walletTransactions(userId ?? '', query),
        queryFn: () => advertisingService.getWalletTransactions(userId as string, query),
        enabled: userId !== null,
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useAdBilling = (query: BillingQuery) =>
    useQuery({
        queryKey: adminKeys.advertising.billing(query),
        queryFn: () => advertisingService.getBilling(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useAdAnalytics = (query: AnalyticsQuery) =>
    useQuery({
        queryKey: adminKeys.advertising.analytics(query),
        queryFn: () => advertisingService.getAnalytics(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useAdModeration = (query: AdModerationQuery) =>
    useQuery({
        queryKey: adminKeys.advertising.moderation(query),
        queryFn: () => advertisingService.getModeration(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

/* -------------------------------- Mutations ------------------------------- */

type QC = ReturnType<typeof useQueryClient>;

const invalidateAdvertising = (qc: QC) =>
    qc.invalidateQueries({ queryKey: adminKeys.advertising.root });

/**
 * Shared mutation factory mirroring `useMonetizationMutation` — emits a toast on
 * success/error and invalidates the whole advertising namespace so list + detail
 * views refresh.
 */
const useAdvertisingMutation = <TArgs>(
    mutationFn: (args: TArgs) => Promise<unknown>,
    success: string,
    failure: string,
) => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn,
        onSuccess: () => {
            toast.success(success);
            invalidateAdvertising(qc);
        },
        onError: (err) => toast.error(failure, getApiErrorMessage(err, 'Please try again.')),
    });
};

/* ------------------------------ Verification ------------------------------ */

export const useApproveVerification = () =>
    useAdvertisingMutation(
        (userId: string) => advertisingService.approveVerification(userId),
        'Advertiser verified.',
        'Could not approve verification',
    );

export const useRejectVerification = () =>
    useAdvertisingMutation(
        ({ userId, payload }: { userId: string; payload: ReasonRequest }) =>
            advertisingService.rejectVerification(userId, payload),
        'Verification rejected.',
        'Could not reject verification',
    );

/* ------------------------------- Campaigns -------------------------------- */

export const useApproveCampaign = () =>
    useAdvertisingMutation(
        (id: string) => advertisingService.approveCampaign(id),
        'Campaign approved.',
        'Could not approve campaign',
    );

export const usePauseCampaign = () =>
    useAdvertisingMutation(
        (id: string) => advertisingService.pauseCampaign(id),
        'Campaign paused.',
        'Could not pause campaign',
    );

export const useResumeCampaign = () =>
    useAdvertisingMutation(
        (id: string) => advertisingService.resumeCampaign(id),
        'Campaign resumed.',
        'Could not resume campaign',
    );

export const useRejectCampaign = () =>
    useAdvertisingMutation(
        ({ id, payload }: { id: string; payload: ReasonRequest }) =>
            advertisingService.rejectCampaign(id, payload),
        'Campaign rejected.',
        'Could not reject campaign',
    );

export const useStopCampaign = () =>
    useAdvertisingMutation(
        ({ id, payload }: { id: string; payload: OptionalReasonRequest }) =>
            advertisingService.stopCampaign(id, payload),
        'Campaign stopped.',
        'Could not stop campaign',
    );

/* --------------------------------- Wallet --------------------------------- */

export const useCreditWallet = () =>
    useAdvertisingMutation(
        ({ userId, payload }: { userId: string; payload: WalletAdjustRequest }) =>
            advertisingService.creditWallet(userId, payload),
        'Wallet credited.',
        'Could not credit wallet',
    );

export const useRefundWallet = () =>
    useAdvertisingMutation(
        ({ userId, payload }: { userId: string; payload: WalletAdjustRequest }) =>
            advertisingService.refundWallet(userId, payload),
        'Wallet refunded.',
        'Could not refund wallet',
    );

/* -------------------------------- Invoices -------------------------------- */

export const useGenerateInvoice = () =>
    useAdvertisingMutation(
        (payload: GenerateInvoiceRequest) => advertisingService.generateInvoice(payload),
        'Invoice generated.',
        'Could not generate invoice',
    );

export const useIssueInvoice = () =>
    useAdvertisingMutation(
        (id: string) => advertisingService.issueInvoice(id),
        'Invoice issued.',
        'Could not issue invoice',
    );

export const useMarkInvoicePaid = () =>
    useAdvertisingMutation(
        (id: string) => advertisingService.markInvoicePaid(id),
        'Invoice marked paid.',
        'Could not mark invoice paid',
    );

export const useVoidInvoice = () =>
    useAdvertisingMutation(
        ({ id, payload }: { id: string; payload: VoidInvoiceRequest }) =>
            advertisingService.voidInvoice(id, payload),
        'Invoice voided.',
        'Could not void invoice',
    );

/* ------------------------------- Placements ------------------------------- */

export const useCreatePlacement = () =>
    useAdvertisingMutation(
        (payload: CreatePlacementRequest) => advertisingService.createPlacement(payload),
        'Placement created.',
        'Could not create placement',
    );

export const useUpdatePlacement = () =>
    useAdvertisingMutation(
        ({ id, payload }: { id: string; payload: UpdatePlacementRequest }) =>
            advertisingService.updatePlacement(id, payload),
        'Placement updated.',
        'Could not update placement',
    );

export const useEnablePlacement = () =>
    useAdvertisingMutation(
        (id: string) => advertisingService.enablePlacement(id),
        'Placement enabled.',
        'Could not enable placement',
    );

export const useDisablePlacement = () =>
    useAdvertisingMutation(
        (id: string) => advertisingService.disablePlacement(id),
        'Placement disabled.',
        'Could not disable placement',
    );
