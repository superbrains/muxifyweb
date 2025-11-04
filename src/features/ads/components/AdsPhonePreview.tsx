import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import { useAdsUploadStore } from '../store/useAdsUploadStore';

interface AdsPhonePreviewProps {
    adType: 'photo' | 'video' | 'audio';
}

export const AdsPhonePreview: React.FC<AdsPhonePreviewProps> = ({ adType }) => {
    const { photoFile, videoFile, musicFile } = useAdsUploadStore();
    
    const getFile = () => {
        switch (adType) {
            case 'photo':
                return photoFile;
            case 'video':
                return videoFile;
            case 'audio':
                return musicFile;
            default:
                return null;
        }
    };
    
    const file = getFile();
    
    return (
        <Box
            w={{ base: 'full', lg: '400px' }}
            bg="gray.100"
            borderRadius="lg"
            p={4}
            h="fit-content"
            position="sticky"
            top={4}
        >
            <VStack align="stretch" gap={4}>
                <Text fontSize="lg" fontWeight="bold" textAlign="center">
                    Ads Preview
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center" mb={2}>
                    This is the preview of your advert
                </Text>
                
                {file && (
                    <Box
                        bg="white"
                        borderRadius="md"
                        overflow="hidden"
                        position="relative"
                        minH="200px"
                    >
                        {adType === 'photo' && (
                            <img
                                src={file.url || (file.file ? URL.createObjectURL(file.file) : '')}
                                alt="Ad Preview"
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        )}
                        {adType === 'video' && (
                            <video
                                src={file.url || (file.file ? URL.createObjectURL(file.file) : '')}
                                controls
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        )}
                        {adType === 'audio' && (
                            <VStack p={6} gap={3}>
                                <Text fontSize="md" fontWeight="bold" textAlign="center">
                                    Audio Ad
                                </Text>
                                <audio
                                    src={file.url || (file.file ? URL.createObjectURL(file.file) : '')}
                                    controls
                                    style={{ width: '100%' }}
                                />
                            </VStack>
                        )}
                    </Box>
                )}
                
                {!file && (
                    <Box
                        bg="gray.200"
                        borderRadius="md"
                        p={10}
                        textAlign="center"
                    >
                        <Text fontSize="sm" color="gray.500">
                            Upload a file to see preview
                        </Text>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

