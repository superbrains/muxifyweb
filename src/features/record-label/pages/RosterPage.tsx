import React, { useMemo, useState } from 'react';
import {
    Box,
    Button,
    Center,
    HStack,
    Input,
    Spinner,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useRosterEntries } from '../hooks/useRoster';
import { RosterEntryRow } from '../components/RosterEntryRow';
import { InviteArtistDialog } from '../components/InviteArtistDialog';
import { EmptyRoster } from '../components/EmptyRoster';

const RosterPage: React.FC = () => {
    const [search, setSearch] = useState('');
    const [inviteOpen, setInviteOpen] = useState(false);

    const { data, isLoading, error } = useRosterEntries();

    const filtered = useMemo(() => {
        if (!data) return [];
        if (!search.trim()) return data;
        const q = search.trim().toLowerCase();
        return data.filter(
            (e) =>
                e.displayName.toLowerCase().includes(q) ||
                (e.email?.toLowerCase().includes(q) ?? false),
        );
    }, [data, search]);

    const counts = useMemo(() => {
        const all = data ?? [];
        return {
            signed: all.filter(
                (e) => e.status === 'Active' || e.status === 'PendingOnboarding',
            ).length,
            invited: all.filter((e) => e.status === 'Invited').length,
        };
    }, [data]);

    const showEmptyState = data && data.length === 0;

    if (isLoading) {
        return (
            <Center minH="60vh" w="full" bg="gray.50">
                <Spinner size="lg" color="primary.500" />
            </Center>
        );
    }

    if (error) {
        return (
            <Center minH="60vh" w="full" bg="gray.50">
                <Text fontSize="sm" color="gray.500">
                    Could not load roster.
                </Text>
            </Center>
        );
    }

    return (
        <VStack
            gap={{ base: 2, lg: 6 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <HStack justify="space-between" align="center">
                <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                        Roster
                    </Text>
                    <Text fontSize="11px" color="gray.600">
                        {counts.signed} signed artist{counts.signed === 1 ? '' : 's'}
                        {counts.invited > 0 && (
                            <>
                                {' · '}
                                <Text as="span" color="primary.500" fontWeight="medium">
                                    {counts.invited} pending invitation
                                    {counts.invited === 1 ? '' : 's'}
                                </Text>
                            </>
                        )}
                    </Text>
                </Box>
                <Button
                    onClick={() => setInviteOpen(true)}
                    bg="primary.500"
                    color="white"
                    size="sm"
                    fontSize="xs"
                    fontWeight="medium"
                    borderRadius="10px"
                    _hover={{ bg: 'primary.600' }}
                >
                    Invite artist
                </Button>
            </HStack>

            {showEmptyState ? (
                <EmptyRoster onInvite={() => setInviteOpen(true)} />
            ) : (
                <>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email"
                        variant="subtle"
                        size="sm"
                        fontSize="xs"
                        bg="white"
                        maxW="320px"
                        _focus={{
                            borderColor: 'primary.500',
                            boxShadow: '0 0 0 1px #f94444',
                        }}
                    />

                    <Box bg="white" borderRadius="xl" p={2}>
                        <Stack gap={0}>
                            {filtered.map((entry) => (
                                <RosterEntryRow
                                    key={entry.invitationId ?? entry.artistUserId ?? entry.email}
                                    entry={entry}
                                />
                            ))}
                            {filtered.length === 0 && (
                                <Center py={6}>
                                    <Text fontSize="xs" color="gray.500">
                                        No artists match "{search}".
                                    </Text>
                                </Center>
                            )}
                        </Stack>
                    </Box>
                </>
            )}

            <InviteArtistDialog
                open={inviteOpen}
                onClose={() => setInviteOpen(false)}
            />
        </VStack>
    );
};

export default RosterPage;
