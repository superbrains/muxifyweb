import React from 'react';
import {
    Avatar,
    Box,
    Button,
    HStack,
    Menu,
    Portal,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiMoreVertical } from 'react-icons/fi';
import { useChakraToast } from '@shared/hooks';
import {
    useDeactivateArtist,
    useInviteArtist,
    useReactivateArtist,
    useResendInvitation,
    useRevokeInvitation,
} from '../hooks/useRoster';
import { recordLabelService } from '../services/recordLabelService';
import type { RosterEntryDto, RosterEntryStatus } from '../types';

interface RosterEntryRowProps {
    entry: RosterEntryDto;
}

const STATUS_STYLES: Record<RosterEntryStatus, { bg: string; color: string; label: string }> = {
    Active: { bg: '#E7FFF7', color: '#16A34A', label: 'Active' },
    PendingOnboarding: { bg: '#FFF7E6', color: '#B7791F', label: 'Pending onboarding' },
    Invited: { bg: '#EEF2FF', color: '#4338CA', label: 'Invited' },
    Declined: { bg: '#F7FAFC', color: '#718096', label: 'Declined' },
    Revoked: { bg: '#F7FAFC', color: '#718096', label: 'Revoked' },
    Expired: { bg: '#FEF2F2', color: '#C53030', label: 'Expired' },
    Deactivated: { bg: '#F3F4F6', color: '#4B5563', label: 'Deactivated' },
};

