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
import type { ArtistOnboardingData, CompanyOnboardingData } from '@/features/auth/store/useUserManagementStore';

const isArtistData = (data: unknown): data is ArtistOnboardingData =>
    !!data && typeof (data as ArtistOnboardingData).userType === 'string';

const isCompanyData = (data: unknown): data is CompanyOnboardingData =>
    !!data && typeof (data as CompanyOnboardingData).userType === 'string';

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const { getCurrentUserData, getCurrentUserType } = useUserManagementStore();
    const { isRecordLabel } = useUserType();
    const userData = getCurrentUserData();
    const userType = getCurrentUserType();
    
    // Get settings title based on user type
    const getSettingsTitle = () => {
        if (!userType) return 'Settings';
        if (userType === 'artist' && isArtistData(userData)) {
            switch (userData.userType) {
                case 'artist':
                    return 'Artist Settings';
                case 'musician':
                    return 'Musician Settings';
                case 'creator':
                    return 'Creator Settings';
                case 'dj':
                    return 'DJ Settings';
                case 'podcaster':
                    return 'Podcaster Settings';
                default:
                    return 'Artist Settings';
            }
        }
        if (userType === 'company' && isCompanyData(userData)) {
            switch (userData.userType) {
                case 'record_label':
                    return 'Record Label Settings';
                case 'distribution':
                    return 'Distribution Company Settings';
                case 'publisher':
                    return 'Music Publisher Settings';
                case 'management':
                    return 'Management Company Settings';
                default:
                    return 'Company Settings';
            }
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
