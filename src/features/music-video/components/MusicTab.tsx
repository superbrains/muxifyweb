import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Input,
    Text,
    VStack,
    Spinner,
    Alert,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AnimatedTabs } from '@shared/components';
import { MediaItemCard } from './MediaItemCard';
import { useMusicStore } from '../store/useMusicStore';
import type { SingleItem, AlbumItem } from '../types';
import { useUserType } from '@/features/auth/hooks/useUserType';

export const MusicTab: React.FC = () => {
    const navigate = useNavigate();
    const {
        singles,
        albums,
        isLoading,
        isDeleting,
        error,
        fetchTracks,
        deleteTrack,
        clearError,
    } = useMusicStore();

    // Fetch tracks on mount
    useEffect(() => {
        fetchTracks();
    }, [fetchTracks]);
    const { isPodcaster, isDJ, isMusician } = useUserType();
    type SubTabId = 'single' | 'album' | 'mix' | 'episode' | 'topic';
    type InternalTab = 'single' | 'album';

    const [activeTab, setActiveTab] = useState<SubTabId>(
        isPodcaster ? 'episode' : isDJ ? 'mix' : 'single'
    );

    // Get tabs based on user type
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

    // Map display tabs to internal state
    const mapToInternalTab = (tab: SubTabId): InternalTab => {
        if (tab === 'episode' || tab === 'mix' || tab === 'single') {
            return 'single';
        }
        return 'album';
    };

    const mapToDisplayTab = (tab: InternalTab): SubTabId => {
        if (isPodcaster) {
            return tab === 'single' ? 'episode' : 'topic';
        }
        if (isDJ) {
            return tab === 'single' ? 'mix' : 'album';
        }
        return tab;
    };

    const isSingleTab = (tab: SubTabId) => tab === 'single' || tab === 'mix' || tab === 'episode';
    const filteredItems: (SingleItem | AlbumItem)[] = isSingleTab(activeTab)
        ? singles
        : albums;

    const handleSubTabChange = (tabId: string) => {
        const nextTab = subTabs.find((tab) => tab.id === tabId);
        if (nextTab) {
            setActiveTab(nextTab.id);
        }
    };

    const currentDisplayTab = mapToDisplayTab(mapToInternalTab(activeTab));
    const albumTabValue = isSingleTab(activeTab) ? 'mix' : 'album';
    const singleLabel = isPodcaster ? 'Episode' : isDJ ? 'Mix' : 'Single';
    const singleLabelPlural = isPodcaster ? 'episodes' : isDJ ? 'mixes' : 'singles';
    const albumLabel = isPodcaster ? 'Topic' : 'Album';
    const albumLabelPlural = isPodcaster ? 'topics' : 'albums';

    return (
        <>
            {/* Sub Tabs and Actions */}
            <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                {/* Single/Album Tabs */}
                <AnimatedTabs
                    tabs={subTabs}
                    activeTab={currentDisplayTab}
                    onTabChange={handleSubTabChange}
                    size="sm"
                />

                {/* Search and Actions */}
                <HStack gap={3}>
                    <HStack
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        px={3}
                        h="40px"
                        w="250px"
                    >
                        <Icon as={FiSearch} color="gray.400" boxSize={4} />
                        <Input
                            placeholder="Search"
                            border="none"
                            p={0}
                            h="auto"
                            fontSize="12px"
                            _placeholder={{ color: 'gray.400' }}
                            _focus={{ boxShadow: 'none' }}
                        />
                    </HStack>
                    <Button
                        variant="outline"
                        borderColor="gray.200"
                        color="gray.600"
                        fontSize="12px"
                        h="40px"
                        px={4}
                        _hover={{ bg: 'gray.50' }}
                    >
                        <Icon as={FiFilter} boxSize={4} mr={2} />
                        Filters
                    </Button>
                    <Button
                        bg="primary.500"
                        color="white"
                        fontSize="12px"
                        h="40px"
                        px={4}
                        _hover={{ bg: 'primary.600' }}
                        onClick={() => {
                            navigate(`/upload?tab=music&albumTab=${albumTabValue}`);
                        }}
                    >
                        <Icon as={FiPlus} boxSize={4} mr={2} />
                        Upload
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

            {/* Music/Album List */}
            <VStack align="stretch" gap={3}>
                {isLoading ? (
                    <Box textAlign="center" py={12}>
                        <Spinner size="lg" color="primary.500" />
                        <Text mt={4} color="gray.500" fontSize="14px">
                            Loading {isSingleTab(activeTab) ? singleLabelPlural : albumLabelPlural}...
                        </Text>
                    </Box>
                ) : filteredItems.length === 0 ? (
                    <Box textAlign="center" py={12}>
                        <Text color="gray.500" fontSize="14px">
                            No {isSingleTab(activeTab) ? singleLabelPlural : albumLabelPlural} found
                        </Text>
                        <Button
                            mt={4}
                            bg="primary.500"
                            color="white"
                            fontSize="12px"
                            onClick={() => {
                                navigate(`/upload?tab=music&albumTab=${albumTabValue}`);
                            }}
                            _hover={{ bg: 'primary.600' }}
                        >
                            Upload Your First {isSingleTab(activeTab) ? singleLabel : albumLabel}
                        </Button>
                    </Box>
                ) : (
                    filteredItems.map((item) => (
                        <MediaItemCard
                            key={item.id}
                            id={item.id}
                            thumbnail={item.coverArt}
                            title={item.title}
                            artist={item.artist}
                            album={'album' in item ? item.album : undefined}
                            releaseDate={item.releaseDate}
                            plays={item.plays}
                            unlocks={item.unlocks}
                            gifts={item.gifts}
                            type={isSingleTab(activeTab) ? 'single' : 'album'}
                            isDeleting={isDeleting === item.id}
                            onEdit={() => {
                                const isSingle = isSingleTab(activeTab);
                                navigate(isSingle ? `/upload?mixId=${item.id}` : `/upload?albumId=${item.id}`);
                            }}
                            onView={() => console.log('View', item.id)}
                            onDownload={() => console.log('Download', item.id)}
                            onDelete={async () => {
                                if (isSingleTab(activeTab)) {
                                    await deleteTrack(item.id);
                                }
                            }}
                        />
                    ))
                )}
            </VStack>
        </>
    );
};

