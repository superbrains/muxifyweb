import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { recordLabelService } from '../services/recordLabelService';
import { labelKeys } from './useLabelSummary';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import type { InviteArtistRequest } from '../types';

export const useRoster = () =>
    useQuery({
        queryKey: labelKeys.roster,
        queryFn: () => recordLabelService.getRoster(),
        staleTime: 60_000,
    });

export const useInvitations = () =>
    useQuery({
        queryKey: labelKeys.invitations,
        queryFn: () => recordLabelService.getInvitations(),
        staleTime: 60_000,
    });

export const useInviteArtist = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (req: InviteArtistRequest) => recordLabelService.inviteArtist(req),
        onSuccess: () => {
            toast.success('Invitation sent', 'The artist will receive an email.');
            qc.invalidateQueries({ queryKey: labelKeys.invitations });
            qc.invalidateQueries({ queryKey: labelKeys.summary });
        },
        onError: (err) => {
            toast.error('Could not send invitation', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};

export const useRemoveArtist = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (artistUserId: string) => recordLabelService.removeArtist(artistUserId),
        onSuccess: () => {
            toast.success('Removed from roster', '');
            qc.invalidateQueries({ queryKey: labelKeys.roster });
            qc.invalidateQueries({ queryKey: labelKeys.summary });
        },
        onError: (err) => {
            toast.error('Could not remove artist', getApiErrorMessage(err, 'Please try again.'));
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
            qc.invalidateQueries({ queryKey: labelKeys.invitations });
        },
        onError: (err) => {
            toast.error('Could not revoke invitation', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};
