import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Input,
    Portal,
    Stack,
    Text,
    Textarea,
} from '@chakra-ui/react';
import { FiCheckCircle, FiCopy } from 'react-icons/fi';
import { useChakraToast } from '@shared/hooks';
import { useInviteArtist } from '../hooks/useRoster';
import type { InviteArtistResponse } from '../types';

interface InviteArtistDialogProps {
    open: boolean;
    onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const InviteArtistDialog: React.FC<InviteArtistDialogProps> = ({ open, onClose }) => {
    const [email, setEmail] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ response: InviteArtistResponse; email: string } | null>(null);
    const toast = useChakraToast();

    const invite = useInviteArtist();

    const handleSubmit = async () => {
        const trimmedEmail = email.trim();
        if (!EMAIL_RE.test(trimmedEmail)) {
            setError('Enter a valid email address.');
            return;
        }
        setError(null);
        try {
            const response = await invite.mutateAsync({
                email: trimmedEmail,
                personalNote: note.trim() || undefined,
            });
            setResult({ response, email: trimmedEmail });
        } catch {
            // useInviteArtist already surfaces a toast on error.
        }
    };

    const handleClose = () => {
        setEmail('');
        setNote('');
        setError(null);
        setResult(null);
        onClose();
    };

    const handleCopy = async () => {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(result.response.acceptUrl);
            toast.success('Link copied', 'Paste it to your artist via any channel.');
        } catch {
            toast.error('Could not copy', 'Please copy the link manually.');
        }
    };

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(details) => !details.open && handleClose()}
            size="sm"
            placement="center"
        >
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="20px" p={2}>
                        {result ? (
                            <>
                                <Dialog.Header>
                                    <Dialog.Title fontSize="sm" fontWeight="semibold">
                                        Invitation created
                                    </Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body>
                                    <Stack gap={3}>
                                        <Box
                                            bg="green.50"
                                            border="1px solid"
                                            borderColor="green.200"
                                            borderRadius="10px"
                                            p={3}
                                        >
                                            <HStack gap={2} align="start">
                                                <Box color="green.600" pt={0.5}>
                                                    <FiCheckCircle size={16} />
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                                                        Email sent to {result.email}
                                                    </Text>
                                                    <Text fontSize="11px" color="gray.600" mt={0.5}>
                                                        They have 7 days to accept. If they don't receive it, share the link below.
                                                    </Text>
                                                </Box>
                                            </HStack>
                                        </Box>

                                        <Box>
                                            <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                                                Accept link
                                            </Text>
                                            <HStack gap={2}>
                                                <Input
                                                    value={result.response.acceptUrl}
                                                    readOnly
                                                    onFocus={(e) => e.currentTarget.select()}
                                                    variant="subtle"
                                                    size="sm"
                                                    fontSize="11px"
                                                    bg="gray.50"
                                                />
                                                <Button
                                                    onClick={handleCopy}
                                                    bg="primary.500"
                                                    color="white"
                                                    size="sm"
                                                    fontSize="xs"
                                                    fontWeight="medium"
                                                    borderRadius="10px"
                                                    flexShrink={0}
                                                    _hover={{ bg: 'primary.600' }}
                                                    aria-label="Copy accept link"
                                                >
                                                    <FiCopy />
                                                </Button>
                                            </HStack>
                                        </Box>
                                    </Stack>
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Button onClick={handleClose} variant="ghost" size="sm" fontSize="xs">
                                        Done
                                    </Button>
                                    <Button
                                        onClick={() => setResult(null)}
                                        bg="primary.500"
                                        color="white"
                                        size="sm"
                                        fontSize="xs"
                                        fontWeight="medium"
                                        borderRadius="10px"
                                        _hover={{ bg: 'primary.600' }}
                                    >
                                        Invite another
                                    </Button>
                                </Dialog.Footer>
                            </>
                        ) : (
                            <>
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
                                    <Button onClick={handleClose} variant="ghost" size="sm" fontSize="xs">
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
                            </>
                        )}
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
