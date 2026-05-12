import React from 'react';
import {
    Box,
    Button,
    Center,
    HStack,
    Menu,
    Portal,
    Skeleton,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiChevronDown, FiUserPlus } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLabelReleases, useLabelReleaseSummary } from '../hooks/useLabelReleases';
import { useRoster } from '../hooks/useRoster';
import { PickRosterArtistDialog } from '../components/PickRosterArtistDialog';
import { InviteArtistDialog } from '../components/InviteArtistDialog';
import { ReleasesKpiStrip } from '../components/ReleasesKpiStrip';
import { ReleasesFilterBar } from '../components/ReleasesFilterBar';
import { ReleaseRow } from '../components/ReleaseRow';
import { ReleaseDetailDrawer } from '../components/ReleaseDetailDrawer';
import type {
    LabelReleaseDto,
    ReleaseFilters,
    ReleaseSortKey,
    ReleaseStatus,
} from '../types';

const VALID_SORTS: ReleaseSortKey[] = ['recent', 'streams', 'title'];
const VALID_STATUSES: ReleaseStatus[] = [
    'Live',
    'Scheduled',
    'Draft',
    'Processing',
    'Failed',
];

function filtersFromParams(params: URLSearchParams): ReleaseFilters {
    const kind = params.get('kind');
    const status = params.get('status');
    const artists = params.get('artists');
    const search = params.get('search');
    const sort = params.get('sort');
    const page = params.get('page');

    return {
        kind:
            kind === 'track' || kind === 'video' || kind === 'all'
                ? (kind as ReleaseFilters['kind'])
                : 'all',
        status: status
            ? (status
                  .split(',')
                  .filter((s): s is ReleaseStatus => VALID_STATUSES.includes(s as ReleaseStatus)))
            : undefined,
        artistIds: artists ? artists.split(',').filter(Boolean) : undefined,
        search: search || undefined,
        sort: sort && VALID_SORTS.includes(sort as ReleaseSortKey)
            ? (sort as ReleaseSortKey)
            : 'recent',
        page: page ? Math.max(1, Number(page)) : 1,
        pageSize: 25,
    };
}

function paramsFromFilters(filters: ReleaseFilters): URLSearchParams {
    const p = new URLSearchParams();
    if (filters.kind && filters.kind !== 'all') p.set('kind', filters.kind);
    if (filters.status && filters.status.length > 0) p.set('status', filters.status.join(','));
    if (filters.artistIds && filters.artistIds.length > 0) p.set('artists', filters.artistIds.join(','));
    if (filters.search) p.set('search', filters.search);
    if (filters.sort && filters.sort !== 'recent') p.set('sort', filters.sort);
    if (filters.page && filters.page > 1) p.set('page', String(filters.page));
    return p;
}

const ReleasesPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = React.useMemo(() => filtersFromParams(searchParams), [searchParams]);
    const updateFilters = React.useCallback(
        (next: ReleaseFilters) => setSearchParams(paramsFromFilters(next), { replace: false }),
        [setSearchParams],
    );

    const [pickerMode, setPickerMode] = React.useState<'audio' | 'video' | null>(null);
    const [inviteOpen, setInviteOpen] = React.useState(false);
    const [detail, setDetail] = React.useState<LabelReleaseDto | null>(null);

    const { data: releasesPage, isLoading, isError, refetch } = useLabelReleases(filters);
    const { data: summary, isLoading: summaryLoading } = useLabelReleaseSummary();
    const { data: roster } = useRoster();

    const releases = releasesPage?.items ?? [];
    const total = releasesPage?.total ?? 0;
    const rosterCount = roster?.length ?? 0;

    const hasFiltersApplied =
        (filters.search && filters.search.length > 0) ||
        (filters.artistIds && filters.artistIds.length > 0) ||
        (filters.status && filters.status.length > 0) ||
        (filters.kind && filters.kind !== 'all');

    const openSplits = React.useCallback(
        (r: LabelReleaseDto) => navigate(`/label/splits/${r.id}`),
        [navigate],
    );
    const openAnalytics = React.useCallback(
        (r: LabelReleaseDto) => navigate(`/label/analytics?trackId=${r.id}`),
        [navigate],
    );
    const editRelease = React.useCallback(
        (r: LabelReleaseDto) => {
            if (r.kind === 'video') {
                navigate(`/music-videos/video/${r.id}`);
            } else if (r.albumId) {
                navigate(`/upload/album/${r.albumId}`);
            } else {
                navigate(`/music-videos/single/${r.id}`);
            }
        },
        [navigate],
    );

    const handlePick = (artistUserId: string) => {
        const mode = pickerMode;
        setPickerMode(null);
        if (mode === 'video') {
            navigate(`/upload?onBehalfOf=${artistUserId}&tab=video`);
        } else {
            navigate(`/upload/album/new?onBehalfOf=${artistUserId}`);
        }
    };

    return (
        <VStack
            gap={{ base: 3, lg: 5 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            {/* Header */}
            <HStack justify="space-between" align="center" wrap={{ base: 'wrap', md: 'nowrap' }} gap={2}>
                <Box>
                    <Text fontSize="md" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                        Releases
                    </Text>
                    <Text fontSize="11px" color="gray.600">
                        Music & music videos from your roster
                    </Text>
                </Box>
                <HStack gap={2}>
                    <Button
                        onClick={() => setInviteOpen(true)}
                        variant="outline"
                        size="sm"
                        fontSize="xs"
                        fontWeight="medium"
                        borderRadius="10px"
                        borderColor="gray.200"
                        color="gray.700"
                    >
                        <HStack gap={1.5}>
                            <FiUserPlus />
                            <Text>Invite artist</Text>
                        </HStack>
                    </Button>
                    <Menu.Root>
                        <Menu.Trigger asChild>
                            <Button
                                bg="primary.500"
                                color="white"
                                size="sm"
                                fontSize="xs"
                                fontWeight="medium"
                                borderRadius="10px"
                                _hover={{ bg: 'primary.600' }}
                                disabled={rosterCount === 0}
                            >
                                <HStack gap={1}>
                                    <Text>+ New Release</Text>
                                    <FiChevronDown />
                                </HStack>
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
                                        value="audio"
                                        onClick={() => setPickerMode('audio')}
                                        fontSize="xs"
                                        _hover={{ bg: 'gray.50' }}
                                    >
                                        Audio release
                                    </Menu.Item>
                                    <Menu.Item
                                        value="video"
                                        onClick={() => setPickerMode('video')}
                                        fontSize="xs"
                                        _hover={{ bg: 'gray.50' }}
                                    >
                                        Music video
                                    </Menu.Item>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                </HStack>
            </HStack>

            {/* KPI strip */}
            <ReleasesKpiStrip summary={summary} isLoading={summaryLoading} />

            {/* Filter bar */}
            <ReleasesFilterBar
                filters={filters}
                onChange={updateFilters}
                roster={roster ?? []}
            />

            {/* Body */}
            {isError ? (
                <Center bg="white" borderRadius="20px" py={10} px={4} minH="30vh" flexDirection="column" gap={3}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        Couldn't load releases
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                        Check your connection and try again.
                    </Text>
                    <Button onClick={() => refetch()} size="sm" fontSize="xs" variant="outline" borderRadius="10px">
                        Retry
                    </Button>
                </Center>
            ) : isLoading ? (
                <Box bg="white" borderRadius="20px" overflow="hidden" border="1px solid" borderColor="gray.100">
                    <Stack gap={0}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <HStack key={i} px={4} py={3} borderBottom="1px solid" borderColor="gray.50" gap={3}>
                                <Skeleton boxSize="48px" borderRadius="md" />
                                <VStack align="stretch" flex="1" gap={1.5}>
                                    <Skeleton height="10px" width="60%" />
                                    <Skeleton height="8px" width="40%" />
                                </VStack>
                                <Skeleton height="20px" width="60px" borderRadius="full" />
                                <Skeleton height="10px" width="50px" />
                            </HStack>
                        ))}
                    </Stack>
                </Box>
            ) : rosterCount === 0 ? (
                <Center
                    bg="white"
                    borderRadius="20px"
                    py={12}
                    px={4}
                    minH="40vh"
                    flexDirection="column"
                    gap={3}
                >
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        Invite your first artist
                    </Text>
                    <Text fontSize="xs" color="gray.500" textAlign="center" maxW="320px">
                        Once an artist accepts your invitation, their releases will appear here — whether you upload on their behalf or they upload themselves.
                    </Text>
                    <Button
                        onClick={() => setInviteOpen(true)}
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
                </Center>
            ) : releases.length === 0 && hasFiltersApplied ? (
                <Center bg="white" borderRadius="20px" py={10} px={4} minH="30vh" flexDirection="column" gap={3}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        No releases match these filters
                    </Text>
                    <Button
                        onClick={() => updateFilters({ kind: 'all', sort: 'recent', page: 1 })}
                        variant="outline"
                        size="sm"
                        fontSize="xs"
                        borderRadius="10px"
                    >
                        Clear filters
                    </Button>
                </Center>
            ) : releases.length === 0 ? (
                <Center
                    bg="white"
                    borderRadius="20px"
                    py={12}
                    px={4}
                    minH="40vh"
                    flexDirection="column"
                    gap={3}
                >
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        Your roster hasn't released anything yet
                    </Text>
                    <Text fontSize="xs" color="gray.500" textAlign="center" maxW="340px">
                        Pick a roster artist and upload their first release, or wait for them to upload themselves.
                    </Text>
                    <Button
                        onClick={() => setPickerMode('audio')}
                        bg="primary.500"
                        color="white"
                        size="sm"
                        fontSize="xs"
                        fontWeight="medium"
                        borderRadius="10px"
                        _hover={{ bg: 'primary.600' }}
                    >
                        Upload on their behalf
                    </Button>
                </Center>
            ) : (
                <>
                    <Box bg="white" borderRadius="20px" overflow="hidden" border="1px solid" borderColor="gray.100">
                        <Stack gap={0}>
                            {releases.map((r) => (
                                <ReleaseRow
                                    key={`${r.kind}-${r.id}`}
                                    release={r}
                                    onOpenDetail={setDetail}
                                    onOpenSplits={openSplits}
                                    onOpenAnalytics={openAnalytics}
                                    onEdit={editRelease}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {/* Pagination */}
                    {releasesPage && releasesPage.total > releasesPage.pageSize && (
                        <HStack justify="space-between" align="center" px={1}>
                            <Text fontSize="11px" color="gray.500">
                                Showing {(releasesPage.page - 1) * releasesPage.pageSize + 1}–
                                {Math.min(releasesPage.page * releasesPage.pageSize, total)} of{' '}
                                {total.toLocaleString()}
                            </Text>
                            <HStack gap={2}>
                                <Button
                                    onClick={() =>
                                        updateFilters({ ...filters, page: Math.max(1, (filters.page ?? 1) - 1) })
                                    }
                                    disabled={(filters.page ?? 1) <= 1}
                                    size="xs"
                                    variant="outline"
                                    fontSize="11px"
                                    borderRadius="8px"
                                >
                                    Previous
                                </Button>
                                <Button
                                    onClick={() => updateFilters({ ...filters, page: (filters.page ?? 1) + 1 })}
                                    disabled={
                                        (filters.page ?? 1) * (releasesPage.pageSize || 25) >= total
                                    }
                                    size="xs"
                                    variant="outline"
                                    fontSize="11px"
                                    borderRadius="8px"
                                >
                                    Next
                                </Button>
                            </HStack>
                        </HStack>
                    )}
                </>
            )}

            <PickRosterArtistDialog
                open={pickerMode !== null}
                roster={roster ?? []}
                onClose={() => setPickerMode(null)}
                onPick={handlePick}
            />
            <InviteArtistDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
            <ReleaseDetailDrawer
                release={detail}
                onClose={() => setDetail(null)}
                onOpenSplits={openSplits}
                onOpenAnalytics={openAnalytics}
                onEdit={editRelease}
            />
        </VStack>
    );
};

export default ReleasesPage;
