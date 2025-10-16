import React, { useState } from 'react';
import { Button, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { MixReview } from './MixReview';
import { AlbumReview } from './AlbumReview';
import { UploadSuccessPage } from './UploadSuccessPage';

interface MusicReviewProps {
    albumTab: 'mix' | 'album';
    setAlbumTab: (tab: 'mix' | 'album') => void;
    onPublish: () => void;
}

export const MusicReview: React.FC<MusicReviewProps> = ({ albumTab, setAlbumTab, onPublish }) => {
    const [isPublished, setIsPublished] = useState(false);

    console.log('MusicReview rendering with albumTab:', albumTab);

    const handlePublish = () => {
        // Call the original onPublish function
        onPublish();
        // Show success page
        setIsPublished(true);
    };

    const handleUnderstand = () => {
        // Close the success page
        setIsPublished(false);
        // You could navigate away or reset the form here
    };

    const handleUploadMore = () => {
        // Close the success page
        setIsPublished(false);
        // Navigate back to upload or reset the form
        // This could be handled by the parent component
    };

    return (
        <>
            {/* Review Header */}
            <Flex align="center" gap={3} mb={6}>
                <Icon as={FiArrowLeft} boxSize={5} cursor="pointer" onClick={() => window.history.back()} _hover={{ color: 'primary.500' }} />
                <Text fontSize="18px" fontWeight="semibold" color="gray.900">
                    Review
                </Text>
            </Flex>

            {/* Sub Tabs and Publish Button */}
            <Flex justify="space-between" align="center" mb={{ base: 5, md: 7 }}>
                <HStack gap={0}>
                    <Button
                        size="xs"
                        variant="ghost"
                        bg={albumTab === 'mix' ? 'primary.500' : 'transparent'}
                        color={albumTab === 'mix' ? 'white' : 'gray.500'}
                        fontSize="11px"
                        fontWeight={albumTab === 'mix' ? 'semibold' : 'medium'}
                        px={4}
                        h="auto"
                        w="90px"
                        py={2}
                        borderRadius="md"
                        onClick={() => setAlbumTab('mix')}
                        _hover={{ bg: albumTab === 'mix' ? 'primary.600' : 'transparent' }}
                    >
                        Mix
                    </Button>
                    <Button
                        size="xs"
                        variant="solid"
                        bg={albumTab === 'album' ? 'primary.500' : 'transparent'}
                        color={albumTab === 'album' ? 'white' : 'gray.500'}
                        fontSize="11px"
                        fontWeight={albumTab === 'album' ? 'semibold' : 'medium'}
                        px={4}
                        h="auto"
                        w="90px"
                        py={2}
                        borderRadius="md"
                        onClick={() => setAlbumTab('album')}
                        _hover={{ bg: albumTab === 'album' ? 'primary.600' : 'transparent' }}
                    >
                        Album
                    </Button>
                </HStack>

                <Button
                    bg="primary.500"
                    color="white"
                    size="sm"
                    fontSize="12px"
                    fontWeight="semibold"
                    px={{ base: 5, md: 7 }}
                    h="38px"
                    borderRadius="md"
                    _hover={{ bg: 'primary.600' }}
                    onClick={handlePublish}
                >
                    Publish
                    <Icon as={FiArrowRight} boxSize={4} ml={2} />
                </Button>
            </Flex>

            {/* Content */}
            {albumTab === 'mix' ? <MixReview key="mix" /> : <AlbumReview key="album" />}

            {/* Success Page Modal */}
            {isPublished && (
                <UploadSuccessPage
                    onUnderstand={handleUnderstand}
                    onUploadMore={handleUploadMore}
                />
            )}
        </>
    );
};

