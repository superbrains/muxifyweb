
import React from 'react';
import { Box, VStack, HStack, Text, Button } from '@chakra-ui/react';
import { useAdsUploadStore } from '../store/useAdsUploadStore';
import { FiHeart, FiPlus, FiShare2, FiShuffle, FiRepeat, FiSkipBack, FiSkipForward, FiPlay } from 'react-icons/fi';
import { MdMusicNote, MdMoreVert } from 'react-icons/md';
import { IoGift } from 'react-icons/io5';
import { UploadImageIcon } from '@/shared/icons/CustomIcons';

export const PhotoAdsPhonePreview: React.FC = () => {
    const { photoFile } = useAdsUploadStore();

    return (
        <VStack align="stretch" gap={3} w="full" maxW="300px">
            <VStack align="stretch" gap={1}>
                <Text fontSize="16px" fontWeight="semibold" textAlign="center" color="black">
                    Ads Sample
                </Text>
                <Text fontSize="14px" fontWeight="medium" textAlign="center" color="gray.500">
                    This is the preview of your advert
                </Text>
            </VStack>

            {/* Phone Frame */}
            <Box
                bg="white"
                borderRadius="20px"
                overflow="hidden"
                position="relative"
                h="650px"
                w="full"
                style={{ backgroundImage: "url('https://res.cloudinary.com/dygrsvya5/image/upload/v1762125926/Free_Play_alsxkl.png')" }}
                backgroundSize="cover"
                backgroundPosition="center"
                backgroundRepeat="no-repeat"
                boxShadow="0px 5.39px 16.17px 6.29px rgba(0,0,0,0.1)"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
            >
                {/* Background Gradient */}
                <Box
                    position="absolute"
                    inset={0}
                    bgGradient="linear(to bottom, transparent 0%, black 102.89%)"
                    opacity={0.8}
                />

                {/* Top Navigation Bar */}
                <Box position="absolute" top="12px" left="12px" right="12px" zIndex={2}>
                    <HStack justify="space-between" align="center" mb={1}>
                        {/* Back Button */}
                        <Button
                            variant="ghost"
                            size="xs"
                            borderRadius="20px"
                            bg="rgba(255,255,255,0.16)"
                            backdropFilter="blur(27px)"
                            minW="28px"
                            h="28px"
                            p={0}
                        >
                            <FiSkipBack size={14} color="white" />
                        </Button>

                        {/* Artist Info */}
                        <VStack gap={0} align="center">
                            <Text fontSize="12px" fontWeight="normal" color="white">
                                Omah Lay
                            </Text>
                            <Text fontSize="10px" fontWeight="normal" color="rgba(255,255,255,0.65)">
                                Latest Release
                            </Text>
                        </VStack>

                        {/* Menu Button */}
                        <Button
                            variant="ghost"
                            size="xs"
                            borderRadius="20px"
                            bg="rgba(255,255,255,0.16)"
                            backdropFilter="blur(27px)"
                            minW="28px"
                            h="28px"
                            p={0}
                        >
                            <MdMoreVert size={18} color="white" />
                        </Button>
                    </HStack>

                    {/* Lyrics Button */}
                    <Button
                        variant="ghost"
                        size="xs"
                        borderRadius="20px"
                        bg="rgba(255,255,255,0.08)"
                        backdropFilter="blur(29px)"
                        h="24px"
                        px="8px"
                        gap={1}
                        left="50%"
                        transform="translateX(-50%)"
                        position="absolute"
                        mt={1}
                    >
                        <MdMusicNote size={14} color="white" />
                        <Text fontSize="10px" fontWeight="medium" color="white">
                            Lyrics
                        </Text>
                    </Button>
                </Box>

                {/* Ad Image - Central */}
                <Box
                    position="absolute"
                    top="100px"
                    left="50%"
                    transform="translateX(-50%)"
                    w="260px"
                    h="260px"
                    borderRadius="12px"
                    overflow="hidden"
                    boxShadow="0px 5.39px 16.17px 6.29px rgba(0,0,0,0.1)"
                >
                    {photoFile && photoFile.url ? (
                        <>
                            <img
                                src={photoFile.url}
                                alt="Ad Preview"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                            {/* Close button overlay */}
                            <Button
                                position="absolute"
                                top="3px"
                                right="3px"
                                variant="ghost"
                                size="xs"
                                w="24px"
                                h="24px"
                                bg="rgba(0,0,0,0.08)"
                                backdropFilter="blur(29px)"
                                borderRadius="full"
                                p={0}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                _hover={{ bg: 'rgba(0,0,0,0.09)' }}
                            >
                                <Text fontSize="md" fontWeight="bold" color="white">
                                    ×
                                </Text>
                            </Button>
                        </>
                    ) : (
                        <Box
                            w="100%"
                            h="100%"
                            bg="rgba(255,255,255,0.1)"
                            backdropFilter="blur(10px)"
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            gap={2}
                            border="2px dashed"
                            borderColor="rgba(255,255,255,0.3)"
                        >
                            <Box
                                w="60px"
                                h="60px"
                                borderRadius="full"
                                bg="rgba(255,255,255,0.15)"
                                backdropFilter="blur(10px)"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <UploadImageIcon boxSize={8} color="white" />
                            </Box>
                            <Text fontSize="12px" fontWeight="medium" color="rgba(255,255,255,0.8)" textAlign="center" px={4}>
                                Photo Ad Preview
                            </Text>
                        </Box>
                    )}
                </Box>

                {/* Music Player Section */}
                <Box
                    position="absolute"
                    bottom="80px"
                    left="12px"
                    w="93%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    right="12px"
                    zIndex={2}
                >
                    <VStack align="stretch" gap={4} w="260px">
                        {/* Song Info */}
                        <HStack justify="space-between" align="center">
                            <VStack align="start" gap={0} flex={1}>
                                <Text fontSize="14px" fontWeight="semibold" color="white">
                                    Moving
                                </Text>
                                <Text fontSize="12px" fontWeight="normal" color="rgba(255,255,255,0.64)">
                                    Omah Lay
                                </Text>
                            </VStack>
                            <Button
                                variant="ghost"
                                size="xs"
                                borderRadius="20px"
                                bg="rgba(255,255,255,0.08)"
                                backdropFilter="blur(29px)"
                                minW="28px"
                                h="28px"
                                p={0}
                            >
                                <MdMusicNote size={16} color="white" />
                            </Button>
                        </HStack>

                        {/* Action Buttons */}
                        <HStack justify="space-between" align="center" gap={2}>
                            <Button
                                bg="rgba(255,255,255,0.75)"
                                border="1px solid white"
                                borderRadius="20px"
                                px={2}
                                py={1}
                                h="auto"
                                gap={1}
                            >
                                <Box
                                    w="20px"
                                    h="20px"
                                    borderRadius="full"
                                    bg="black"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <FiPlay size={5} className='scale-50' fill="white" />
                                </Box>
                                <Text fontSize="10px" fontWeight="semibold" color="black">
                                    Unlock Song
                                </Text>
                            </Button>

                            <HStack gap={2}>
                                <Button
                                    variant="ghost"
                                    size="xs"
                                    borderRadius="20px"
                                    bg="rgba(255,255,255,0.08)"
                                    backdropFilter="blur(29px)"
                                    minW="28px"
                                    h="28px"
                                    p={0}
                                >
                                    <FiHeart size={16} color="white" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="xs"
                                    borderRadius="20px"
                                    bg="rgba(255,255,255,0.08)"
                                    backdropFilter="blur(29px)"
                                    minW="28px"
                                    h="28px"
                                    p={0}
                                >
                                    <FiPlus size={18} color="white" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="xs"
                                    borderRadius="20px"
                                    bg="rgba(255,255,255,0.08)"
                                    backdropFilter="blur(29px)"
                                    minW="28px"
                                    h="28px"
                                    p={0}
                                >
                                    <FiShare2 size={16} color="white" />
                                </Button>
                            </HStack>
                        </HStack>

                        {/* Progress Bar */}
                        <VStack align="stretch" gap={1}>
                            <Box
                                bg="rgba(255,255,255,0.16)"
                                backdropFilter="blur(29px)"
                                h="6px"
                                borderRadius="12px"
                                overflow="hidden"
                            >
                                <Box
                                    bg="rgba(255,255,255,0.48)"
                                    h="100%"
                                    w="30px"
                                    borderRadius="3px"
                                />
                            </Box>
                            <HStack justify="space-between" fontSize="10px" fontWeight="medium" color="rgba(255,255,255,0.64)">
                                <Text>0:30</Text>
                                <Text>5:01</Text>
                            </HStack>
                        </VStack>

                        {/* Controls */}
                        <HStack justify="space-between" align="center" px={1}>
                            <Button variant="ghost" size="xs" minW="28px" bg="rgba(255,255,255,0.08)"
                                backdropFilter="blur(29px)" h="28px" borderRadius="20px" p={0}>
                                <FiRepeat size={14} color="white" />
                            </Button>

                            <HStack gap={1}>
                                <Button
                                    variant="ghost"
                                    size="xs"
                                    borderRadius="20px"
                                    bg="rgba(255,255,255,0.08)"
                                    backdropFilter="blur(29px)"
                                    minW="32px"
                                    h="32px"
                                    p={0}
                                >
                                    <FiSkipBack size={16} color="white" fill='white' />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    rounded="full"
                                    bg="rgba(255,255,255,0.08)"
                                    backdropFilter="blur(38px)"
                                    minW="44px"
                                    h="44px"
                                    p={0}
                                >
                                    <FiPlay size={20} color="white" fill="white" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="xs"
                                    borderRadius="20px"
                                    bg="rgba(255,255,255,0.08)"
                                    backdropFilter="blur(29px)"
                                    minW="32px"
                                    h="32px"
                                    p={0}
                                >
                                    <FiSkipForward size={16} color="white" fill='white' />
                                </Button>
                            </HStack>

                            <Button variant="ghost" size="xs" minW="28px" bg="rgba(255,255,255,0.08)"
                                backdropFilter="blur(29px)" h="28px" borderRadius="20px" p={0}>
                                <FiShuffle size={14} color="white" />
                            </Button>
                        </HStack>
                    </VStack>
                </Box>

                {/* Send Gifts Button */}
                <Button
                    position="absolute"
                    bottom="12px"
                    left="50%"
                    w="90%"
                    transform="translateX(-50%)"
                    bg="rgba(249,68,68,0.5)"
                    backdropFilter="blur(45px)"
                    borderRadius="16px"
                    h="36px"
                    px={3}
                    gap={1}
                    _hover={{ bg: 'rgba(249,68,68,0.6)' }}
                >
                    <IoGift size={18} color="white" />
                    <Text fontSize="12px" fontWeight="medium" color="white">
                        Send Gifts
                    </Text>
                </Button>
            </Box>
        </VStack>
    );
};

