import React from 'react';
import { Box, Button, HStack, Icon } from '@chakra-ui/react';
import { FiMusic, FiVideo } from 'react-icons/fi';
import { MusicReview } from '../components/MusicReview';
import { VideoReview } from '../components/VideoReview';
import { useUploadStore } from '../store/useUploadStore';

export const Review: React.FC = () => {
    const { activeTab, setActiveTab, albumTab, setAlbumTab } = useUploadStore();

    const handlePublish = () => {
        // TODO: Implement publish logic
        console.log('Publishing...');
    };

    return (
        <Box bg="white" minH="100vh" p={{ base: 4, md: 6 }}>
            {/* Main Tabs */}
            <HStack
                bg="gray.100"
                p={1.5}
                mb={6}
                gap={1.5}
                borderRadius="lg"
                w="fit-content"
            >
                <Button
                    variant={activeTab === 'music' ? 'solid' : 'ghost'}
                    bg={activeTab === 'music' ? 'primary.500' : 'transparent'}
                    color={activeTab === 'music' ? 'white' : 'gray.600'}
                    fontSize="12px"
                    fontWeight="medium"
                    px={{ base: 4, md: 5 }}
                    py={2.5}
                    h="auto"
                    borderRadius="lg"
                    onClick={() => setActiveTab('music')}
                    _hover={{
                        bg: activeTab === 'music' ? 'primary.600' : 'gray.200',
                    }}
                >
                    <Icon as={FiMusic} boxSize={4} mr={2} />
                    Music
                </Button>
                <Button
                    variant={activeTab === 'video' ? 'solid' : 'ghost'}
                    bg={activeTab === 'video' ? 'primary.500' : 'transparent'}
                    color={activeTab === 'video' ? 'white' : 'gray.600'}
                    fontSize="12px"
                    fontWeight="medium"
                    px={{ base: 4, md: 5 }}
                    py={2.5}
                    h="auto"
                    borderRadius="lg"
                    onClick={() => setActiveTab('video')}
                    _hover={{
                        bg: activeTab === 'video' ? 'primary.600' : 'gray.200',
                    }}
                >
                    <Icon as={FiVideo} boxSize={4} mr={2} />
                    Video
                </Button>
            </HStack>



            {/* Content */}
            {activeTab === 'music' ? (
                <MusicReview
                    albumTab={albumTab}
                    setAlbumTab={setAlbumTab}
                    onPublish={handlePublish}
                />
            ) : (
                <VideoReview onPublish={handlePublish} />
            )}
        </Box>
    );
};

export default Review;

