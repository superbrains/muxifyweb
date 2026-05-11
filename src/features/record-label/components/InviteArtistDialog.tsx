import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    Input,
    Portal,
    Stack,
    Text,
    Textarea,
} from '@chakra-ui/react';
import { useInviteArtist } from '../hooks/useRoster';

interface InviteArtistDialogProps {
    open: boolean;
    onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const InviteArtistDialog: React.FC<InviteArtistDialogProps> = ({ open, onClose }) => {
    const [email, setEmail] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState<string | null>(null);

    const invite = useInviteArtist();

    const handleSubmit = async () => {
        if (!EMAIL_RE.test(email.trim())) {
            setError('Enter a valid email address.');
            return;
        }
        setError(null);
        await invite.mutateAsync({
            email: email.trim(),
            personalNote: note.trim() || undefined,
        });
        setEmail('');
        setNote('');
        onClose();
    };

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(details) => !details.open && onClose()}
            size="sm"
            placement="center"
        >
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="20px" p={2}>
                        <Dialog.Header>
                            <Dialog.Title fontSize="sm" fontWeight="semibold">
                                Invite an artist
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Stack gap={3}>
                                <Box>
                                    <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                                        Email
                                    </Text>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="artist@example.com"
                                        variant="subtle"
                                        size="sm"
                                        fontSize="xs"
                                        borderColor={error ? 'red.300' : 'transparent'}
                                        _focus={{
                                            borderColor: 'primary.500',
                                            boxShadow: '0 0 0 1px #f94444',
                                        }}
                                    />
                                    {error && (
                                        <Text color="red.500" fontSize="xs" mt={0.5}>
                                            {error}
                                        </Text>
                                    )}
                                </Box>
                                <Box>
                                    <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                                        Personal note <Text as="span" color="gray.400">(Optional)</Text>
                                    </Text>
                                    <Textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        rows={3}
                                        fontSize="xs"
                                        placeholder="Add a short message"
                                        _focus={{
                                            borderColor: 'primary.500',
                                            boxShadow: '0 0 0 1px #f94444',
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button onClick={onClose} variant="ghost" size="sm" fontSize="xs">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                loading={invite.isPending}
                                bg="primary.500"
                                color="white"
                                size="sm"
                                fontSize="xs"
                                fontWeight="medium"
                                borderRadius="10px"
                                _hover={{ bg: 'primary.600' }}
                            >
                                Send invitation
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
