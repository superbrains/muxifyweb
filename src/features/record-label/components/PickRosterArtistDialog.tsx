import React, { useMemo } from 'react';
import {
    Avatar,
    Box,
    Button,
    Dialog,
    HStack,
    Portal,
    Text,
    VStack,
} from '@chakra-ui/react';
import type { RosterArtistDto } from '../types';

interface PickRosterArtistDialogProps {
    open: boolean;
    roster: RosterArtistDto[];
    onClose: () => void;
    onPick: (artistUserId: string) => void;
}

export const PickRosterArtistDialog: React.FC<PickRosterArtistDialogProps> = ({
    open,
    roster,
    onClose,
    onPick,
}) => {
    const activeArtists = useMemo(
        () => roster.filter((a) => a.onboardingStatus === 'Active'),
        [roster],
    );
    const hiddenPendingCount = roster.length - activeArtists.length;

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(d) => !d.open && onClose()}
            size="sm"
            placement="center"
        >
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="20px" p={2}>
                        <Dialog.Header>
                            <Dialog.Title fontSize="sm" fontWeight="semibold">
                                Release on behalf of...
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            {roster.length === 0 ? (
                                <Text fontSize="xs" color="gray.500" textAlign="center" py={4}>
                                    Your roster is empty. Invite an artist first.
                                </Text>
                            ) : activeArtists.length === 0 ? (
                                <VStack gap={2} py={4}>
                                    <Text fontSize="xs" color="gray.700" fontWeight="medium" textAlign="center">
                                        No artists ready yet.
                                    </Text>
                                    <Text fontSize="11px" color="gray.500" textAlign="center">
                                        Your invitees need to finish onboarding (profile setup) before
                                        you can release on their behalf.
                                    </Text>
                                </VStack>
                            ) : (
                                <VStack gap={1} align="stretch">
                                    {activeArtists.map((a) => (
                                        <Box
                                            key={a.artistUserId}
                                            as="button"
                                            onClick={() => onPick(a.artistUserId)}
                                            textAlign="left"
                                            p={2}
                                            borderRadius="md"
                                            _hover={{ bg: 'primary.50' }}
                                            transition="background 150ms ease"
                                        >
                                            <HStack gap={3}>
                                                <Avatar.Root size="sm">
                                                    <Avatar.Image src={a.avatarUrl} />
                                                    <Avatar.Fallback name={a.performingName} />
                                                </Avatar.Root>
                                                <VStack align="start" gap={0}>
                                                    <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                                                        {a.performingName}
                                                    </Text>
                                                    <Text fontSize="10px" color="gray.500">
                                                        {a.fullName}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        </Box>
                                    ))}
                                    {hiddenPendingCount > 0 && (
                                        <Text fontSize="10px" color="gray.400" pt={2} px={2}>
                                            {hiddenPendingCount} artist
                                            {hiddenPendingCount === 1 ? '' : 's'} hidden — still
                                            completing onboarding.
                                        </Text>
                                    )}
                                </VStack>
                            )}
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button onClick={onClose} variant="ghost" size="sm" fontSize="xs">
                                Cancel
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
