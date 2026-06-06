import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, HStack, Flex } from '@chakra-ui/react';
import { AnimatedTabs } from '@shared/components/AnimatedTabs';
import { MusicLeaderboard, VideoLeaderboard } from '../components';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { ArtistDropdown } from '@/shared/components/ArtistDropdown';
import { FiMusic, FiVideo, FiUser, FiGlobe } from 'react-icons/fi';
import type { LeaderboardScope } from '../types';

export const Leaderboard: React.FC = () => {
    const { isPodcaster, isCreator, isRecordLabel } = useUserType();
    const [activeTab, setActiveTab] = useState<'music' | 'video'>(isCreator ? 'video' : 'music');
    const [scope, setScope] = useState<LeaderboardScope>('mine');

    const getTabs = () => {
        if (isPodcaster) {
            return [
                { id: 'audio', label: 'Audio', icon: FiMusic },
                { id: 'video', label: 'Video', icon: FiVideo },
            ];
        }
        if (isCreator) {
            return [
                { id: 'video', label: 'Video', icon: FiVideo },
            ];
        }
        return [
            { id: 'music', label: 'Music', icon: FiMusic },
            { id: 'video', label: 'Video', icon: FiVideo },
        ];
    };

    const tabs = getTabs();

    const scopeTabs = [
        { id: 'mine', label: 'Mine', icon: FiUser },
        { id: 'global', label: 'Global', icon: FiGlobe },
    ];

    useEffect(() => {
        if (isCreator && activeTab !== 'video') {
            setActiveTab('video');
        }
    }, [isCreator, activeTab]);

    return (
        <Box bg="white" minH="90vh" p={{ base: 4, md: 6 }} borderRadius="10px">
            <VStack align="stretch" gap={6}>
                {/* Header */}
                <Flex
                    justify="space-between"
                    align={{ base: 'start', md: 'center' }}
                    direction={{ base: 'column', md: 'row' }}
                    gap={4}
                >
                    <Box>
                        <Text fontSize="3xl" fontWeight="bold" color="gray.900" mb={2}>
                            Leaderboard
                        </Text>
                        <Text color="gray.600">
                            {scope === 'mine'
                                ? 'Your performance across Muxify — your top content and fans.'
                                : 'See how you rank among other artists across the platform.'}
                        </Text>
                    </Box>
                    {/* Mine / Global scope toggle */}
                    <AnimatedTabs
                        tabs={scopeTabs}
                        activeTab={scope}
                        onTabChange={(tabId) => setScope(tabId as LeaderboardScope)}
                        size="md"
                        selectedColor="primary.500"
                        backgroundColor="gray.100"
                        selectedTextColor="white"
                        textColor="gray.600"
                        selectedIconColor="white"
                        iconColor="primary.500"
                    />
                </Flex>

                {/* Main Tabs */}
                <HStack justify="space-between" align="center">
                    <Box flex={1}>
                        <AnimatedTabs
                            tabs={tabs}
                            activeTab={isPodcaster && activeTab === 'music' ? 'audio' : activeTab}
                            onTabChange={(tabId) => {
                                const actualTab = isPodcaster && tabId === 'audio' ? 'music' : tabId;
                                setActiveTab(actualTab as 'music' | 'video');
                            }}
                            size="lg"
                            backgroundColor="gray.200"
                            selectedColor="white"
                            textColor="black"
                            selectedTextColor="black"
                            tabStyle={2}
                        />
                    </Box>
                    {isRecordLabel && (
                        <Box ml={4}>
                            <ArtistDropdown />
                        </Box>
                    )}
                </HStack>

                {/* Content */}
                <Box>
                    {activeTab === 'music' ? (
                        <MusicLeaderboard scope={scope} />
                    ) : (
                        <VideoLeaderboard scope={scope} />
                    )}
                </Box>
            </VStack>
        </Box>
    );
};

export default Leaderboard;
