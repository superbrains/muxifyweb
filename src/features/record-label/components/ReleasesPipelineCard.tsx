import React, { useState } from 'react';
import {
    Box,
    Center,
    Flex,
    HStack,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiArrowRight, FiVideo } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthedImage } from '@/shared/components/AuthedImage';
import { useLabelReleases, useLabelReleaseSummary } from '../hooks/useLabelReleases';
import type { LabelReleaseDto, ReleaseStatus } from '../types';

type Tab = 'Recent' | ReleaseStatus;
const TABS: Tab[] = ['Recent', 'Live', 'Scheduled', 'Draft', 'Processing'];

const STATUS_STYLES: Record<ReleaseStatus, { bg: string; color: string; dot: string }> = {
    Live: { bg: '#E6FFFA', color: '#0E7A6F', dot: '#10B981' },
    Scheduled: { bg: '#EBF8FF', color: '#1E40AF', dot: '#3B82F6' },
    Draft: { bg: '#F7FAFC', color: '#475569', dot: '#94A3B8' },
    Processing: { bg: '#FFFAF0', color: '#92660C', dot: '#F59E0B' },
    Failed: { bg: '#FEF2F2', color: '#B42318', dot: '#EF4444' },
};

const formatDate = (iso?: string): string => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const initials = (name: string): string =>
    name
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

const ReleaseLine: React.FC<{ release: LabelReleaseDto; onClick: () => void }> = ({
    release: r,
    onClick,
}) => {
    const style = STATUS_STYLES[r.status];
    return (
        <HStack
            px={2}
            py={2.5}
            gap={3}
            borderRadius="lg"
            _hover={{ bg: 'gray.50' }}
            cursor="pointer"
            onClick={onClick}
        >
            <Box
                w="36px"
                h="36px"
                borderRadius="md"
                bg="gray.100"
                overflow="hidden"
                position="relative"
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                {r.coverArtUrl ? (
                    <AuthedImage
                        src={r.coverArtUrl}
                        alt={r.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <Text fontSize="10px" fontWeight="bold" color="gray.500">
                        {initials(r.title)}
                    </Text>
                )}
                {r.kind === 'video' && (
                    <Box
                        position="absolute"
                        right="2px"
                        bottom="2px"
                        bg="blackAlpha.700"
                        p="2px"
                        borderRadius="sm"
                    >
                        <FiVideo size={8} color="white" />
                    </Box>
                )}
            </Box>
            <VStack align="start" gap={0} flex={1} minW={0}>
                <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    color="gray.900"
                    truncate
                    w="full"
                >
                    {r.title}
                </Text>
                <Text fontSize="10px" color="gray.500" truncate w="full">
                    {r.artistName} · {formatDate(r.releaseDate ?? r.createdAt)}
                </Text>
            </VStack>
            <VStack align="end" gap={0} flexShrink={0}>
                <HStack
                    gap={1}
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    bg={style.bg}
                    color={style.color}
                >
                    <Box w="5px" h="5px" borderRadius="full" bg={style.dot} />
                    <Text fontSize="9px" fontWeight="semibold">
                        {r.status}
                    </Text>
                </HStack>
                <Text fontSize="10px" color="gray.500" mt={0.5}>
                    {r.streams.toLocaleString()} plays
                </Text>
            </VStack>
        </HStack>
    );
};

export const ReleasesPipelineCard: React.FC = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState<Tab>('Recent');

    const { data: summary } = useLabelReleaseSummary();
    const filters =
        tab === 'Recent'
            ? { sort: 'recent' as const, pageSize: 5 }
            : { status: [tab], sort: 'recent' as const, pageSize: 5 };
    const { data, isLoading } = useLabelReleases(filters);
    const items = data?.items ?? [];

    const countFor = (t: Tab): number => {
        if (!summary) return 0;
        switch (t) {
            case 'Recent':
                return summary.total;
            case 'Live':
                return summary.live;
            case 'Scheduled':
                return summary.scheduled;
            case 'Draft':
                return summary.drafts;
            case 'Processing':
                return summary.processing;
            case 'Failed':
                return 0;
        }
    };

    return (
        <Box bg="white" borderRadius="2xl" borderWidth="1px" borderColor="gray.100" overflow="hidden">
            <Flex
                px={4}
                pt={4}
                pb={2}
                justify="space-between"
                align={{ base: 'flex-start', md: 'center' }}
                direction={{ base: 'column', md: 'row' }}
                gap={3}
            >
                <VStack align="start" gap={0.5}>
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                        Release pipeline
                    </Text>
                    <Text fontSize="9px" color="gray.500">
                        What your roster has in flight
                    </Text>
                </VStack>
                <HStack
                    gap={0}
                    bg="gray.50"
                    p={1}
                    borderRadius="lg"
                    flexWrap="wrap"
                >
                    {TABS.map((t) => {
                        const active = tab === t;
                        return (
                            <Box
                                key={t}
                                as="button"
                                px={2.5}
                                py={1.5}
                                borderRadius="md"
                                bg={active ? 'white' : 'transparent'}
                                color={active ? 'gray.900' : 'gray.600'}
                                fontSize="10px"
                                fontWeight={active ? 'semibold' : 'medium'}
                                boxShadow={active ? 'sm' : 'none'}
                                onClick={() => setTab(t)}
                                cursor="pointer"
                                transition="background 120ms ease"
                            >
                                {t} · {countFor(t)}
                            </Box>
                        );
                    })}
                </HStack>
            </Flex>

            <Box px={2} pb={2}>
                {isLoading ? (
                    <Center py={8}>
                        <Spinner size="sm" color="primary.500" />
                    </Center>
                ) : items.length === 0 ? (
                    <Center py={8}>
                        <Text fontSize="xs" color="gray.500">
                            Nothing here yet.
                        </Text>
                    </Center>
                ) : (
                    <VStack align="stretch" gap={0}>
                        {items.map((r) => (
                            <ReleaseLine
                                key={r.id}
                                release={r}
                                onClick={() => navigate('/label/releases')}
                            />
                        ))}
                    </VStack>
                )}
            </Box>

            <Box
                as="button"
                borderTopWidth="1px"
                borderColor="gray.100"
                w="full"
                py={2.5}
                bg="white"
                _hover={{ bg: 'gray.50' }}
                onClick={() => navigate('/label/releases')}
                cursor="pointer"
            >
                <HStack justify="center" gap={1}>
                    <Text fontSize="10px" fontWeight="semibold" color="primary.500">
                        View all releases
                    </Text>
                    <FiArrowRight size={10} color="#f94444" />
                </HStack>
            </Box>
        </Box>
    );
};
