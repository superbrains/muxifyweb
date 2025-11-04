import React, { useState } from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
} from '@chakra-ui/react';
import { AnimatedTabs } from '@/shared/components/AnimatedTabs';
import { ProfileTab, VerificationTab, PaymentTab, SecurityTab } from '../components';
import { useUserManagementStore } from '@/features/auth/store/useUserManagementStore';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { ArtistDropdown } from '@/shared/components/ArtistDropdown';

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const { getCurrentUserData, getCurrentUserType } = useUserManagementStore();
    const { isRecordLabel } = useUserType();
    const userData = getCurrentUserData();
    const userType = getCurrentUserType();
    
    // Get settings title based on user type
    const getSettingsTitle = () => {
        if (!userType) return 'Settings';
        if (userType === 'artist') {
            const artistData = userData as any;
            if (artistData?.userType === 'artist') return 'Artist Settings';
            if (artistData?.userType === 'musician') return 'Musician Settings';
            if (artistData?.userType === 'creator') return 'Creator Settings';
            if (artistData?.userType === 'dj') return 'DJ Settings';
            if (artistData?.userType === 'podcaster') return 'Podcaster Settings';
            return 'Artist Settings';
        }
        if (userType === 'company') {
            const companyData = userData as any;
            if (companyData?.userType === 'record_label') return 'Record Label Settings';
            if (companyData?.userType === 'distribution') return 'Distribution Company Settings';
            if (companyData?.userType === 'publisher') return 'Music Publisher Settings';
            if (companyData?.userType === 'management') return 'Management Company Settings';
            return 'Company Settings';
        }
        if (userType === 'ad-manager') return 'Ad Manager Settings';
        return 'Settings';
    };

    const tabs = [
        { id: 'profile', label: 'Profile' },
        { id: 'verification', label: 'Verification' },
        { id: 'payment', label: 'Payment' },
        { id: 'security', label: 'Security' },
    ];


    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileTab />;
            case 'verification':
                return <VerificationTab />;
            case 'payment':
                return <PaymentTab />;
            case 'security':
                return <SecurityTab />;
            default:
                return <ProfileTab />;
        }
    };

    return (
        <Box p={4}>
            <VStack align="stretch" gap={6}>
                {/* Header */}
                <HStack justify="space-between" align="center">
                    <VStack align="start" gap={1}>
                        <Text fontSize="xl" fontWeight="bold" color="gray.900">
                            {getSettingsTitle()}
                        </Text>
                    </VStack>
                    {isRecordLabel && (
                        <ArtistDropdown />
                    )}
                </HStack>

                {/* Animated Tabs */}
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="primary.500"
                    backgroundColor="gray.100"
                    tabStyle={1}
                    size="sm"
                />

                {/* Tab Content */}
                <Box>
                    {renderTabContent()}
                </Box>
            </VStack>
        </Box>
    );
};

export default Settings;