function formatDate(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatExpiry(iso?: string): string {
    if (!iso) return '';
    const ms = new Date(iso).getTime() - Date.now();
    if (Number.isNaN(ms)) return '';
    if (ms <= 0) return 'Expired';
    const days = Math.floor(ms / 86_400_000);
    if (days >= 1) return `Expires in ${days} day${days === 1 ? '' : 's'}`;
    const hours = Math.floor(ms / 3_600_000);
    if (hours >= 1) return `Expires in ${hours}h`;
    const mins = Math.max(1, Math.floor(ms / 60_000));
    return `Expires in ${mins}m`;
}

export const RosterEntryRow: React.FC<RosterEntryRowProps> = ({ entry }) => {
    const toast = useChakraToast();
    const deactivate = useDeactivateArtist();
    const reactivate = useReactivateArtist();
    const resend = useResendInvitation();
    const revoke = useRevokeInvitation();
    const reinvite = useInviteArtist();

    const style = STATUS_STYLES[entry.status];

    const isRosterMember = entry.status === 'Active' || entry.status === 'PendingOnboarding';
    const isInvited = entry.status === 'Invited';
    const isDeactivated = entry.status === 'Deactivated';
    const isReinvitable =
        entry.status === 'Declined' ||
        entry.status === 'Expired' ||
        entry.status === 'Revoked';

    // Per-row pending state — disable the action button while *this* row's
    // mutation is in flight. Mirrors the pattern in the original InvitationsTable.
    const rowBusy =
        (deactivate.isPending && deactivate.variables === entry.artistUserId) ||
        (reactivate.isPending && reactivate.variables === entry.artistUserId) ||
        (resend.isPending && resend.variables === entry.invitationId) ||
        (revoke.isPending && revoke.variables === entry.invitationId) ||
        (reinvite.isPending && reinvite.variables?.email === entry.email);

    const handleCopyLink = async () => {
        if (!entry.invitationId) return;
        try {
            const res = await recordLabelService.resendInvitation(entry.invitationId);
            await navigator.clipboard.writeText(res.acceptUrl);
            toast.success('Link copied', 'A fresh link was also emailed to the artist.');
        } catch {
            toast.error('Could not copy the link', 'Please try again.');
        }
    };

    const subline = (() => {
        if (isInvited) return formatExpiry(entry.expiresAt);
        if (entry.status === 'Expired') return `Sent ${formatDate(entry.invitedAt)}`;
        if (entry.status === 'Declined' || entry.status === 'Revoked')
            return `Invited ${formatDate(entry.invitedAt)}`;
        if (isDeactivated) return `Deactivated ${formatDate(entry.deactivatedAt)}`;
        return entry.email ?? '';
    })();

    return (
        <HStack
            py={3}
            px={3}
            borderRadius="md"
            _hover={{ bg: 'primary.50' }}
            transition="background 150ms ease"
            justify="space-between"
            align="center"
        >
            <HStack gap={3} flex={1} minW={0}>
                <Avatar.Root size="sm">
                    <Avatar.Image src={entry.avatarUrl} />
                    <Avatar.Fallback name={entry.displayName} />
                </Avatar.Root>
                <VStack align="start" gap={0} minW={0}>
                    <HStack gap={2} wrap="wrap">
                        <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                            {entry.displayName}
                        </Text>
                        <Box
                            bg={style.bg}
                            color={style.color}
                            fontSize="9px"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            fontWeight="medium"
                            flexShrink={0}
                        >
                            {style.label}
                        </Box>
                        {entry.isVerified && (
                            <Box
                                bg="primary.70"
                                color="primary.600"
                                fontSize="9px"
                                px={2}
                                py={0.5}
                                borderRadius="full"
                                flexShrink={0}
                            >
                                Verified
                            </Box>
                        )}
                    </HStack>
                    <Text fontSize="10px" color="gray.500" lineClamp={1}>
                        {subline}
                    </Text>
                </VStack>
            </HStack>

            <HStack gap={6}>
                {isRosterMember && (
                    <VStack align="end" gap={0} display={{ base: 'none', md: 'flex' }}>
                        <Text fontSize="11px" color="gray.500">
                            30d streams
                        </Text>
                        <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                            {entry.monthlyStreams.toLocaleString()}
                        </Text>
                    </VStack>
                )}

                <Menu.Root>
                    <Menu.Trigger asChild>
                        <Button
                            variant="ghost"
                            size="xs"
                            px={2}
                            color="gray.500"
                            _hover={{ color: 'primary.500', bg: 'primary.50' }}
                            loading={rowBusy}
                            aria-label="Row actions"
                        >
                            <FiMoreVertical />
                        </Button>
                    </Menu.Trigger>
                    <Portal>
                        <Menu.Positioner>
                            <Menu.Content
                                minW="180px"
                                borderRadius="md"
                                boxShadow="lg"
                                p={1}
                                bg="white"
                                border="1px solid"
                                borderColor="gray.100"
                                zIndex={1500}
                            >
                                {isRosterMember && entry.artistUserId && (
                                    <Menu.Item
                                        value="deactivate"
                                        onClick={() => deactivate.mutate(entry.artistUserId!)}
                                        fontSize="xs"
                                        color="red.500"
                                        _hover={{ bg: 'red.50' }}
                                    >
                                        Deactivate
                                    </Menu.Item>
                                )}

                                {isInvited && entry.invitationId && (
                                    <>
                                        <Menu.Item
                                            value="resend"
                                            onClick={() => resend.mutate(entry.invitationId!)}
                                            fontSize="xs"
                                            _hover={{ bg: 'gray.50' }}
                                        >
                                            Resend email
                                        </Menu.Item>
                                        <Menu.Item
                                            value="copy"
                                            onClick={handleCopyLink}
                                            fontSize="xs"
                                            _hover={{ bg: 'gray.50' }}
                                        >
                                            Copy invite link
                                        </Menu.Item>
                                        <Menu.Item
                                            value="revoke"
                                            onClick={() => revoke.mutate(entry.invitationId!)}
                                            fontSize="xs"
                                            color="red.500"
                                            _hover={{ bg: 'red.50' }}
                                        >
                                            Revoke
                                        </Menu.Item>
                                    </>
                                )}

                                {isReinvitable && entry.email && (
                                    <Menu.Item
                                        value="reinvite"
                                        onClick={() => reinvite.mutate({ email: entry.email! })}
                                        fontSize="xs"
                                        _hover={{ bg: 'gray.50' }}
                                    >
                                        Re-invite
                                    </Menu.Item>
                                )}

                                {isDeactivated && entry.artistUserId && (
                                    <Menu.Item
                                        value="reactivate"
                                        onClick={() => reactivate.mutate(entry.artistUserId!)}
                                        fontSize="xs"
                                        _hover={{ bg: 'gray.50' }}
                                    >
                                        Reactivate
                                    </Menu.Item>
                                )}
                            </Menu.Content>
                        </Menu.Positioner>
                    </Portal>
                </Menu.Root>
            </HStack>
        </HStack>
    );
};
