import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Input,
    SimpleGrid,
    Text,
    VStack,
    Spinner,
    Alert,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AnimatedTabs } from '@shared/components';
import { MediaGridCard } from './MediaGridCard';
import { MediaTable } from './MediaTable';
import { MediaTableRow } from './MediaTableRow';
import { ViewToggle } from './ViewToggle';
import { useMusicStore } from '../store/useMusicStore';
import { useViewModeStore } from '../store/useViewModeStore';
import { usePlayerStore } from '@/features/player/store/usePlayerStore';
import type { SingleItem, AlbumItem } from '../types';
import { useUserType } from '@/features/auth/hooks/useUserType';

export const MusicTab: React.FC = () => {
    const navigate = useNavigate();
    const viewMode = useViewModeStore((s) => s.mode);
    const playTrack = usePlayerStore((s) => s.play);
    const {
        singles,
        albums,
        isLoading,
        isDeleting,
        error,
        fetchTracks,
        fetchAlbums,
        deleteTrack,
        deleteAlbum,
        clearError,
    } = useMusicStore();

    useEffect(() => {
        fetchTracks();
        fetchAlbums();
    }, [fetchTracks, fetchAlbums]);

    const { isPodcaster, isDJ, isMusician } = useUserType();
    type SubTabId = 'single' | 'album' | 'mix' | 'episode' | 'topic';
    type InternalTab = 'single' | 'album';

    const [activeTab, setActiveTab] = useState<SubTabId>(
        isPodcaster ? 'episode' : isDJ ? 'mix' : 'single'
    );
    const [search, setSearch] = useState('');

    const getSubTabs = (): Array<{ id: SubTabId; label: string }> => {
        if (isPodcaster) {
            return [
                { id: 'episode', label: 'Episode' },
                { id: 'topic', label: 'Topic' },
            ];
        }
        if (isDJ) {
            return [
                { id: 'mix', label: 'Mix' },
                { id: 'album', label: 'Albums' },
            ];
        }
        if (isMusician) {
            return [
                { id: 'single', label: 'Single' },
                { id: 'album', label: 'Albums' },
            ];
        }
        return [
            { id: 'single', label: 'Single' },
            { id: 'album', label: 'Albums' },
        ];
    };

    const subTabs = getSubTabs();

    const mapToInternalTab = (tab: SubTabId): InternalTab => {
        if (tab === 'episode' || tab === 'mix' || tab === 'single') return 'single';
        return 'album';
    };
    const mapToDisplayTab = (tab: InternalTab): SubTabId => {
        if (isPodcaster) return tab === 'single' ? 'episode' : 'topic';
        if (isDJ) return tab === 'single' ? 'mix' : 'album';
        return tab;
    };

    const isSingleTab = (tab: SubTabId) => tab === 'single' || tab === 'mix' || tab === 'episode';

    const baseItems: (SingleItem | AlbumItem)[] = isSingleTab(activeTab) ? singles : albums;
    const filteredItems = search
        ? baseItems.filter(
              (it) =>
                  it.title.toLowerCase().includes(search.toLowerCase()) ||
                  it.artist.toLowerCase().includes(search.toLowerCase())
          )
        : baseItems;

    const handleSubTabChange = (tabId: string) => {
        const nextTab = subTabs.find((tab) => tab.id === tabId);
        if (nextTab) setActiveTab(nextTab.id);
    };

    const currentDisplayTab = mapToDisplayTab(mapToInternalTab(activeTab));
    const albumTabValue = isSingleTab(activeTab) ? 'mix' : 'album';
    const singleLabel = isPodcaster ? 'Episode' : isDJ ? 'Mix' : 'Single';
    const singleLabelPlural = isPodcaster ? 'episodes' : isDJ ? 'mixes' : 'singles';
    const albumLabel = isPodcaster ? 'Topic' : 'Album';
    const albumLabelPlural = isPodcaster ? 'topics' : 'albums';

    const onItemEdit = (item: SingleItem | AlbumItem) => {
        // Albums use the new draft-then-tracks editor; singles still use the legacy upload page.
        if (isSingleTab(activeTab)) {
            navigate(`/upload?mixId=${item.id}`);
        } else {
            navigate(`/upload/album/${item.id}`);
        }
    };
    const onItemOpen = (item: SingleItem | AlbumItem) => {
        navigate(`/music-videos/${isSingleTab(activeTab) ? 'single' : 'album'}/${item.id}`);
    };
    const onItemDelete = async (item: SingleItem | AlbumItem) => {
        if (isSingleTab(activeTab)) {
            await deleteTrack(item.id);
        } else {
            await deleteAlbum(item.id);
        }
    };
    const onItemPlay = (item: SingleItem | AlbumItem) => {
        if (isSingleTab(activeTab)) {
            playTrack(
                {
                    id: item.id,
                    title: item.title,
                    artist: item.artist,
                    coverArtUrl: item.coverArt,
                    durationSeconds: 0,
                },
                []
            );
        } else {
            navigate(`/music-videos/album/${item.id}`);
        }
    };

    const formatRelease = (raw: string) => {
        if (!raw) return '—';
        const d = new Date(raw);
        return Number.isNaN(d.getTime()) ? raw : d.toLocaleDateString();
    };

    return (
        <>
            {/* Sub Tabs and Actions */}
            <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                <AnimatedTabs
                    tabs={subTabs}
                    activeTab={currentDisplayTab}
                    onTabChange={handleSubTabChange}
                    size="sm"
                />

                <HStack gap={3} flexWrap="wrap">
                    <HStack
                        bg="white"
                        border="1px solid"
                        borderColor="gray.100"
                        borderRadius="lg"
                        px={3}
                        h="40px"
                        w={{ base: 'full', md: '260px' }}
                        shadow="sm"
                    >
                        <Icon as={FiSearch} color="gray.400" boxSize={4} />
                        <Input
                            placeholder="Search"
                            border="none"
                            p={0}
                            h="auto"
                            fontSize="13px"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            _placeholder={{ color: 'gray.400' }}
                            _focus={{ boxShadow: 'none' }}
                        />
                    </HStack>
                    <Button
                        variant="outline"
                        borderColor="gray.100"
                        color="gray.blue.700"
                        bg="white"
                        fontSize="13px"
                        h="40px"
                        px={4}
                        shadow="sm"
                        _hover={{ bg: 'gray.50' }}
                    >
                        <Icon as={FiFilter} boxSize={4} mr={2} />
                        Filters
                    </Button>
                    <ViewToggle />
                    <Button
                        bg="primary.500"
                        color="white"
                        fontSize="13px"
                        h="40px"
                        px={4}
                        shadow="sm"
                        _hover={{ bg: 'primary.600' }}
                        onClick={() => {
                            if (isSingleTab(activeTab)) {
                                navigate(`/upload?tab=music&albumTab=${albumTabValue}`);
                            } else {
                                navigate('/upload/album/new');
                            }
                        }}
                    >
                        <Icon as={FiPlus} boxSize={4} mr={2} />
                        {isSingleTab(activeTab) ? 'Upload' : 'New album'}
                    </Button>
                </HStack>
            </Flex>

            {/* Error Alert */}
            {error && (
                <Alert.Root status="error" mb={4} borderRadius="md">
                    <Alert.Indicator />
                    <Alert.Description flex={1}>{error}</Alert.Description>
                    <Button size="sm" variant="ghost" onClick={clearError}>
                        Dismiss
                    </Button>
                </Alert.Root>
            )}

            {/* List */}
            {isLoading ? (
                <Flex direction="column" align="center" py={20} gap={3}>
                    <Spinner size="lg" color="primary.500" />
                    <Text color="gray.blue.700" fontSize="13px">
                        Loading {isSingleTab(activeTab) ? singleLabelPlural : albumLabelPlural}…
                    </Text>
                </Flex>
            ) : filteredItems.length === 0 ? (
                <Box
                    bg="white"
                    borderWidth="1px"
                    borderColor="gray.100"
                    borderRadius="xl"
                    shadow="sm"
                    py={16}
                    textAlign="center"
                >
                    <VStack gap={3}>
                        <Text color="gray.blue.700" fontSize="14px" fontWeight="medium">
                            No {isSingleTab(activeTab) ? singleLabelPlural : albumLabelPlural} yet
                        </Text>
                        <Button
                            bg="primary.500"
                            color="white"
                            fontSize="13px"
                            onClick={() => {
                                if (isSingleTab(activeTab)) {
                                    navigate(`/upload?tab=music&albumTab=${albumTabValue}`);
                                } else {
                                    navigate('/upload/album/new');
                                }
                            }}
                            _hover={{ bg: 'primary.600' }}
                        >
                            {isSingleTab(activeTab)
                                ? `Upload your first ${singleLabel}`
                                : `Create your first ${albumLabel}`}
                        </Button>
                    </VStack>
                </Box>
            ) : viewMode === 'grid' ? (
                <SimpleGrid
                    columns={{ base: 2, md: 3, lg: 4, xl: 5 }}
                    gap={5}
                >
                    {filteredItems.map((item) => {
                        const album = 'album' in item ? item.album : undefined;
                        const isPublished = 'isPublished' in item ? item.isPublished : undefined;
                        return (
                            <MediaGridCard
                                key={item.id}
                                id={item.id}
                                thumbnail={item.coverArt}
                                title={item.title}
                                artist={item.artist}
                                album={album}
                                releaseDate={formatRelease(item.releaseDate)}
                                plays={item.plays}
                                kind={isSingleTab(activeTab) ? 'single' : 'album'}
                                isDeleting={isDeleting === item.id}
                                isPublished={isPublished}
                                onEdit={() => onItemEdit(item)}
                                onOpen={() => onItemOpen(item)}
                                onPlay={() => onItemPlay(item)}
                                onDelete={() => onItemDelete(item)}
                            />
                        );
                    })}
                </SimpleGrid>
            ) : (
                <MediaTable showAlbumColumn={false}>
                    {filteredItems.map((item) => (
                        <MediaTableRow
                            key={item.id}
                            id={item.id}
                            thumbnail={item.coverArt}
                            title={item.title}
                            artist={item.artist}
                            releaseDate={formatRelease(item.releaseDate)}
                            plays={item.plays}
                            unlocks={item.unlocks}
                            gifts={item.gifts}
                            kind={isSingleTab(activeTab) ? 'single' : 'album'}
                            showAlbumColumn={false}
                            isDeleting={isDeleting === item.id}
                            onEdit={() => onItemEdit(item)}
                            onOpen={() => onItemOpen(item)}
                            onPlay={() => onItemPlay(item)}
                            onDelete={() => onItemDelete(item)}
                        />
                    ))}
                </MediaTable>
            )}
        </>
    );
};
