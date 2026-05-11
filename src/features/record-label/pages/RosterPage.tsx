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
import { useRoster, useRemoveArtist } from '../hooks/useRoster';
import { RosterArtistRow } from '../components/RosterArtistRow';
import { InviteArtistDialog } from '../components/InviteArtistDialog';
import { EmptyRoster } from '../components/EmptyRoster';

const RosterPage: React.FC = () => {
    const [search, setSearch] = useState('');
    const [inviteOpen, setInviteOpen] = useState(false);

    const { data, isLoading, error } = useRoster();
    const removeArtist = useRemoveArtist();

    const filtered = useMemo(() => {
        if (!data) return [];
        if (!search.trim()) return data;
        const q = search.trim().toLowerCase();
        return data.filter(
            (a) =>
                a.performingName.toLowerCase().includes(q) ||
                a.fullName.toLowerCase().includes(q),
        );
    }, [data, search]);

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
                        {data?.length ?? 0} signed artist{data?.length === 1 ? '' : 's'}
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

            {data && data.length === 0 ? (
                <EmptyRoster onInvite={() => setInviteOpen(true)} />
            ) : (
                <>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name"
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
                            {filtered.map((artist) => (
                                <RosterArtistRow
                                    key={artist.artistUserId}
                                    artist={artist}
                                    onRemove={() =>
                                        removeArtist.mutate(artist.artistUserId)
                                    }
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
