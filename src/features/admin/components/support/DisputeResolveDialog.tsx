import React from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Icon,
    IconButton,
    Portal,
    Spinner,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { FiFlag } from 'react-icons/fi';
import { useQueryClient } from '@tanstack/react-query';
import { useResolveDispute, useRejectDispute } from '../../hooks/useMonetization';
import { useHasPermission } from '../../hooks/useAdminManagement';
import type { ModerationItemDto } from '../../types';

const MIN_REASON_LENGTH = 10;

type Outcome = 'resolve' | 'reject';

interface DisputeResolveDialogProps {
    /** A moderation row whose `source === 'dispute'` (a self-service copyright DisputeCase). */
    item: ModerationItemDto | null;
    onClose: () => void;
}

/**
 * Resolves a copyright dispute that was routed into the moderation queue. Unlike a
 * content report (dismiss/warn/remove/suspend), a self-service DisputeCase has a
 * resolve/reject workflow — so this dialog drives the SAME backend dispute actions
 * (`/admin/disputes/{id}/resolve|reject`) the Monetization → Disputes page uses.
 * That keeps the DisputeCase the single source of truth regardless of where it's worked.
 */
export const DisputeResolveDialog: React.FC<DisputeResolveDialogProps> = ({ item, onClose }) => {
    const open = item !== null;
    const canManage = useHasPermission('DisputesManage');
    const qc = useQueryClient();
    const resolve = useResolveDispute();
    const reject = useRejectDispute();

    const [outcome, setOutcome] = React.useState<Outcome>('resolve');
    const [notes, setNotes] = React.useState('');

    React.useEffect(() => {
        if (open) {
            setOutcome('resolve');
            setNotes('');
        }
    }, [open, item?.id]);

    const trimmed = notes.trim();
    const invalid = trimmed.length < MIN_REASON_LENGTH;
    const pending = resolve.isPending || reject.isPending;

    const refreshModeration = () => {
        qc.invalidateQueries({ queryKey: ['admin', 'moderation'] });
        qc.invalidateQueries({ queryKey: ['admin', 'content', 'moderation'] });
    };

    const handleConfirm = () => {
        if (!item || invalid || pending) return;
        const onDone = {
            onSuccess: () => {
                refreshModeration();
                onClose();
            },
        };
        if (outcome === 'resolve') {
            resolve.mutate({ id: item.id, payload: { resolutionNotes: trimmed } }, onDone);
        } else {
            reject.mutate({ id: item.id, payload: { reason: trimmed } }, onDone);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()} placement="center">
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content maxW="520px" p={6} borderRadius="20px" position="relative" maxH="90vh" overflowY="auto">
                        <IconButton
                            aria-label="Close"
                            variant="ghost"
                            size="sm"
                            color="gray.500"
                            position="absolute"
                            right={3}
                            top={3}
                            onClick={onClose}
                        >
                            <Icon as={MdClose} />
                        </IconButton>

                        <VStack align="stretch" gap={4}>
                            <Box>
                                <Text fontSize="md" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                                    Resolve copyright dispute
                                </Text>
                                {item && (
                                    <Text fontSize="xs" color="gray.600" mt={1}>
                                        {item.reference ? `${item.reference} · ` : ''}
                                        {item.contentType} · “{item.contentTitle}” by {item.ownerName}
                                        {' '}— raised by {item.reporterName}.
                                    </Text>
                                )}
                            </Box>

                            {/* The raiser's claim, surfaced prominently. */}
                            {item?.reason && (
                                <Box bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="12px" p={3.5}>
                                    <HStack gap={2} mb={2}>
                                        <Icon as={FiFlag} boxSize={3.5} color="orange.600" />
                                        <Text fontSize="xs" fontWeight="700" color="orange.800" textTransform="uppercase" letterSpacing="0.04em">
                                            Dispute claim
                                        </Text>
                                    </HStack>
                                    <Text fontSize="xs" color="gray.800" lineHeight="1.6" whiteSpace="pre-wrap">
                                        {item.reason}
                                    </Text>
                                </Box>
                            )}

                            {!canManage ? (
                                <Box bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="12px" p={3.5}>
                                    <Text fontSize="xs" color="gray.600">
                                        You don't have permission to resolve disputes. Ask a finance/disputes admin to action this case.
                                    </Text>
                                </Box>
                            ) : (
                                <>
                                    <VStack align="stretch" gap={2}>
                                        {([
                                            { value: 'resolve' as Outcome, label: 'Uphold & resolve', desc: 'Side with the dispute and close the case as resolved.' },
                                            { value: 'reject' as Outcome, label: 'Reject', desc: 'Dismiss the dispute as unfounded and close the case.' },
                                        ]).map((o) => {
                                            const active = o.value === outcome;
                                            return (
                                                <HStack
                                                    as="button"
                                                    key={o.value}
                                                    onClick={() => setOutcome(o.value)}
                                                    align="start"
                                                    gap={3}
                                                    px={3}
                                                    py={2.5}
                                                    borderRadius="12px"
                                                    border="1px solid"
                                                    borderColor={active ? 'primary.500' : 'gray.200'}
                                                    bg={active ? 'primary.50' : 'white'}
                                                    textAlign="left"
                                                >
                                                    <Box
                                                        boxSize="14px"
                                                        borderRadius="full"
                                                        border="2px solid"
                                                        borderColor={active ? 'primary.500' : 'gray.300'}
                                                        bg={active ? 'primary.500' : 'white'}
                                                        mt="2px"
                                                        flexShrink={0}
                                                    />
                                                    <Box>
                                                        <Text fontSize="xs" fontWeight="semibold" color="gray.900">{o.label}</Text>
                                                        <Text fontSize="10px" color="gray.500">{o.desc}</Text>
                                                    </Box>
                                                </HStack>
                                            );
                                        })}
                                    </VStack>

                                    <Box>
                                        <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                            {outcome === 'resolve' ? 'Resolution notes' : 'Reason'} (shared with the user)
                                        </Text>
                                        <Textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder={outcome === 'resolve'
                                                ? 'Explain the outcome of the copyright review…'
                                                : 'Explain why the dispute is being rejected…'}
                                            rows={3}
                                            fontSize="xs"
                                            resize="none"
                                            _focus={{ borderColor: '#f94444', boxShadow: '0 0 0 1px #f94444' }}
                                        />
                                    </Box>

                                    <HStack gap={3} justify="flex-end" pt={1}>
                                        <Button
                                            onClick={onClose}
                                            variant="outline"
                                            borderColor="gray.300"
                                            color="gray.700"
                                            size="sm"
                                            fontSize="xs"
                                            borderRadius="10px"
                                            disabled={pending}
                                            _hover={{ bg: 'gray.50' }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleConfirm}
                                            bg={outcome === 'reject' ? '#f94444' : 'primary.500'}
                                            color="white"
                                            size="sm"
                                            fontSize="xs"
                                            fontWeight="medium"
                                            borderRadius="10px"
                                            disabled={invalid || pending}
                                            _hover={{ bg: 'primary.600' }}
                                            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                        >
                                            {pending ? (
                                                <HStack gap={2}>
                                                    <Spinner size="xs" color="white" />
                                                    <Text>Submitting</Text>
                                                </HStack>
                                            ) : outcome === 'resolve' ? 'Resolve dispute' : 'Reject dispute'}
                                        </Button>
                                    </HStack>
                                </>
                            )}
                        </VStack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
