import React from 'react';
import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { SuccessTickIcon } from '@/shared/icons/CustomIcons';

interface UploadSuccessPageProps {
    onUnderstand: () => void;
    onUploadMore: () => void;
    actionType?: 'Media' | 'Campaign';
    successFor?: 'media' | 'Ads';
}

export const UploadSuccessPage: React.FC<UploadSuccessPageProps> = ({
    onUnderstand,
    onUploadMore,
    actionType = 'Media',
    successFor = 'media',
}) => {
    // Determine text based on context
    const getMainHeading = () => {
        if (successFor === 'Ads') {
            return 'Your ad is going through a review before publishing';
        }
        return 'Your media is going through a review before publishing';
    };

    const getButtonText = () => {
        if (actionType === 'Campaign') {
            return 'Create Campaign';
        }
        return 'Upload Now';
    };

    const getSectionTitle = () => {
        if (actionType === 'Campaign') {
            return 'Create more campaign';
        }
        return 'Upload more media';
    };
    return (
        <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="white"
            zIndex={1000}
            overflow="hidden"
        >
            {/* Full height container for centering */}
            <Box
                h="90vh"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="gray.blue.100"
                p={10}
            >
                <Box w="full" h="full" bg="white" display="flex" alignItems="center" justifyContent="center">
                    <Box
                        bg="white"
                        borderRadius="lg"
                        maxW="400px"
                        w="full"
                        border="1px solid"
                        borderColor="blue.100"
                    >
                        <VStack align="center" gap={5} p={6}>
                            {/* Primary Success Message Section */}
                            <VStack align="center" gap={6}>
                                {/* Success Icon */}
                                <SuccessTickIcon
                                    boxSize={16}
                                />

                                {/* Main Heading */}
                                <Text
                                    fontSize="15px"
                                    fontWeight="bold"
                                    color="gray.900"
                                    textAlign="center"
                                    w="85%"
                                    lineHeight="1.3"
                                >
                                    {getMainHeading()}
                                </Text>

                                {/* Sub-text */}
                                <Text
                                    fontSize="11px"
                                    color="gray.600"
                                    textAlign="center"
                                    w="75%"
                                    lineHeight="1.4"
                                >
                                    You will receive a notification through your email after review
                                </Text>

                                {/* I Understand Button */}
                                <Button
                                    bg="red.500"
                                    color="white"
                                    size="sm"
                                    fontSize="12px"
                                    fontWeight="semibold"
                                    px={6}
                                    py={3}
                                    h="auto"
                                    borderRadius="md"
                                    _hover={{ bg: 'red.600' }}
                                    _active={{ bg: 'red.700' }}
                                    onClick={onUnderstand}
                                >
                                    I Understand
                                </Button>
                            </VStack>


                        </VStack>
                        {/* Secondary Upload More Media Section */}
                        <Box
                            w="full"
                            bg="red.50"
                            borderRadius="md"
                            p={6}
                            mt={2}
                        >
                            <VStack align="start" gap={2}>
                                <Text
                                    fontSize="11px"
                                    fontWeight="semibold"
                                    color="gray.900"
                                >
                                    {getSectionTitle()}
                                </Text>
                                <Button
                                    bg="red.200"
                                    w="full"
                                    color="primary.500"
                                    size="xs"
                                    fontSize="12px"
                                    fontWeight="semibold"
                                    px={4}
                                    py={2}
                                    h="auto"
                                    borderRadius="md"
                                    _hover={{ bg: 'red.300', border: "none", outline: "none" }}
                                    _active={{ bg: 'red.400' }}
                                    onClick={onUploadMore}
                                >
                                    {getButtonText()}
                                </Button>
                            </VStack>
                        </Box>
                    </Box>
                </Box>

            </Box>
        </Box>
    );
};
