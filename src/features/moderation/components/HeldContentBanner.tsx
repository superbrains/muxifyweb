import React from 'react';
import { Box, Button, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

interface HeldContentBannerProps {
    contentType: 'track' | 'video';
    contentId: string;
    /** Set when the artist has already submitted a dispute on this content. */
    hasDispute?: boolean;
}

/**
 * Yellow "on hold for review" banner shown above held content. Single CTA points
 * at the dedicated /disputes/:type/:id page; copy adapts to whether a dispute has
 * already been submitted.
 */
export const HeldContentBanner: React.FC<HeldContentBannerProps> = ({
    contentType,
    contentId,
    hasDispute,
}) => {
    const disputeHref = `/disputes/${contentType}/${contentId}`;
    return (
        <Box
            bg="yellow.50"
            border="1px solid"
            borderColor="yellow.200"
            borderRadius="lg"
            px={{ base: 4, md: 5 }}
            py={{ base: 3.5, md: 4 }}
        >
            <HStack align="flex-start" gap={3.5}>
                <Box bg="yellow.100" borderRadius="full" p={2.5} flexShrink={0}>
                    <Icon as={FiAlertTriangle} boxSize={4} color="yellow.800" />
                </Box>
                <VStack align="stretch" gap={2} flex="1" minW={0}>
                    <Text fontSize="13px" color="yellow.900" fontWeight="600">
                        This {contentType} is on hold pending a duplicate-content review.
                    </Text>
                    <Text fontSize="12px" color="yellow.900" lineHeight="1.5">
                        Our automated check flagged it as a possible duplicate, so it won't be
                        published until a moderator reviews it.
                        {hasDispute
                            ? ' Your dispute is on file — review the status anytime.'
                            : ' If you hold the rights to this material, you can dispute the flag.'}
                    </Text>
                    <HStack>
                        <RouterLink to={disputeHref}>
                            <Button
                                size="sm"
                                bg="#f94444"
                                color="white"
                                fontSize="12px"
                                fontWeight="600"
                                px={4}
                                _hover={{ bg: '#e53939' }}
                            >
                                {hasDispute ? 'View dispute status' : 'Review & dispute'}
                                <Icon as={FiArrowRight} ml={1.5} />
                            </Button>
                        </RouterLink>
                    </HStack>
                </VStack>
            </HStack>
        </Box>
    );
};
