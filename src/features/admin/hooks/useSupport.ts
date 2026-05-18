import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { adminService } from '../services/adminService';
import { adminKeys } from './adminKeys';
import type {
    ModerationAction,
    ModerationQuery,
    TicketQuery,
    TicketStatus,
} from '../types';

/* -------------------------------- Tickets --------------------------------- */

export const useTickets = (query: TicketQuery) =>
    useQuery({
        queryKey: adminKeys.tickets(query),
        queryFn: () => adminService.getTickets(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useTicket = (id: string | null) =>
    useQuery({
        queryKey: adminKeys.ticket(id ?? ''),
        queryFn: () => adminService.getTicket(id as string),
        enabled: !!id,
    });

const invalidateTicketViews = (
    qc: ReturnType<typeof useQueryClient>,
    id: string,
) => {
    qc.invalidateQueries({ queryKey: adminKeys.tickets() });
    qc.invalidateQueries({ queryKey: adminKeys.ticket(id) });
    qc.invalidateQueries({ queryKey: adminKeys.overview });
};

export const useReplyToTicket = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ id, message }: { id: string; message: string }) =>
            adminService.replyToTicket(id, message),
        onSuccess: (_data, { id }) => {
            toast.success('Reply sent', 'The requester has been notified.');
            invalidateTicketViews(qc, id);
        },
        onError: (err) => {
            toast.error('Could not send reply', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};

export const useUpdateTicketStatus = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({
            id,
            status,
            assigneeId,
        }: {
            id: string;
            status?: TicketStatus;
            assigneeId?: string;
        }) => adminService.updateTicketStatus(id, { status, assigneeId }),
        onSuccess: (_data, { id }) => {
            toast.success('Ticket updated', '');
            invalidateTicketViews(qc, id);
        },
        onError: (err) => {
            toast.error('Could not update ticket', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};

/* ------------------------------- Moderation ------------------------------- */

export const useModerationItems = (query: ModerationQuery) =>
    useQuery({
        queryKey: adminKeys.moderation(query),
        queryFn: () => adminService.getModerationItems(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

export const useResolveModerationItem = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({
            id,
            action,
            reason,
        }: {
            id: string;
            action: ModerationAction;
            reason?: string;
        }) => adminService.resolveModerationItem(id, { action, reason }),
        onSuccess: () => {
            toast.success('Report resolved', '');
            qc.invalidateQueries({ queryKey: adminKeys.moderation() });
            qc.invalidateQueries({ queryKey: adminKeys.overview });
        },
        onError: (err) => {
            toast.error('Could not resolve report', getApiErrorMessage(err, 'Please try again.'));
        },
    });
};
