import React from 'react';
import {
    Box,
    Button,
    HStack,
    Menu,
    Portal,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiMoreVertical } from 'react-icons/fi';
import { useChakraToast } from '@shared/hooks';
import { useInvitations, useResendInvitation, useRevokeInvitation } from '../hooks/useRoster';
import { recordLabelService } from '../services/recordLabelService';
import type { InvitationDto } from '../types';

interface InvitationsTableProps {
    /** Hides revoked / expired / declined invitations when true. Default false (show all). */
    pendingOnly?: boolean;
}

const STATUS_STYLES: Record<InvitationDto['status'], { bg: string; color: string; label: string }> = {
    Pending: { bg: '#FFF7E6', color: '#B7791F', label: 'Pending' },
    Accepted: { bg: '#E6FFFA', color: '#2C7A7B', label: 'Accepted' },
    Declined: { bg: '#F7FAFC', color: '#718096', label: 'Declined' },
    Revoked: { bg: '#F7FAFC', color: '#718096', label: 'Revoked' },
    Expired: { bg: '#FEF2F2', color: '#C53030', label: 'Expired' },
};

function formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatExpiry(iso: string, status: InvitationDto['status']): string {
    if (status !== 'Pending') return '—';
    const ms = new Date(iso).getTime() - Date.now();
    if (Number.isNaN(ms)) return '—';
    if (ms <= 0) return 'Expired';
    const days = Math.floor(ms / 86_400_000);
    if (days >= 1) return `in ${days} day${days === 1 ? '' : 's'}`;
    const hours = Math.floor(ms / 3_600_000);
    if (hours >= 1) return `in ${hours}h`;
    const mins = Math.max(1, Math.floor(ms / 60_000));
    return `in ${mins}m`;
}

export const InvitationsTable: React.FC<InvitationsTableProps> = ({ pendingOnly = false }) => {
    const { data, isLoading } = useInvitations();
    const resend = useResendInvitation();
    const revoke = useRevokeInvitation();
    const toast = useChakraToast();

    const rows = React.useMemo(() => {
        if (!data) return [];
        if (!pendingOnly) return data;
        return data.filter((i) => i.status === 'Pending');
    }, [data, pendingOnly]);

    const handleCopyLink = async (invitationId: string) => {
        try {
            const res = await recordLabelService.resendInvitation(invitationId);
            await navigator.clipboard.writeText(res.acceptUrl);
            toast.success('Link copied', 'A fresh link was also emailed to the artist.');
        } catch {
            toast.error('Could not copy the link', 'Please try again.');
        }
    };

    if (isLoading) {
        return (
            <Box bg="white" borderRadius="xl" p={6}>
                <Text fontSize="xs" color="gray.500">
                    Loading invitations…
                </Text>
            </Box>
        );
    }

    if (rows.length === 0) {
        return null;
    }

    return (
        <Box bg="white" borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.100">
            <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
                <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                    Invitations
                </Text>
                <Text fontSize="10px" color="gray.500">
                    {rows.length} invitation{rows.length === 1 ? '' : 's'}
                </Text>
            </Box>

            {/* Column headers — md+ only */}
            <HStack
                display={{ base: 'none', md: 'flex' }}
                px={4}
                py={2}
                borderBottom="1px solid"
                borderColor="gray.50"
                fontSize="10px"
                color="gray.500"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="0.5px"
            >
                <Box flex="2">Email</Box>
                <Box flex="1">Status</Box>
                <Box flex="1">Sent</Box>
                <Box flex="1">Expires</Box>
                <Box w="40px" />
            </HStack>

            <Stack gap={0}>
                {rows.map((inv, idx) => {
                    const style = STATUS_STYLES[inv.status] ?? STATUS_STYLES.Pending;
                    const isPending = inv.status === 'Pending';
                    const isResending = resend.isPending && resend.variables === inv.id;
                    const isRevoking = revoke.isPending && revoke.variables === inv.id;

                    return (
                        <HStack
                            key={inv.id}
                            px={4}
                            py={3}
                            borderTop={idx === 0 ? 'none' : '1px solid'}
                            borderColor="gray.50"
                            _hover={{ bg: 'gray.50' }}
                            transition="background 120ms ease"
                            align="center"
                            wrap={{ base: 'wrap', md: 'nowrap' }}
                            gap={{ base: 2, md: 0 }}
                        >
                            <VStack flex={{ base: '1 1 100%', md: '2' }} align="start" gap={0}>
                                <Text fontSize="xs" fontWeight="medium" color="gray.900" lineClamp={1}>
                                    {inv.email}
                                </Text>
                                <Text
                                    fontSize="10px"
                                    color="gray.500"
                                    display={{ base: 'block', md: 'none' }}
                                >
                                    Sent {formatDate(inv.createdAt)}
                                </Text>
                            </VStack>

                            <Box flex={{ base: '0 0 auto', md: '1' }}>
                                <Box
                                    display="inline-block"
                                    bg={style.bg}
                                    color={style.color}
                                    fontSize="10px"
                                    fontWeight="semibold"
                                    px={2.5}
                                    py={1}
                                    borderRadius="full"
                                >
                                    {style.label}
                                </Box>
                            </Box>

                            <Text
                                flex="1"
                                fontSize="11px"
                                color="gray.600"
                                display={{ base: 'none', md: 'block' }}
                            >
                                {formatDate(inv.createdAt)}
                            </Text>

                            <Text
                                flex="1"
                                fontSize="11px"
                                color={isPending ? 'gray.600' : 'gray.400'}
                                display={{ base: 'none', md: 'block' }}
                            >
                                {formatExpiry(inv.expiresAt, inv.status)}
                            </Text>

                            <Box w={{ base: 'auto', md: '40px' }} ml={{ base: 'auto', md: 0 }}>
                                {isPending ? (
                                    <Menu.Root>
                                        <Menu.Trigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="xs"
                                                px={2}
                                                color="gray.500"
                                                _hover={{ color: 'primary.500', bg: 'primary.50' }}
                                                loading={isResending || isRevoking}
                                                aria-label="Invitation actions"
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
                                                    <Menu.Item
                                                        value="resend"
                                                        onClick={() => resend.mutate(inv.id)}
                                                        fontSize="xs"
                                                        _hover={{ bg: 'gray.50' }}
                                                    >
                                                        Resend email
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        value="copy"
                                                        onClick={() => handleCopyLink(inv.id)}
                                                        fontSize="xs"
                                                        _hover={{ bg: 'gray.50' }}
                                                    >
                                                        Copy invite link
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        value="revoke"
                                                        onClick={() => revoke.mutate(inv.id)}
                                                        fontSize="xs"
                                                        color="red.500"
                                                        _hover={{ bg: 'red.50' }}
                                                    >
                                                        Revoke
                                                    </Menu.Item>
                                                </Menu.Content>
                                            </Menu.Positioner>
                                        </Portal>
                                    </Menu.Root>
                                ) : (
                                    <Box w="40px" />
                                )}
                            </Box>
                        </HStack>
                    );
                })}
            </Stack>
        </Box>
    );
};
