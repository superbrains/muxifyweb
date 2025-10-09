import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import {
    MusicDashboardIcon,
    ArtistIcon,
    ChartSquareIcon
} from '@/shared/icons/CustomIcons';

export const IconDemo: React.FC = () => {
    return (
        <Box p={4}>
            <VStack gap={4}>
                <Text fontSize="lg" fontWeight="bold">Custom Icons with currentColor</Text>

                <VStack gap={2}>
                    <Text>Music Dashboard Icon (Artist, Creators & DJs)</Text>
                    <VStack gap={2}>
                        <MusicDashboardIcon boxSize={8} color="red.500" />
                        <MusicDashboardIcon boxSize={8} color="blue.500" />
                        <MusicDashboardIcon boxSize={8} color="green.500" />
                    </VStack>
                </VStack>

                <VStack gap={2}>
                    <Text>Artist Icon (Recording & Distribution Company)</Text>
                    <VStack gap={2}>
                        <ArtistIcon boxSize={8} color="purple.500" />
                        <ArtistIcon boxSize={8} color="orange.500" />
                        <ArtistIcon boxSize={8} color="teal.500" />
                    </VStack>
                </VStack>

                <VStack gap={2}>
                    <Text>Chart Square Icon (Ad Manager)</Text>
                    <VStack gap={2}>
                        <ChartSquareIcon boxSize={8} color="pink.500" />
                        <ChartSquareIcon boxSize={8} color="cyan.500" />
                        <ChartSquareIcon boxSize={8} color="yellow.500" />
                    </VStack>
                </VStack>
            </VStack>
        </Box>
    );
};
