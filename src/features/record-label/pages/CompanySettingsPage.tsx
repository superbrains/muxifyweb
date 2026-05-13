import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Spinner, Tabs, Text, VStack } from '@chakra-ui/react';
import { useLabelSettings } from '../hooks/useLabelSettings';
import { VerificationBanner } from '../components/VerificationBanner';
import { ProfileSettingsForm } from '../components/settings/ProfileSettingsForm';
import { DirectorsSettings } from '../components/settings/DirectorsSettings';
import { VerificationSettings } from '../components/settings/VerificationSettings';

type TabValue = 'profile' | 'directors' | 'verification';

const ALLOWED_TABS: readonly TabValue[] = ['profile', 'directors', 'verification'];

const tabFromHash = (): TabValue => {
    if (typeof window === 'undefined') return 'profile';
    const hash = window.location.hash.replace('#', '') as TabValue;
    return ALLOWED_TABS.includes(hash) ? hash : 'profile';
};

const CompanySettingsPage: React.FC = () => {
    const { data: settings, isLoading, isError, refetch } = useLabelSettings();
    const [tab, setTab] = useState<TabValue>(tabFromHash());

    useEffect(() => {
        const onHashChange = () => setTab(tabFromHash());
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    const handleTabChange = (value: string) => {
        const next = value as TabValue;
        setTab(next);
        if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `#${next}`);
        }
    };

    const banner = useMemo(() => {
        if (!settings) return null;
        return (
            <VerificationBanner
                status={settings.verificationStatus}
                rejectionReason={settings.verificationRejectionReason}
            />
        );
    }, [settings]);

    return (
        <VStack
            gap={{ base: 2, lg: 6 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                    Settings
                </Text>
                <Text fontSize="11px" color="gray.600">
                    Manage your label profile, directors, and verification.
                </Text>
            </Box>

            {banner}

            <Box bg="white" borderRadius="20px" p={{ base: 4, md: 6 }}>
                {isLoading && (
                    <Box py={20} display="flex" justifyContent="center">
                        <Spinner color="primary.500" />
                    </Box>
                )}

                {isError && (
                    <Box py={12} textAlign="center">
                        <Text fontSize="sm" color="red.600" mb={3}>
                            Could not load settings.
                        </Text>
                        <Button
                            size="sm"
                            fontSize="xs"
                            bg="primary.500"
                            color="white"
                            _hover={{ bg: 'primary.600' }}
                            onClick={() => refetch()}
                        >
                            Retry
                        </Button>
                    </Box>
                )}

                {settings && (
                    <Tabs.Root
                        value={tab}
                        onValueChange={(e) => handleTabChange(e.value)}
                        size="sm"
                    >
                        <Tabs.List borderBottom="1px solid" borderColor="gray.200" mb={5}>
                            <Tabs.Trigger value="profile" fontSize="xs">
                                Profile
                            </Tabs.Trigger>
                            <Tabs.Trigger value="directors" fontSize="xs">
                                Directors
                            </Tabs.Trigger>
                            <Tabs.Trigger value="verification" fontSize="xs">
                                Verification
                            </Tabs.Trigger>
                        </Tabs.List>

                        <Tabs.Content value="profile">
                            <ProfileSettingsForm settings={settings} />
                        </Tabs.Content>
                        <Tabs.Content value="directors">
                            <DirectorsSettings directors={settings.directors} />
                        </Tabs.Content>
                        <Tabs.Content value="verification">
                            <VerificationSettings settings={settings} />
                        </Tabs.Content>
                    </Tabs.Root>
                )}
            </Box>
        </VStack>
    );
};

export default CompanySettingsPage;
