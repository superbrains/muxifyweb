import React from 'react';
import {
    Box,
    Button,
    Drawer,
    HStack,
    Image,
    Portal,
    Separator,
    Spinner,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { FiExternalLink, FiVideo, FiX } from 'react-icons/fi';
import { recordLabelService } from '../services/recordLabelService';
import type { LabelReleaseDto, ReleaseStatus } from '../types';
import { labelKeys } from '../hooks/useLabelSummary';

interface ReleaseDetailDrawerProps {
    release: LabelReleaseDto | null;
    onClose: () => void;
    onOpenSplits: (release: LabelReleaseDto) => void;
    onOpenAnalytics: (release: LabelReleaseDto) => void;
    onEdit: (release: LabelReleaseDto) => void;
}

const STATUS_STYLES: Record<ReleaseStatus, { bg: string; color: string; dot: string }> = {
    Live: { bg: '#E6FFFA', color: '#2C7A7B', dot: '#38B2AC' },
    Scheduled: { bg: '#EBF8FF', color: '#2B6CB0', dot: '#3182CE' },
    Draft: { bg: '#F7FAFC', color: '#4A5568', dot: '#A0AEC0' },
    Processing: { bg: '#FFFAF0', color: '#B7791F', dot: '#ED8936' },
    Failed: { bg: '#FEF2F2', color: '#C53030', dot: '#E53E3E' },
};

function formatDate(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const MetaRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <HStack justify="space-between" align="start" gap={3}>
        <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="0.5px" fontWeight="semibold">
            {label}
        </Text>
        <Box fontSize="xs" color="gray.800" textAlign="right" maxW="60%">
            {value}
        </Box>
    </HStack>
);

const SplitsPreview: React.FC<{ trackId: string }> = ({ trackId }) => {
    const { data, isLoading } = useQuery({
        queryKey: labelKeys.splits(trackId),
        queryFn: () => recordLabelService.getSplits(trackId),
        staleTime: 60_000,
    });

    if (isLoading) {
        return (
            <HStack py={2}>
                <Spinner size="xs" />
                <Text fontSize="xs" color="gray.500">Loading splits…</Text>
            </HStack>
        );
    }

    if (!data || data.splits.length === 0) {
        return (
            <Text fontSize="xs" color="gray.500">
                No splits configured yet.
            </Text>
        );
    }

    return (
        <Stack gap={1.5}>
            {data.splits.map((s) => (
                <HStack key={`${s.recipientUserId}-${s.recipientRole}`} justify="space-between">
                    <HStack gap={2}>
                        <Box
                            fontSize="9px"
                            fontWeight="semibold"
                            bg="gray.100"
                            color="gray.600"
                            px={1.5}
                            py={0.5}
                            borderRadius="full"
                        >
                            {s.recipientRole}
                        </Box>
                        <Text fontSize="xs" color="gray.800">
                            {s.recipientName}
                        </Text>
                    </HStack>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" fontVariantNumeric="tabular-nums">
                        {(s.percentBps / 100).toFixed(s.percentBps % 100 === 0 ? 0 : 2)}%
                    </Text>
                </HStack>
            ))}
        </Stack>
    );
};

export const ReleaseDetailDrawer: React.FC<ReleaseDetailDrawerProps> = ({
    release,
    onClose,
    onOpenSplits,
    onOpenAnalytics,
    onEdit,
}) => {
    const open = release !== null;
    const r = release;
    const style = r ? STATUS_STYLES[r.status] : null;

    return (
        <Drawer.Root
            open={open}
            onOpenChange={(d) => !d.open && onClose()}
            placement="end"
            size="sm"
        >
            <Portal>
                <Drawer.Backdrop bg="blackAlpha.500" />
                <Drawer.Positioner>
                    <Drawer.Content bg="white">
                        <Drawer.Header borderBottom="1px solid" borderColor="gray.100" px={5} py={4}>
                            <HStack justify="space-between" align="center" width="100%">
                                <Drawer.Title fontSize="sm" fontWeight="semibold" color="gray.900">
                                    Release details
                                </Drawer.Title>
                                <Box
                                    as="button"
                                    onClick={onClose}
                                    color="gray.400"
                                    _hover={{ color: 'gray.700' }}
                                    aria-label="Close drawer"
                                >
                                    <FiX />
                                </Box>
                            </HStack>
                        </Drawer.Header>

                        <Drawer.Body px={5} py={4}>
                            {!r ? null : (
                                <Stack gap={4}>
                                    {/* Cover + title */}
                                    <HStack gap={3} align="start">
                                        <Box position="relative" flexShrink={0}>
                                            {r.coverArtUrl ? (
                                                <Image
                                                    src={r.coverArtUrl}
                                                    alt=""
                                                    boxSize="80px"
                                                    borderRadius="md"
                                                    objectFit="cover"
                                                />
                                            ) : (
                                                <Box
                                                    boxSize="80px"
                                                    borderRadius="md"
                                                    bg="primary.50"
                                                    color="primary.600"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    fontSize="md"
                                                    fontWeight="semibold"
                                                >
                                                    {r.title.charAt(0).toUpperCase()}
                                                </Box>
                                            )}
                                            {r.kind === 'video' && (
                                                <Box
                                                    position="absolute"
                                                    bottom="-4px"
                                                    right="-4px"
                                                    bg="gray.900"
                                                    color="white"
                                                    borderRadius="full"
                                                    boxSize="22px"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    fontSize="11px"
                                                >
                                                    <FiVideo />
                                                </Box>
                                            )}
                                        </Box>
                                        <VStack align="start" gap={1} flex="1" minW={0}>
                                            <Text fontSize="md" fontWeight="semibold" color="gray.900" fontFamily="Poppins" lineClamp={2}>
                                                {r.title}
                                            </Text>
                                            <Text fontSize="xs" color="gray.600">
                                                {r.artistName}
                                            </Text>
                                            {style && (
                                                <HStack
                                                    gap={1.5}
                                                    bg={style.bg}
                                                    color={style.color}
                                                    fontSize="10px"
                                                    fontWeight="semibold"
                                                    px={2.5}
                                                    py={1}
                                                    borderRadius="full"
                                                    mt={1}
                                                >
                                                    {r.status === 'Processing' ? (
                                                        <Spinner size="xs" borderWidth="1.5px" />
                                                    ) : (
                                                        <Box boxSize="6px" borderRadius="full" bg={style.dot} />
                                                    )}
                                                    <Text>{r.status}</Text>
                                                </HStack>
                                            )}
                                        </VStack>
                                    </HStack>

                                    <Separator />

                                    {/* Metadata */}
                                    <Stack gap={2}>
                                        <MetaRow
                                            label="Type"
                                            value={r.kind === 'video' ? 'Music Video' : r.releaseType}
                                        />
                                        <MetaRow label="Uploaded by" value={r.uploadSource} />
                                        <MetaRow
                                            label="Release date"
                                            value={formatDate(r.releaseDate ?? undefined)}
                                        />
                                        <MetaRow label="Created" value={formatDate(r.createdAt)} />
                                        {r.albumTitle && <MetaRow label="Album" value={r.albumTitle} />}
                                        <MetaRow
                                            label={r.kind === 'video' ? 'Views' : 'Streams'}
                                            value={
                                                <Text fontVariantNumeric="tabular-nums">
                                                    {r.streams.toLocaleString()}
                                                </Text>
                                            }
                                        />
                                    </Stack>

                                    {r.kind === 'track' && (
                                        <>
                                            <Separator />
                                            <Stack gap={2}>
                                                <HStack justify="space-between">
                                                    <Text
                                                        fontSize="10px"
                                                        color="gray.500"
                                                        textTransform="uppercase"
                                                        letterSpacing="0.5px"
                                                        fontWeight="semibold"
                                                    >
                                                        Splits
                                                    </Text>
                                                    <Box
                                                        as="button"
                                                        onClick={() => onOpenSplits(r)}
                                                        fontSize="10px"
                                                        color="primary.500"
                                                        fontWeight="semibold"
                                                        _hover={{ textDecoration: 'underline' }}
                                                    >
                                                        Manage →
                                                    </Box>
                                                </HStack>
                                                <SplitsPreview trackId={r.id} />
                                            </Stack>
                                        </>
                                    )}
                                </Stack>
                            )}
                        </Drawer.Body>

                        <Drawer.Footer borderTop="1px solid" borderColor="gray.100" px={5} py={4}>
                            <HStack width="100%" gap={2}>
                                <Button
                                    onClick={() => r && onEdit(r)}
                                    size="sm"
                                    variant="outline"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    flex="1"
                                    disabled={!r}
                                >
                                    Edit metadata
                                </Button>
                                <Button
                                    onClick={() => r && onOpenAnalytics(r)}
                                    size="sm"
                                    bg="primary.500"
                                    color="white"
                                    fontSize="xs"
                                    fontWeight="medium"
                                    borderRadius="10px"
                                    _hover={{ bg: 'primary.600' }}
                                    flex="1"
                                    disabled={!r}
                                >
                                    <HStack gap={1}>
                                        <Text>Analytics</Text>
                                        <FiExternalLink />
                                    </HStack>
                                </Button>
                            </HStack>
                        </Drawer.Footer>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
};
