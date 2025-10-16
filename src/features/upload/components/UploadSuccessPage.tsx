import React from 'react';
import { Box, Button, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FiCheck } from 'react-icons/fi';

interface UploadSuccessPageProps {
    onUnderstand: () => void;
    onUploadMore: () => void;
}

export const UploadSuccessPage: React.FC<UploadSuccessPageProps> = ({
    onUnderstand,
    onUploadMore,
}) => {
    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.5)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
        >
            <Box
                bg="white"
                borderRadius="lg"
                boxShadow="xl"
                p={8}
                maxW="500px"
                w="90%"
                mx="auto"
            >
                <VStack align="center" gap={6}>
                    {/* Primary Success Message Section */}
                    <VStack align="center" gap={4}>
                        {/* Success Icon */}
                        <Box
                            w="80px"
                            h="80px"
                            bg="green.500"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            boxShadow="lg"
                        >
                            <Icon
                                as={FiCheck}
                                boxSize={10}
                                color="white"
                                strokeWidth={3}
                            />
                        </Box>

                        {/* Main Heading */}
                        <Text
                            fontSize="24px"
                            fontWeight="bold"
                            color="gray.900"
                            textAlign="center"
                            lineHeight="1.2"
                        >
                            Your media is going through a review before publishing
                        </Text>

                        {/* Sub-text */}
                        <Text
                            fontSize="16px"
                            color="gray.600"
                            textAlign="center"
                            lineHeight="1.4"
                        >
                            You will receive a notification through your email after review
                        </Text>

                        {/* I Understand Button */}
                        <Button
                            bg="red.500"
                            color="white"
                            size="lg"
                            fontSize="16px"
                            fontWeight="semibold"
                            px={8}
                            py={4}
                            h="auto"
                            borderRadius="md"
                            _hover={{ bg: 'red.600' }}
                            _active={{ bg: 'red.700' }}
                            onClick={onUnderstand}
                        >
                            I Understand
                        </Button>
                    </VStack>

                    {/* Secondary Upload More Media Section */}
                    <Box
                        w="full"
                        bg="red.50"
                        borderRadius="md"
                        p={6}
                        mt={4}
                    >
                        <HStack justify="space-between" align="center">
                            <Text
                                fontSize="18px"
                                fontWeight="semibold"
                                color="gray.900"
                            >
                                Upload more media
                            </Text>
                            <Button
                                bg="red.400"
                                color="white"
                                size="md"
                                fontSize="14px"
                                fontWeight="semibold"
                                px={6}
                                py={3}
                                h="auto"
                                borderRadius="md"
                                _hover={{ bg: 'red.500' }}
                                _active={{ bg: 'red.600' }}
                                onClick={onUploadMore}
                            >
                                Upload Now
                            </Button>
                        </HStack>
                    </Box>
                </VStack>
            </Box>
        </Box>
    );
};
