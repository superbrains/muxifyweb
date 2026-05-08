import React, { useEffect, useState } from 'react';
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
import { MediaGridCard } from './MediaGridCard';
import { MediaTable } from './MediaTable';
import { MediaTableRow } from './MediaTableRow';
import { ViewToggle } from './ViewToggle';
import { useVideoStore } from '../store/useVideoStore';
import { useViewModeStore } from '../store/useViewModeStore';

export const VideoTab: React.FC = () => {
    const navigate = useNavigate();
    const viewMode = useViewModeStore((s) => s.mode);
    const {
        videoItems,
        isLoading,
        isDeleting,
        error,
        fetchVideos,
        deleteVideo,
        clearError,
    } = useVideoStore();

    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const filteredItems = search
        ? videoItems.filter(
              (it) =>
                  it.title.toLowerCase().includes(search.toLowerCase()) ||
                  it.artist.toLowerCase().includes(search.toLowerCase())
          )
        : videoItems;

    const formatRelease = (raw: string) => {
        if (!raw) return '—';
        const d = new Date(raw);
        return Number.isNaN(d.getTime()) ? raw : d.toLocaleDateString();
    };

    return (
        <>
            {/* Actions */}
            <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                <Box />

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
                        onClick={() => navigate('/upload?tab=video')}
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

            {/* Video List */}
            {isLoading ? (
                <Flex direction="column" align="center" py={20} gap={3}>
                    <Spinner size="lg" color="primary.500" />
                    <Text color="gray.blue.700" fontSize="13px">
                        Loading videos…
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
                            No videos yet
                        </Text>
                        <Button
                            bg="primary.500"
                            color="white"
                            fontSize="13px"
                            onClick={() => navigate('/upload?tab=video')}
                            _hover={{ bg: 'primary.600' }}
                        >
                            Upload your first video
                        </Button>
                    </VStack>
                </Box>
            ) : viewMode === 'grid' ? (
                <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} gap={5}>
                    {filteredItems.map((item) => (
                        <MediaGridCard
                            key={item.id}
                            id={item.id}
                            thumbnail={item.thumbnail}
                            title={item.title}
                            artist={item.artist}
                            releaseDate={formatRelease(item.releaseDate)}
                            plays={item.plays}
                            kind="video"
                            isDeleting={isDeleting === item.id}
                            onEdit={() => navigate(`/upload?videoId=${item.id}`)}
                            onOpen={() => navigate(`/music-videos/video/${item.id}`)}
                            onPlay={() => navigate(`/music-videos/video/${item.id}`)}
                            onDelete={async () => {
                                await deleteVideo(item.id);
                            }}
                        />
                    ))}
                </SimpleGrid>
            ) : (
                <MediaTable showAlbumColumn={false}>
                    {filteredItems.map((item) => (
                        <MediaTableRow
                            key={item.id}
                            id={item.id}
                            thumbnail={item.thumbnail}
                            title={item.title}
                            artist={item.artist}
                            releaseDate={formatRelease(item.releaseDate)}
                            plays={item.plays}
                            unlocks={item.unlocks}
                            gifts={item.gifts}
                            kind="video"
                            showAlbumColumn={false}
                            isDeleting={isDeleting === item.id}
                            onEdit={() => navigate(`/upload?videoId=${item.id}`)}
                            onOpen={() => navigate(`/music-videos/video/${item.id}`)}
                            onPlay={() => navigate(`/music-videos/video/${item.id}`)}
                            onDelete={async () => {
                                await deleteVideo(item.id);
                            }}
                        />
                    ))}
                </MediaTable>
            )}
        </>
    );
};
