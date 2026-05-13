import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { recordLabelService } from '../services/recordLabelService';
import { labelKeys } from './useLabelSummary';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import type { InviteArtistRequest } from '../types';

/**
 * Active-roster-only — used by the artist picker, filter bar, and recipient picker.
 * For the unified roster-page list, use {@link useRosterEntries} instead.
 */
export const useRoster = () =>
    useQuery({
        queryKey: labelKeys.roster,
        queryFn: () => recordLabelService.getRoster(),
        staleTime: 60_000,
    });

/**
 * Unified roster-page list: roster members + invitations + deactivated rows.
 */
export const useRosterEntries = () =>
    useQuery({
        queryKey: labelKeys.rosterEntries,
        queryFn: () => recordLabelService.getRosterEntries(),
        staleTime: 60_000,
    });

const invalidateRosterViews = (qc: ReturnType<typeof useQueryClient>) => {
    qc.invalidateQueries({ queryKey: labelKeys.roster });
    qc.invalidateQueries({ queryKey: labelKeys.rosterEntries });
    qc.invalidateQueries({ queryKey: labelKeys.summary });
};

export const useInviteArtist = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (req: InviteArtistRequest) => recordLabelService.inviteArtist(req),
        onSuccess: () => {
            toast.success('Invitation sent', 'The artist will receive an email shortly.');
            invalidateRosterViews(qc);
        },
        onError: (err) => {
            toast.error('Could not send invitation', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};

export const useResendInvitation = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (invitationId: string) => recordLabelService.resendInvitation(invitationId),
        onSuccess: () => {
            toast.success('Invitation re-sent', 'A fresh link is on its way to the artist.');
            qc.invalidateQueries({ queryKey: labelKeys.rosterEntries });
        },
        onError: (err) => {
            toast.error('Could not resend invitation', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};

export const useDeactivateArtist = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (artistUserId: string) => recordLabelService.deactivateArtist(artistUserId),
        onSuccess: () => {
            toast.success('Artist deactivated', 'They no longer appear in your active roster.');
            invalidateRosterViews(qc);
        },
        onError: (err) => {
            toast.error('Could not deactivate artist', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};

export const useReactivateArtist = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (artistUserId: string) => recordLabelService.reactivateArtist(artistUserId),
        onSuccess: () => {
            toast.success('Artist reactivated', 'They are back on your active roster.');
            invalidateRosterViews(qc);
        },
        onError: (err) => {
            toast.error('Could not reactivate artist', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};

export const useRevokeInvitation = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (invitationId: string) =>
            recordLabelService.revokeInvitation(invitationId),
        onSuccess: () => {
            toast.success('Invitation revoked', '');
            qc.invalidateQueries({ queryKey: labelKeys.rosterEntries });
        },
        onError: (err) => {
            toast.error('Could not revoke invitation', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};
