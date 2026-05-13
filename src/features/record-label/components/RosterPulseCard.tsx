import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Center,
    HStack,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiClock, FiUserCheck } from 'react-icons/fi';
import { useResendInvitation, useRosterEntries } from '../hooks/useRoster';
import type { RosterEntryDto } from '../types';

const EXPIRING_WINDOW_MS = 48 * 60 * 60 * 1000;

const hoursUntil = (iso?: string): number | null => {
    if (!iso) return null;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return null;
    return Math.round((t - Date.now()) / (60 * 60 * 1000));
};

const PulseRow: React.FC<{
    entry: RosterEntryDto;
    flavour: 'onboarding' | 'expiring';
    onAction?: () => void;
    actionLabel?: string;
    actionLoading?: boolean;
}> = ({ entry, flavour, onAction, actionLabel, actionLoading }) => {
    const isExpiring = flavour === 'expiring';
    const Icon = isExpiring ? FiClock : FiUserCheck;
    const tintColor = isExpiring ? '#92660C' : '#1E40AF';
    const tintBg = isExpiring ? '#FFF9E6' : '#EBF8FF';
    const hours = hoursUntil(entry.expiresAt);

    return (
        <HStack px={2} py={2.5} gap={3} borderRadius="lg" _hover={{ bg: 'gray.50' }}>
            <Box
                w="28px"
                h="28px"
                borderRadius="full"
                bg={tintBg}
                color={tintColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
            >
                <Icon size={12} />
            </Box>
            <Avatar.Root size="xs">
                <Avatar.Fallback name={entry.displayName} />
                {entry.avatarUrl && <Avatar.Image src={entry.avatarUrl} />}
            </Avatar.Root>
            <VStack align="start" gap={0} flex={1} minW={0}>
                <Text fontSize="xs" fontWeight="semibold" color="gray.900" truncate w="full">
                    {entry.displayName}
                </Text>
                <Text fontSize="10px" color="gray.500" truncate w="full">
                    {isExpiring
                        ? hours !== null && hours <= 0
                            ? 'Expires soon'
                            : `Expires in ${hours}h`
                        : 'Hasn’t finished setup yet'}
                </Text>
            </VStack>
            {onAction && (
                <Button
                    size="xs"
                    variant="ghost"
                    color="primary.500"
                    fontSize="10px"
                    fontWeight="semibold"
                    onClick={onAction}
                    loading={actionLoading}
                >
                    {actionLabel}
                </Button>
            )}
        </HStack>
    );
};

export const RosterPulseCard: React.FC = () => {
    const { data, isLoading } = useRosterEntries();
    const resend = useResendInvitation();

    const entries = data ?? [];
    const now = Date.now();
    const pendingOnboarding = entries.filter((e) => e.status === 'PendingOnboarding').slice(0, 3);
    const expiringInvites = entries
        .filter((e) => {
            if (e.status !== 'Invited' || !e.expiresAt) return false;
            const t = new Date(e.expiresAt).getTime();
            return !Number.isNaN(t) && t - now <= EXPIRING_WINDOW_MS;
        })
        .slice(0, 3);

    const showEmpty = !isLoading && pendingOnboarding.length === 0 && expiringInvites.length === 0;

    return (
        <Box bg="white" borderRadius="2xl" borderWidth="1px" borderColor="gray.100" overflow="hidden">
            <Box px={4} pt={4} pb={2}>
                <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                    Roster pulse
                </Text>
                <Text fontSize="9px" color="gray.500">
                    Pending onboardings and expiring invites
                </Text>
            </Box>

            <Box px={2} pb={2}>
                {isLoading ? (
                    <Center py={6}>
                        <Spinner size="sm" color="primary.500" />
                    </Center>
                ) : showEmpty ? (
                    <Center py={6}>
                        <Text fontSize="xs" color="gray.500">
                            Roster is all set — nothing waiting on you.
                        </Text>
                    </Center>
                ) : (
                    <VStack align="stretch" gap={0}>
                        {pendingOnboarding.map((e) => (
                            <PulseRow key={`po-${e.artistUserId}`} entry={e} flavour="onboarding" />
                        ))}
                        {expiringInvites.map((e) => (
                            <PulseRow
                                key={`ei-${e.invitationId}`}
                                entry={e}
                                flavour="expiring"
                                actionLabel="Resend"
                                actionLoading={resend.isPending}
                                onAction={
                                    e.invitationId
                                        ? () => resend.mutate(e.invitationId!)
                                        : undefined
                                }
                            />
                        ))}
                    </VStack>
                )}
            </Box>
        </Box>
    );
};
