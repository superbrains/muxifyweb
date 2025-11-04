import React from 'react';
import { Box, Text, VStack, HStack } from '@chakra-ui/react';

interface FansAndSubscribersItem {
    rank: number;
    name: string;
    value: string;
    avatar: string;
    country: string;
}

interface FansAndSubscribersCardProps {
    title: string;
    data: FansAndSubscribersItem[];
}

export const FansAndSubscribersCard: React.FC<FansAndSubscribersCardProps> = ({ title, data }) => (
    <Box display="flex" flexDirection="column" gap={4} bg="white" borderRadius="lg" border="1px solid" borderColor="#FFCEBF" p={3} minH="200px">
        <Text fontSize="md" fontWeight="medium" color="gray.900" mb={4} textAlign="center">
            {title}
        </Text>
        <VStack align="stretch" gap={2}>
            {data.map((item, index) => (
                <HStack key={index} justify="space-between">
                    <HStack gap={3}>
                        <Box
                            w={7}
                            h={7}
                            borderRadius="full"
                            bg="red.100"
                            color="primary.500"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="xs"
                            fontWeight="bold"
                        >
                            {item.rank}
                        </Box>
                        <Box w={10} h={10} borderRadius="full" bg="gray.200" display="flex" alignItems="center" justifyContent="center">
                            {/* Empty circle - no emoji */}
                        </Box>
                        <VStack align="start" gap={0}>
                            <Text fontSize="xs" color="gray.800" fontWeight="medium" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" maxW="140px">
                                {item.name}
                            </Text>
                            <Text fontSize="10px" color="gray.500">
                                {item.value}
                            </Text>
                        </VStack>
                    </HStack>
                    <Text fontSize="xs" color="gray.500" textAlign="right">
                        {item.country}
                    </Text>
                </HStack>
            ))}
        </VStack>
    </Box>
);
