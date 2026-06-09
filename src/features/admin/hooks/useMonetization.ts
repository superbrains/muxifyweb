import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import {
    disputeService,
    monetizationService,
    royaltyService,
    sponsorshipService,
} from '../services/monetizationService';
import { adminKeys } from './adminKeys';
import type {
    AssignDisputeRequest,
    CreateDisputeRequest,
    CreateSponsorshipRequest,
    DateRangeQuery,
    DisputeNoteRequest,
    DisputeQuery,
    DisputeStatusRequest,
    ReasonRequest,
    ResolveDisputeRequest,
    RoyaltyTracksQuery,
    SponsorshipQuery,
    UpdateSplitsRequest,
    UpdateSponsorshipRequest,
} from '../types/monetization';

/* --------------------------------- Queries -------------------------------- */

export const useRevenue = (range: DateRangeQuery) =>
    useQuery({
        queryKey: adminKeys.monetization.revenue(range),
        queryFn: () => monetizationService.getRevenue(range),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useCommission = (range: DateRangeQuery) =>
    useQuery({
        queryKey: adminKeys.monetization.commission(range),
        queryFn: () => monetizationService.getCommission(range),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useRoyalties = (range: DateRangeQuery) =>
    useQuery({
        queryKey: adminKeys.monetization.royalties(range),
        queryFn: () => monetizationService.getRoyalties(range),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useRoyaltyTracks = (query: RoyaltyTracksQuery) =>
    useQuery({
        queryKey: adminKeys.royalties.tracks(query),
        queryFn: () => royaltyService.getTracks(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useRoyaltyTrack = (trackId: string | null) =>
    useQuery({
        queryKey: adminKeys.royalties.track(trackId ?? ''),
        queryFn: () => royaltyService.getTrack(trackId as string),
        enabled: trackId !== null,
        staleTime: 30_000,
    });

export const useSponsorships = (query: SponsorshipQuery) =>
    useQuery({
        queryKey: adminKeys.sponsorships.list(query),
        queryFn: () => sponsorshipService.list(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useSponsorship = (id: string | null) =>
    useQuery({
        queryKey: adminKeys.sponsorships.detail(id ?? ''),
        queryFn: () => sponsorshipService.get(id as string),
        enabled: id !== null,
        staleTime: 30_000,
    });

export const useDisputes = (query: DisputeQuery) =>
    useQuery({
        queryKey: adminKeys.disputes.list(query),
        queryFn: () => disputeService.list(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useDispute = (id: string | null) =>
    useQuery({
        queryKey: adminKeys.disputes.detail(id ?? ''),
        queryFn: () => disputeService.get(id as string),
        enabled: id !== null,
        staleTime: 30_000,
    });

/* -------------------------------- Mutations ------------------------------- */

type QC = ReturnType<typeof useQueryClient>;

const invalidateRoyalties = (qc: QC) =>
    qc.invalidateQueries({ queryKey: adminKeys.royalties.root });
const invalidateSponsorships = (qc: QC) =>
    qc.invalidateQueries({ queryKey: adminKeys.sponsorships.root });
const invalidateDisputes = (qc: QC) =>
    qc.invalidateQueries({ queryKey: adminKeys.disputes.root });

/**
 * Shared mutation factory mirroring `useDiscoveryMutation` — emits a toast on
 * success/error and runs `invalidate` so list + detail views refresh.
 */
const useMonetizationMutation = <TArgs>(
    mutationFn: (args: TArgs) => Promise<unknown>,
    success: string,
    failure: string,
    invalidate: (qc: QC) => void,
) => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn,
        onSuccess: () => {
            toast.success(success);
            invalidate(qc);
        },
        onError: (err) => toast.error(failure, getApiErrorMessage(err, 'Please try again.')),
    });
};

/* ------------------------------ Royalty splits ---------------------------- */

export const useUpdateSplits = () =>
    useMonetizationMutation(
        ({ trackId, payload }: { trackId: string; payload: UpdateSplitsRequest }) =>
            royaltyService.updateSplits(trackId, payload),
        'Splits updated.',
        'Could not update splits',
        invalidateRoyalties,
    );

export const useFreezeTrack = () =>
    useMonetizationMutation(
        ({ trackId, payload }: { trackId: string; payload: ReasonRequest }) =>
            royaltyService.freeze(trackId, payload),
        'Track splits frozen.',
        'Could not freeze splits',
        invalidateRoyalties,
    );

export const useUnfreezeTrack = () =>
    useMonetizationMutation(
        ({ trackId, payload }: { trackId: string; payload: ReasonRequest }) =>
            royaltyService.unfreeze(trackId, payload),
        'Track splits unfrozen.',
        'Could not unfreeze splits',
        invalidateRoyalties,
    );

export const useDisputeTrack = () =>
    useMonetizationMutation(
        ({ trackId, payload }: { trackId: string; payload: ReasonRequest }) =>
            royaltyService.dispute(trackId, payload),
        'Split dispute raised.',
        'Could not raise dispute',
        invalidateRoyalties,
    );

export const useResolveTrackDispute = () =>
    useMonetizationMutation(
        ({ trackId, payload }: { trackId: string; payload: ReasonRequest }) =>
            royaltyService.resolveDispute(trackId, payload),
        'Split dispute resolved.',
        'Could not resolve dispute',
        invalidateRoyalties,
    );

/* ------------------------------ Sponsorships ------------------------------ */

export const useCreateSponsorship = () =>
    useMonetizationMutation(
        (payload: CreateSponsorshipRequest) => sponsorshipService.create(payload),
        'Sponsorship created.',
        'Could not create sponsorship',
        invalidateSponsorships,
    );

export const useUpdateSponsorship = () =>
    useMonetizationMutation(
        ({ id, payload }: { id: string; payload: UpdateSponsorshipRequest }) =>
            sponsorshipService.update(id, payload),
        'Sponsorship updated.',
        'Could not update sponsorship',
        invalidateSponsorships,
    );

export const useApproveSponsorship = () =>
    useMonetizationMutation(
        (id: string) => sponsorshipService.approve(id),
        'Sponsorship approved.',
        'Could not approve sponsorship',
        invalidateSponsorships,
    );

export const useActivateSponsorship = () =>
    useMonetizationMutation(
        (id: string) => sponsorshipService.activate(id),
        'Sponsorship activated.',
        'Could not activate sponsorship',
        invalidateSponsorships,
    );

export const useCompleteSponsorship = () =>
    useMonetizationMutation(
        (id: string) => sponsorshipService.complete(id),
        'Sponsorship completed.',
        'Could not complete sponsorship',
        invalidateSponsorships,
    );

export const useRejectSponsorship = () =>
    useMonetizationMutation(
        ({ id, payload }: { id: string; payload: ReasonRequest }) =>
            sponsorshipService.reject(id, payload),
        'Sponsorship rejected.',
        'Could not reject sponsorship',
        invalidateSponsorships,
    );

export const useCancelSponsorship = () =>
    useMonetizationMutation(
        ({ id, payload }: { id: string; payload: ReasonRequest }) =>
            sponsorshipService.cancel(id, payload),
        'Sponsorship cancelled.',
        'Could not cancel sponsorship',
        invalidateSponsorships,
    );

/* -------------------------------- Disputes -------------------------------- */

export const useOpenDispute = () =>
    useMonetizationMutation(
        (payload: CreateDisputeRequest) => disputeService.open(payload),
        'Case opened.',
        'Could not open case',
        invalidateDisputes,
    );

export const useAssignDispute = () =>
    useMonetizationMutation(
        ({ id, payload }: { id: string; payload: AssignDisputeRequest }) =>
            disputeService.assign(id, payload),
        'Case assigned.',
        'Could not assign case',
        invalidateDisputes,
    );

export const useSetDisputeStatus = () =>
    useMonetizationMutation(
        ({ id, payload }: { id: string; payload: DisputeStatusRequest }) =>
            disputeService.setStatus(id, payload),
        'Case status updated.',
        'Could not update status',
        invalidateDisputes,
    );

export const useAddDisputeNote = () =>
    useMonetizationMutation(
        ({ id, payload }: { id: string; payload: DisputeNoteRequest }) =>
            disputeService.addNote(id, payload),
        'Note added.',
        'Could not add note',
        invalidateDisputes,
    );

export const useResolveDispute = () =>
    useMonetizationMutation(
        ({ id, payload }: { id: string; payload: ResolveDisputeRequest }) =>
            disputeService.resolve(id, payload),
        'Case resolved.',
        'Could not resolve case',
        invalidateDisputes,
    );

export const useRejectDispute = () =>
    useMonetizationMutation(
        ({ id, payload }: { id: string; payload: ReasonRequest }) =>
            disputeService.reject(id, payload),
        'Case rejected.',
        'Could not reject case',
        invalidateDisputes,
    );
