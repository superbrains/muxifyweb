import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { MusicLeaderboard } from './MusicLeaderboard';
import { VideoLeaderboard } from './VideoLeaderboard';

export const LeaderboardDemo: React.FC = () => {
    return (
        <VStack align="stretch" gap={8} p={6}>
            <Box>
                <Text fontSize="2xl" fontWeight="bold" color="gray.900" mb={2}>
                    Leaderboard Components Demo
                </Text>
                <Text color="gray.600">
                    Testing the Music and Video leaderboard components.
                </Text>
            </Box>

            <Box>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={4}>
                    Music Leaderboard
                </Text>
                <MusicLeaderboard />
            </Box>

            <Box>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={4}>
                    Video Leaderboard
                </Text>
                <VideoLeaderboard />
            </Box>
        </VStack>
    );
};
