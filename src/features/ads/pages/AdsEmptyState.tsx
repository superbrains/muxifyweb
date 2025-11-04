import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    VStack,
    Button,
    Text,
} from '@chakra-ui/react';
import { FlashIcon } from '@/shared/icons/CustomIcons';

export const AdsEmptyState: React.FC = () => {
    const navigate = useNavigate();

    const handleCreateCampaign = () => {
        navigate('/ads/create-campaign');
    };

    return (
        <Box minH="90vh" bg="white" borderRadius="20px" display="flex" justifyContent="center" alignItems="center" p={4}>
            <Box
                bg="#0095ff"
                borderRadius="10px"
                position="relative"
                overflow="hidden"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                style={{ backgroundImage: "url('https://res.cloudinary.com/dygrsvya5/image/upload/v1762113250/Background-blue_iekzdy.png')" }}
                px={6}
                py={8}
                width="100%"
                maxW="320px"
            >
                {/* Decorative elements */}
                <Box
                    position="absolute"
                    top="0"
                    right="0"
                    width="50%"
                    height="50%"
                    background="radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)"
                    transform="translate(25%, -25%)"
                />

                <VStack gap={4} align="center" position="relative" zIndex={1}>
                    {/* Flash Icon */}
                    <Box
                        position="relative"
                        w="50px"
                        h="50px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        {/* Background circle */}
                        <Box
                            position="absolute"
                            w="50px"
                            h="50px"
                            borderRadius="full"
                            bg="white"
                        />
                        {/* Flash icon positioned on the background */}
                        <Box position="relative" zIndex={1}>
                            <FlashIcon boxSize={5} color="#0095ff" />
                        </Box>
                    </Box>

                    {/* Message */}
                    <Text
                        fontSize="xl"
                        color="white"
                        textAlign="center"
                        maxW="271px"
                        fontWeight="semibold"
                    >
                        Advert
                    </Text>

                    <Text
                        fontSize="sm"
                        color="rgba(255,255,255,0.8)"
                        textAlign="center"
                        maxW="271px"
                    >
                        Create campaign for your business and reach people
                    </Text>

                    {/* Create Campaign Button */}
                    <Button
                        onClick={handleCreateCampaign}
                        bg="white"
                        color="#0095ff"
                        size="md"
                        fontSize="sm"
                        fontWeight="semibold"
                        px={6}
                        py={2}
                        borderRadius="md"
                        _hover={{ bg: 'gray.50' }}
                    >
                        Create Campaign
                    </Button>
                </VStack>
            </Box>
        </Box>

    );
};

export default AdsEmptyState;
