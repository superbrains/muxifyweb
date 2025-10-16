import React from 'react';
import {
    Box,
    Button,
    HStack,
    Icon,
} from '@chakra-ui/react';
import { FiMusic, FiVideo } from 'react-icons/fi';
import { MusicUploadTab } from '@uploadMusic/components/MusicUploadTab';
import { VideoUploadTab } from '@uploadVideo/components/VideoUploadTab';
import { useUploadStore } from '@upload/store/useUploadStore';

export const Upload: React.FC = () => {
    const { activeTab, setActiveTab, albumTab, setAlbumTab } = useUploadStore();

    return (
        <Box bg="white" minH="100vh" p={{ base: 4, md: 6 }}>
            {/* Main Tabs */}
            <HStack
                bg="gray.50"
                borderRadius="lg"
                p={1.5}
                mb={6}
                w={{ base: 'full', md: 'fit-content' }}
                gap={1.5}
            >
                <Button
                    size="sm"
                    bg={activeTab === 'music' ? 'primary.500' : 'transparent'}
                    color={activeTab === 'music' ? 'white' : 'gray.600'}
                    fontSize="12px"
                    fontWeight={activeTab === 'music' ? 'semibold' : 'medium'}
                    px={{ base: 4, md: 5 }}
                    py={2.5}
                    h="auto"
                    borderRadius="md"
                    onClick={() => setActiveTab('music')}
                    _hover={{
                        bg: activeTab === 'music' ? 'primary.600' : 'gray.100',
                    }}
                >
                    <Icon as={FiMusic} boxSize={4} mr={2} />
                    Music
                </Button>
                <Button
                    size="sm"
                    bg={activeTab === 'video' ? 'primary.500' : 'transparent'}
                    color={activeTab === 'video' ? 'white' : 'gray.600'}
                    fontSize="12px"
                    fontWeight={activeTab === 'video' ? 'semibold' : 'medium'}
                    px={{ base: 4, md: 5 }}
                    py={2.5}
                    h="auto"
                    borderRadius="md"
                    onClick={() => setActiveTab('video')}
                    _hover={{
                        bg: activeTab === 'video' ? 'primary.600' : 'gray.100',
                    }}
                >
                    <Icon as={FiVideo} boxSize={4} mr={2} />
                    Video
                </Button>
            </HStack>

            {/* Tab Content */}
            {activeTab === 'music' ? (
                <MusicUploadTab albumTab={albumTab} setAlbumTab={setAlbumTab} />
            ) : (
                <VideoUploadTab />
            )}
        </Box>
    );
};

export default Upload;

