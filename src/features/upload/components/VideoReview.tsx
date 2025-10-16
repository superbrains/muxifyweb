import React from 'react';
import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { FiArrowRight } from 'react-icons/fi';

interface VideoReviewProps {
    onPublish: () => void;
}

export const VideoReview: React.FC<VideoReviewProps> = ({ onPublish }) => {
    return (
        <>
            {/* Publish Button */}
            <Flex justify="flex-end" align="center" mb={{ base: 5, md: 7 }}>
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
                    onClick={onPublish}
                >
                    Publish
                    <Icon as={FiArrowRight} boxSize={4} ml={2} />
                </Button>
            </Flex>

            {/* Content */}
            <Box p={6}>
                <Text fontSize="24px" fontWeight="bold" color="gray.900">
                    Video Review
                </Text>
                <Text fontSize="14px" color="gray.600" mt={2}>
                    Video review UI will be implemented here
                </Text>
            </Box>
        </>
    );
};

