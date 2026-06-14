import React from 'react';
import { Box, Button, Dialog, HStack, Input, Portal, Text, VStack } from '@chakra-ui/react';
import { useRescheduleTrack } from '../../hooks/useContent';

interface RescheduleModalProps {
    open: boolean;
    /** Track id to reschedule. */
    trackId?: string;
    /** Title shown in the dialog copy. */
    trackTitle?: string;
    onClose: () => void;
}

/**
 * Shared reschedule dialog for a track's release date. Used by both the upload
 * workflow processing queue and the content item detail page so the override
 * flow stays identical. Wraps {@link useRescheduleTrack} (toast + invalidate).
 */
export const RescheduleModal: React.FC<RescheduleModalProps> = ({
    open,
    trackId,
    trackTitle,
    onClose,
}) => {
    const reschedule = useRescheduleTrack();
    const [date, setDate] = React.useState('');

    React.useEffect(() => {
        if (open) setDate('');
    }, [open]);

    return (
        <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()} placement="center">
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content maxW="420px" p={6} borderRadius="20px">
                        <VStack align="stretch" gap={4}>
                            <Box>
                                <Text fontSize="md" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                                    Reschedule release
                                </Text>
                                <Text fontSize="xs" color="gray.600" mt={1}>
                                    Set a new release date{trackTitle ? ` for “${trackTitle}”` : ''}.
                                </Text>
                            </Box>
                            <Box>
                                <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                    Release date
                                </Text>
                                <Input
                                    type="datetime-local"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    size="sm"
                                    fontSize="xs"
                                />
                            </Box>
                            <HStack gap={3} justify="flex-end" pt={1}>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={reschedule.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    bg="primary.500"
                                    color="white"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    _hover={{ bg: 'primary.600' }}
                                    disabled={!date || !trackId || reschedule.isPending}
                                    onClick={() =>
                                        trackId &&
                                        reschedule.mutate(
                                            { id: trackId, releaseDate: new Date(date).toISOString() },
                                            { onSuccess: onClose },
                                        )
                                    }
                                >
                                    Reschedule
                                </Button>
                            </HStack>
                        </VStack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
