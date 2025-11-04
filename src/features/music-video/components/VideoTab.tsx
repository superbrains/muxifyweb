import React from 'react';
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
import { MediaItemCard } from './MediaItemCard';
import { useVideoStore } from '../store/useVideoStore';

export const VideoTab: React.FC = () => {
    const navigate = useNavigate();
    const { videoItems } = useVideoStore();

    return (
        <>
            {/* Actions */}
            <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                <Box />

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
                        onClick={() => navigate('/upload?tab=video')}
                    >
                        <Icon as={FiPlus} boxSize={4} mr={2} />
                        Upload
                    </Button>
                </HStack>
            </Flex>

            {/* Video List */}
            <VStack align="stretch" gap={3}>
                {videoItems.length === 0 ? (
                    <Box textAlign="center" py={12}>
                        <Text color="gray.500" fontSize="14px">
                            No videos found
                        </Text>
                        <Button
                            mt={4}
                            bg="primary.500"
                            color="white"
                            fontSize="12px"
                            onClick={() => navigate('/upload?tab=video')}
                            _hover={{ bg: 'primary.600' }}
                        >
                            Upload Your First Video
                        </Button>
                    </Box>
                ) : (
                    videoItems.map((item) => (
                        <MediaItemCard
                            key={item.id}
                            id={item.id}
                            thumbnail={item.thumbnail}
                            title={item.title}
                            artist={item.artist}
                            releaseDate={item.releaseDate}
                            plays={item.plays}
                            unlocks={item.unlocks}
                            gifts={item.gifts}
                            type="video"
                            onEdit={() => navigate(`/upload?videoId=${item.id}`)}
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

