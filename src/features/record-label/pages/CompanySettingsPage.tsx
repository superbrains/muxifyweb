import React from 'react';
import {
    Box,
    Tabs,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useLabelSummary } from '../hooks/useLabelSummary';
import { VerificationBanner } from '../components/VerificationBanner';

const CompanySettingsPage: React.FC = () => {
    const { data: summary } = useLabelSummary();

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
                    Manage your label profile and directors
                </Text>
            </Box>

            {summary && (
                <VerificationBanner
                    status={summary.verificationStatus}
                    rejectionReason={summary.verificationRejectionReason}
                />
            )}

            <Box bg="white" borderRadius="20px" p={6}>
                <Tabs.Root defaultValue="profile" size="sm">
                    <Tabs.List borderBottom="1px solid" borderColor="gray.200" mb={4}>
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
                        <Text fontSize="xs" color="gray.500">
                            Edit your legal name, logo, and address. (Coming soon — use the
                            onboarding flow for now.)
                        </Text>
                    </Tabs.Content>
                    <Tabs.Content value="directors">
                        <Text fontSize="xs" color="gray.500">
                            Manage company directors. (Coming soon.)
                        </Text>
                    </Tabs.Content>
                    <Tabs.Content value="verification">
                        <Text fontSize="xs" color="gray.500">
                            Status: <strong>{summary?.verificationStatus ?? 'Unknown'}</strong>
                        </Text>
                    </Tabs.Content>
                </Tabs.Root>
            </Box>
        </VStack>
    );
};

export default CompanySettingsPage;
