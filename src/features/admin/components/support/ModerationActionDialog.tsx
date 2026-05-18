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
import { useResolveModerationItem } from '../../hooks/useSupport';
import type { ModerationAction, ModerationItemDto } from '../../types';

const MIN_REASON_LENGTH = 10;

const ACTIONS: Array<{
    value: ModerationAction;
    label: string;
    description: string;
    destructive: boolean;
}> = [
    {
        value: 'dismiss',
        label: 'Dismiss report',
        description: 'No violation — keep the content as is.',
        destructive: false,
    },
    {
        value: 'warn',
        label: 'Warn the owner',
        description: 'Notify the content owner with a formal warning.',
        destructive: true,
    },
    {
        value: 'remove',
        label: 'Remove content',
        description: 'Take the reported content down from the platform.',
        destructive: true,
    },
    {
        value: 'suspend',
        label: 'Suspend the owner',
        description: 'Remove the content and suspend the owner account.',
        destructive: true,
    },
];

interface ModerationActionDialogProps {
    item: ModerationItemDto | null;
    onClose: () => void;
}

/** Resolve a flagged-content report by choosing an action (reason required for destructive ones). */
export const ModerationActionDialog: React.FC<ModerationActionDialogProps> = ({
    item,
    onClose,
}) => {
    const open = item !== null;
    const resolve = useResolveModerationItem();

    const [action, setAction] = React.useState<ModerationAction>('dismiss');
    const [reason, setReason] = React.useState('');

    React.useEffect(() => {
        if (open) {
            setAction('dismiss');
            setReason('');
        }
    }, [open, item?.id]);

    const selected = ACTIONS.find((a) => a.value === action)!;
    const trimmed = reason.trim();
    const reasonRequired = selected.destructive;
    const reasonInvalid = reasonRequired && trimmed.length < MIN_REASON_LENGTH;

    const handleConfirm = () => {
        if (!item || reasonInvalid || resolve.isPending) return;
        resolve.mutate(
            {
                id: item.id,
                action,
                reason: reasonRequired ? trimmed : undefined,
            },
            { onSuccess: onClose },
        );
    };

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(e) => !e.open && onClose()}
            placement="center"
        >
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content maxW="480px" p={6} borderRadius="20px" position="relative">
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
                                <Text
                                    fontSize="md"
                                    fontWeight="semibold"
                                    color="gray.900"
                                    fontFamily="Poppins"
                                >
                                    Resolve report
                                </Text>
                                {item && (
                                    <Text fontSize="xs" color="gray.600" mt={1}>
                                        {item.contentType} · “{item.contentTitle}” by{' '}
                                        {item.ownerName} — flagged for {item.reason}.
                                    </Text>
                                )}
                            </Box>

                            <VStack align="stretch" gap={2}>
                                {ACTIONS.map((a) => {
                                    const isActive = a.value === action;
                                    return (
                                        <HStack
                                            as="button"
                                            key={a.value}
                                            onClick={() => setAction(a.value)}
                                            align="start"
                                            gap={3}
                                            px={3}
                                            py={2.5}
                                            borderRadius="12px"
                                            border="1px solid"
                                            borderColor={
                                                isActive ? 'primary.500' : 'gray.200'
                                            }
                                            bg={isActive ? 'primary.50' : 'white'}
                                            transition="all 0.15s"
                                            textAlign="left"
                                        >
                                            <Box
                                                boxSize="14px"
                                                borderRadius="full"
                                                border="2px solid"
                                                borderColor={
                                                    isActive ? 'primary.500' : 'gray.300'
                                                }
                                                bg={isActive ? 'primary.500' : 'white'}
                                                mt="2px"
                                                flexShrink={0}
                                            />
                                            <Box>
                                                <Text
                                                    fontSize="xs"
                                                    fontWeight="semibold"
                                                    color="gray.900"
                                                >
                                                    {a.label}
                                                </Text>
                                                <Text fontSize="10px" color="gray.500">
                                                    {a.description}
                                                </Text>
                                            </Box>
                                        </HStack>
                                    );
                                })}
                            </VStack>

                            {reasonRequired && (
                                <Box>
                                    <Text
                                        fontSize="11px"
                                        fontWeight="semibold"
                                        color="gray.700"
                                        mb={1.5}
                                    >
                                        Reason (shared with the owner)
                                    </Text>
                                    <Textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Explain the policy violation…"
                                        rows={3}
                                        fontSize="xs"
                                        resize="none"
                                        _focus={{
                                            borderColor: '#f94444',
                                            boxShadow: '0 0 0 1px #f94444',
                                        }}
                                    />
                                </Box>
                            )}

                            <HStack gap={3} justify="flex-end" pt={1}>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    borderColor="gray.300"
                                    color="gray.700"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={resolve.isPending}
                                    _hover={{ bg: 'gray.50' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    bg={selected.destructive ? '#f94444' : 'primary.500'}
                                    color="white"
                                    size="sm"
                                    fontSize="xs"
                                    fontWeight="medium"
                                    borderRadius="10px"
                                    disabled={reasonInvalid || resolve.isPending}
                                    _hover={{ bg: 'primary.600' }}
                                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                >
                                    {resolve.isPending ? (
                                        <HStack gap={2}>
                                            <Spinner size="xs" color="white" />
                                            <Text>Resolving</Text>
                                        </HStack>
                                    ) : (
                                        'Resolve report'
                                    )}
                                </Button>
                            </HStack>
                        </VStack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
