import React from 'react';
import { Box, Button, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

export interface HeldItemSummary {
    id: string;
    title: string;
    contentType: 'track' | 'video';
    hasActiveDispute?: boolean;
}

interface HeldContentSummaryBannerProps {
    items: HeldItemSummary[];
}

/**
 * Single banner shown above the library when ANY of the artist's uploads are held
 * for duplicate-detection review. Aggregates across tracks AND videos so the artist
 * sees the full picture in one place — the dominant "how do I get to the dispute
 * page" entry point for users who haven't seen the email or notification.
 */
export const HeldContentSummaryBanner: React.FC<HeldContentSummaryBannerProps> = ({ items }) => {
    if (!items.length) return null;

    const count = items.length;
    const undisputedCount = items.filter((i) => !i.hasActiveDispute).length;
    const single = count === 1;
    const firstItem = items[0];
    const ctaHref = `/disputes/${firstItem.contentType}/${firstItem.id}`;

    return (
        <Box
            bg="yellow.50"
            border="1px solid"
            borderColor="yellow.200"
            borderRadius="xl"
            px={{ base: 4, md: 5 }}
            py={{ base: 3.5, md: 4 }}
            mb={6}
        >
            <HStack align="flex-start" gap={3.5}>
                <Box bg="yellow.100" borderRadius="full" p={2.5} flexShrink={0}>
                    <Icon as={FiAlertTriangle} boxSize={4} color="yellow.800" />
                </Box>
                <VStack align="stretch" gap={2} flex="1" minW={0}>
                    <Text fontSize="14px" color="yellow.900" fontWeight="600">
                        {single
                            ? `1 upload is on hold pending review`
                            : `${count} uploads are on hold pending review`}
                    </Text>
                    <Text fontSize="12px" color="yellow.900" lineHeight="1.5">
                        {undisputedCount > 0
                            ? `Our duplicate-detection check flagged ${single ? 'this upload' : 'these uploads'} as a possible match. If you hold the rights, dispute the flag so a moderator can review your case.`
                            : `Your dispute${single ? ' is' : 's are'} on file — track ${single ? 'its' : 'their'} status below.`}
                    </Text>
                    {single ? (
                        <HStack>
                            <RouterLink to={ctaHref}>
                                <Button
                                    size="sm"
                                    bg="#f94444"
                                    color="white"
                                    fontSize="12px"
                                    fontWeight="600"
                                    px={4}
                                    _hover={{ bg: '#e53939' }}
                                >
                                    {firstItem.hasActiveDispute ? 'View dispute status' : 'Review & dispute'}
                                    <Icon as={FiArrowRight} ml={1.5} />
                                </Button>
                            </RouterLink>
                            <Text fontSize="12px" color="yellow.900" truncate>
                                · {firstItem.title}
                            </Text>
                        </HStack>
                    ) : (
                        <VStack align="stretch" gap={1.5}>
                            {items.slice(0, 3).map((item) => (
                                <RouterLink
                                    key={`${item.contentType}-${item.id}`}
                                    to={`/disputes/${item.contentType}/${item.id}`}
                                >
                                    <HStack
                                        bg="white"
                                        borderRadius="md"
                                        border="1px solid"
                                        borderColor="yellow.200"
                                        px={3}
                                        py={2}
                                        _hover={{ bg: 'yellow.100' }}
                                        transition="background-color 0.15s ease"
                                    >
                                        <Text fontSize="12px" color="yellow.900" fontWeight="500" flex="1" truncate>
                                            {item.title}
                                            <Text as="span" color="yellow.700" fontWeight="400" ml={1}>
                                                · {item.contentType}
                                            </Text>
                                        </Text>
                                        <Text fontSize="11px" color="yellow.800" fontWeight="600">
                                            {item.hasActiveDispute ? 'View status' : 'Dispute'}
                                        </Text>
                                        <Icon as={FiArrowRight} boxSize={3} color="yellow.800" />
                                    </HStack>
                                </RouterLink>
                            ))}
                            {count > 3 && (
                                <Text fontSize="11px" color="yellow.800" fontWeight="500">
                                    +{count - 3} more held below
                                </Text>
                            )}
                        </VStack>
                    )}
                </VStack>
            </HStack>
        </Box>
    );
};
