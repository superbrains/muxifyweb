import React, { useState } from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Input,
    Text,
    VStack,
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
    const { singles, albums } = useMusicStore();
    const { isPodcaster, isDJ, isMusician } = useUserType();
    
    const [activeTab, setActiveTab] = useState<'single' | 'album' | 'mix' | 'episode' | 'topic'>(
        isPodcaster ? 'episode' : isDJ ? 'mix' : 'single'
    );

    // Get tabs based on user type
    const getSubTabs = () => {
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
    const mapToInternalTab = (tab: string): 'single' | 'album' => {
        if (tab === 'episode' || tab === 'mix' || tab === 'single') {
            return 'single';
        }
        return 'album';
    };
    
    const mapToDisplayTab = (tab: 'single' | 'album'): string => {
        if (isPodcaster) {
            return tab === 'single' ? 'episode' : 'topic';
        }
        if (isDJ) {
            return tab === 'single' ? 'mix' : 'album';
        }
        return tab;
    };
    
    const filteredItems: (SingleItem | AlbumItem)[] = (activeTab === 'single' || activeTab === 'mix' || activeTab === 'episode') 
        ? singles 
        : albums;

    return (
        <>
            {/* Sub Tabs and Actions */}
            <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                {/* Single/Album Tabs */}
                <AnimatedTabs
                    tabs={subTabs}
                    activeTab={mapToDisplayTab(activeTab as 'single' | 'album')}
                    onTabChange={(tab) => setActiveTab(mapToInternalTab(tab) as any)}
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
                            const albumTabValue = (activeTab === 'single' || activeTab === 'mix' || activeTab === 'episode') ? 'mix' : 'album';
                            navigate(`/upload?tab=music&albumTab=${albumTabValue}`);
                        }}
                    >
                        <Icon as={FiPlus} boxSize={4} mr={2} />
                        Upload
                    </Button>
                </HStack>
            </Flex>

            {/* Music/Album List */}
            <VStack align="stretch" gap={3}>
                {filteredItems.length === 0 ? (
                    <Box textAlign="center" py={12}>
                        <Text color="gray.500" fontSize="14px">
                            No {(activeTab === 'single' || activeTab === 'mix' || activeTab === 'episode') ? (isPodcaster ? 'episodes' : isDJ ? 'mixes' : 'singles') : (isPodcaster ? 'topics' : 'albums')} found
                        </Text>
                        <Button
                            mt={4}
                            bg="primary.500"
                            color="white"
                            fontSize="12px"
                            onClick={() => {
                                const albumTabValue = (activeTab === 'single' || activeTab === 'mix' || activeTab === 'episode') ? 'mix' : 'album';
                                navigate(`/upload?tab=music&albumTab=${albumTabValue}`);
                            }}
                            _hover={{ bg: 'primary.600' }}
                        >
                            Upload Your First {(activeTab === 'single' || activeTab === 'mix' || activeTab === 'episode') 
                                ? (isPodcaster ? 'Episode' : isDJ ? 'Mix' : 'Single') 
                                : (isPodcaster ? 'Topic' : 'Album')}
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
                            type={(activeTab === 'single' || activeTab === 'mix' || activeTab === 'episode') ? 'single' : 'album'}
                            onEdit={() => {
                                const isSingle = (activeTab === 'single' || activeTab === 'mix' || activeTab === 'episode');
                                navigate(isSingle ? `/upload?mixId=${item.id}` : `/upload?albumId=${item.id}`);
                            }}
                            onView={() => console.log('View', item.id)}
                            onDownload={() => console.log('Download', item.id)}
                            onDelete={() => console.log('Delete', item.id)}
                        />
                    ))
                )}
            </VStack>
        </>
    );
};

