import React from 'react';
import {
    Box,
    Button,
    HStack,
    Image,
    Menu,
    Portal,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiMoreVertical, FiVideo } from 'react-icons/fi';
import type { LabelReleaseDto, ReleaseStatus } from '../types';

interface ReleaseRowProps {
    release: LabelReleaseDto;
    onOpenDetail: (release: LabelReleaseDto) => void;
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

function formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function relativeFromNow(iso?: string): string {
    if (!iso) return '';
    const ms = new Date(iso).getTime() - Date.now();
    if (Number.isNaN(ms)) return '';
    const absDays = Math.round(Math.abs(ms) / 86_400_000);
    if (absDays === 0) return ' (today)';
    if (ms > 0) return ` (in ${absDays}d)`;
    return ` (${absDays}d ago)`;
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export const ReleaseRow: React.FC<ReleaseRowProps> = ({
    release: r,
    onOpenDetail,
    onOpenSplits,
    onOpenAnalytics,
    onEdit,
}) => {
    const style = STATUS_STYLES[r.status];
    const dateIso = r.releaseDate ?? r.createdAt;
    const typeLabel = r.kind === 'video' ? 'Music Video' : r.releaseType;

    return (
        <HStack
            px={{ base: 2, md: 4 }}
            py={3}
            borderBottom="1px solid"
            borderColor="gray.50"
            _hover={{ bg: 'gray.50' }}
            transition="background 120ms ease"
            cursor="pointer"
            onClick={() => onOpenDetail(r)}
            gap={3}
        >
            {/* Cover */}
            <Box position="relative" flexShrink={0}>
                {r.coverArtUrl ? (
                    <Image
                        src={r.coverArtUrl}
                        alt=""
                        boxSize="48px"
                        borderRadius="md"
                        objectFit="cover"
                    />
                ) : (
                    <Box
                        boxSize="48px"
                        borderRadius="md"
                        bg="primary.50"
                        color="primary.600"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xs"
                        fontWeight="semibold"
                    >
                        {initials(r.artistName || r.title)}
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
                        boxSize="18px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="9px"
                    >
                        <FiVideo />
                    </Box>
                )}
            </Box>

            {/* Title + meta */}
            <VStack align="start" gap={0} flex="2" minW={0}>
                <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                    {r.title}
                </Text>
                <HStack
                    gap={1.5}
                    fontSize="10px"
                    color="gray.500"
                    display={{ base: 'none', md: 'flex' }}
                    wrap="nowrap"
                >
                    <Text>{r.artistName}</Text>
                    <Text>·</Text>
                    <Text>{typeLabel}</Text>
                    <Text>·</Text>
                    <Text>
                        via {r.uploadSource}
                    </Text>
                    <Text>·</Text>
                    <Text>
                        {formatDate(dateIso)}
                        {r.status === 'Scheduled' && r.releaseDate ? relativeFromNow(r.releaseDate) : ''}
                    </Text>
                </HStack>
                <Text
                    fontSize="10px"
                    color="gray.500"
                    display={{ base: 'block', md: 'none' }}
                    lineClamp={1}
                >
                    {r.artistName}
                </Text>
            </VStack>

            {/* Status pill */}
            <Box flexShrink={0} display={{ base: 'none', sm: 'block' }}>
                <HStack
                    gap={1.5}
                    bg={style.bg}
                    color={style.color}
                    fontSize="10px"
                    fontWeight="semibold"
                    px={2.5}
                    py={1}
                    borderRadius="full"
                >
                    {r.status === 'Processing' ? (
                        <Spinner size="xs" borderWidth="1.5px" />
                    ) : (
                        <Box boxSize="6px" borderRadius="full" bg={style.dot} />
                    )}
                    <Text>{r.status}</Text>
                </HStack>
            </Box>

            {/* Streams */}
            <Text
                fontSize="11px"
                color="gray.600"
                fontVariantNumeric="tabular-nums"
                textAlign="right"
                minW={{ base: 'auto', md: '80px' }}
                flexShrink={0}
            >
                {r.streams > 0 ? r.streams.toLocaleString() : '—'}
            </Text>

            {/* Overflow menu */}
            <Box flexShrink={0} onClick={(e) => e.stopPropagation()}>
                <Menu.Root>
                    <Menu.Trigger asChild>
                        <Button
                            variant="ghost"
                            size="xs"
                            px={2}
                            color="gray.500"
                            _hover={{ color: 'primary.500', bg: 'primary.50' }}
                            aria-label="Release actions"
                        >
                            <FiMoreVertical />
                        </Button>
                    </Menu.Trigger>
                    <Portal>
                        <Menu.Positioner>
                            <Menu.Content
                                minW="200px"
                                borderRadius="md"
                                boxShadow="lg"
                                p={1}
                                bg="white"
                                border="1px solid"
                                borderColor="gray.100"
                                zIndex={1500}
                            >
                                <Menu.Item
                                    value="open"
                                    onClick={() => onOpenDetail(r)}
                                    fontSize="xs"
                                    _hover={{ bg: 'gray.50' }}
                                >
                                    View details
                                </Menu.Item>
                                <Menu.Item
                                    value="edit"
                                    onClick={() => onEdit(r)}
                                    fontSize="xs"
                                    _hover={{ bg: 'gray.50' }}
                                >
                                    Edit metadata
                                </Menu.Item>
                                {r.kind === 'track' && (
                                    <Menu.Item
                                        value="splits"
                                        onClick={() => onOpenSplits(r)}
                                        fontSize="xs"
                                        _hover={{ bg: 'gray.50' }}
                                    >
                                        Manage splits
                                    </Menu.Item>
                                )}
                                <Menu.Item
                                    value="analytics"
                                    onClick={() => onOpenAnalytics(r)}
                                    fontSize="xs"
                                    _hover={{ bg: 'gray.50' }}
                                >
                                    View analytics
                                </Menu.Item>
                            </Menu.Content>
                        </Menu.Positioner>
                    </Portal>
                </Menu.Root>
            </Box>
        </HStack>
    );
};
