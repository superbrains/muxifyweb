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
    Tag,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { FiArrowRight, FiFlag, FiInfo } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { useResolveModerationItem } from '../../hooks/useSupport';
import type { ModerationAction, ModerationItemDto } from '../../types';

const MIN_REASON_LENGTH = 10;

function tierBg(tier: string): string {
    switch (tier) {
        case 'Exact':
            return 'red.50';
        case 'High':
            return 'orange.50';
        case 'Medium':
            return 'yellow.50';
        default:
            return 'gray.100';
    }
}
function tierFg(tier: string): string {
    switch (tier) {
        case 'Exact':
            return 'red.700';
        case 'High':
            return 'orange.700';
        case 'Medium':
            return 'yellow.800';
        default:
            return 'gray.700';
    }
}

// Maps a moderation report's contentType + a content GUID to the public detail page.
// Only Track/Video are surfaced as live links; Comment/Profile have no detail page here.
function matchedHref(contentType: string, contentId: string): string {
    if (contentType === 'track') return `/music-videos/single/${contentId}`;
    if (contentType === 'video') return `/music-videos/video/${contentId}`;
    return '#';
}

const ACTIONS: Array<{
    value: ModerationAction;
    label: string;
    description: string;
    destructive: boolean;
    // True for terminal actions that close the report. Warn is intentionally
    // non-terminal so the case stays open for revisits.
    terminal: boolean;
}> = [
    {
        value: 'dismiss',
        label: 'Dismiss report',
        description: 'No violation. For held content, this releases and publishes it. Closes the case.',
        destructive: false,
        terminal: true,
    },
    {
        value: 'warn',
        label: 'Warn the owner',
        description: 'Send a written warning to the owner. The case stays OPEN — held content remains on hold. Choose Dismiss or Remove later to decide the hold.',
        destructive: true,
        terminal: false,
    },
    {
        value: 'remove',
        label: 'Remove content',
        description: 'Take the content down permanently. Closes the case.',
        destructive: true,
        terminal: true,
    },
    {
        value: 'suspend',
        label: 'Suspend the owner',
        description: 'Take the content down AND suspend the owner account. Closes the case.',
        destructive: true,
        terminal: true,
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
                    <Dialog.Content maxW="560px" p={6} borderRadius="20px" position="relative" maxH="90vh" overflowY="auto">
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

                            {/* Prior warning — if a moderator has already warned the owner on
                                this case, show the warning note + timestamp so the next decision
                                builds on the previous one rather than re-warning. */}
                            {item?.warnedAt && (
                                <Box
                                    bg="purple.50"
                                    border="1px solid"
                                    borderColor="purple.200"
                                    borderRadius="12px"
                                    p={3.5}
                                >
                                    <HStack gap={2} mb={2}>
                                        <Text fontSize="xs" fontWeight="700" color="purple.800" textTransform="uppercase" letterSpacing="0.04em">
                                            Already warned
                                        </Text>
                                        <Text fontSize="10px" color="purple.700" ml="auto">
                                            {new Date(item.warnedAt).toLocaleString()}
                                        </Text>
                                    </HStack>
                                    {item.warningNote && (
                                        <Text fontSize="xs" color="gray.800" lineHeight="1.6" whiteSpace="pre-wrap">
                                            {item.warningNote}
                                        </Text>
                                    )}
                                </Box>
                            )}

                            {/* Held-content notice — clarifies what each action will do to a
                                held duplicate-detection upload. This is the exact ambiguity that
                                surprised admins before: now the dialog spells it out. */}
                            {item?.isAutomatedDuplicateReport && (
                                <Box
                                    bg="yellow.50"
                                    border="1px solid"
                                    borderColor="yellow.200"
                                    borderRadius="12px"
                                    p={3}
                                >
                                    <Text fontSize="xs" color="yellow.900" lineHeight="1.6">
                                        <Text as="span" fontWeight="700">This upload is currently held.</Text>{' '}
                                        Dismiss releases and publishes it. Remove or Suspend takes it down.
                                        Warn keeps it on hold so you can decide later.
                                    </Text>
                                </Box>
                            )}

                            {/* Artist's dispute note — surfaced PROMINENTLY at the top so the
                                moderator can't decide without reading it. */}
                            {item?.artistDisputeNote && (
                                <Box
                                    bg="orange.50"
                                    border="1px solid"
                                    borderColor="orange.200"
                                    borderRadius="12px"
                                    p={3.5}
                                >
                                    <HStack gap={2} mb={2}>
                                        <Icon as={FiFlag} boxSize={3.5} color="orange.600" />
                                        <Text fontSize="xs" fontWeight="700" color="orange.800" textTransform="uppercase" letterSpacing="0.04em">
                                            Artist disputed this flag
                                        </Text>
                                        {item.disputedAt && (
                                            <Text fontSize="10px" color="orange.700" ml="auto">
                                                {new Date(item.disputedAt).toLocaleString()}
                                            </Text>
                                        )}
                                    </HStack>
                                    <Text
                                        fontSize="xs"
                                        color="gray.800"
                                        lineHeight="1.6"
                                        whiteSpace="pre-wrap"
                                    >
                                        {item.artistDisputeNote}
                                    </Text>
                                </Box>
                            )}

                            {/* Duplicate-detection context — tier, score, matched content. Only
                                shown for automated reports so the moderator can size up the case
                                without leaving the dialog. */}
                            {item?.isAutomatedDuplicateReport && (
                                <Box
                                    bg="gray.50"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    borderRadius="12px"
                                    p={3.5}
                                >
                                    <HStack gap={2} mb={2}>
                                        <Icon as={FiInfo} boxSize={3.5} color="gray.600" />
                                        <Text fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.04em">
                                            Duplicate-detection context
                                        </Text>
                                    </HStack>
                                    <VStack align="stretch" gap={1.5}>
                                        {item.duplicateTier && (
                                            <HStack gap={2}>
                                                <Text fontSize="10px" color="gray.500" w="100px">Confidence</Text>
                                                <Tag.Root size="sm" bg={tierBg(item.duplicateTier)} color={tierFg(item.duplicateTier)} borderRadius="full" px={2}>
                                                    <Tag.Label fontSize="10px" fontWeight="700">{item.duplicateTier}</Tag.Label>
                                                </Tag.Root>
                                                {typeof item.duplicateScore === 'number' && (
                                                    <Text fontSize="xs" color="gray.700" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                        {Math.round(item.duplicateScore * 100)}%
                                                    </Text>
                                                )}
                                            </HStack>
                                        )}
                                        {item.duplicateMatchedContentId && (
                                            <HStack gap={2}>
                                                <Text fontSize="10px" color="gray.500" w="100px">Matched against</Text>
                                                <RouterLink
                                                    to={matchedHref(item.contentType, item.duplicateMatchedContentId)}
                                                    target="_blank"
                                                >
                                                    <HStack
                                                        gap={1}
                                                        color="primary.500"
                                                        fontSize="xs"
                                                        fontWeight="500"
                                                        _hover={{ textDecoration: 'underline' }}
                                                    >
                                                        <Text>Open existing {item.contentType}</Text>
                                                        <Icon as={FiArrowRight} boxSize={3} />
                                                    </HStack>
                                                </RouterLink>
                                            </HStack>
                                        )}
                                        <HStack gap={2}>
                                            <Text fontSize="10px" color="gray.500" w="100px">Suspect</Text>
                                            <RouterLink
                                                to={matchedHref(item.contentType, item.contentId)}
                                                target="_blank"
                                            >
                                                <HStack
                                                    gap={1}
                                                    color="primary.500"
                                                    fontSize="xs"
                                                    fontWeight="500"
                                                    _hover={{ textDecoration: 'underline' }}
                                                >
                                                    <Text>Open uploaded {item.contentType}</Text>
                                                    <Icon as={FiArrowRight} boxSize={3} />
                                                </HStack>
                                            </RouterLink>
                                        </HStack>
                                    </VStack>
                                </Box>
                            )}

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
                                            <Text>{selected.terminal ? 'Resolving' : 'Sending'}</Text>
                                        </HStack>
                                    ) : selected.terminal ? (
                                        'Resolve report'
                                    ) : (
                                        'Send warning'
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
