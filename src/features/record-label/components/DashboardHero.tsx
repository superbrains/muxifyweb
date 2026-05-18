import React, { useState } from 'react';
import { Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { FiPlus, FiSend, FiZap } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@app/store/useUserStore';
import {
    useUserManagementStore,
    type CompanyOnboardingData,
} from '@/features/auth/store/useUserManagementStore';
import { InviteArtistDialog } from './InviteArtistDialog';
import { PayoutTriggerDialog } from './PayoutTriggerDialog';
import type { VerificationStatus } from '../types';

interface DashboardHeroProps {
    verificationStatus: VerificationStatus;
}

const STATUS_PILL: Record<
    VerificationStatus,
    { label: string; bg: string; color: string; dot: string }
> = {
    Verified: { label: 'Verified label', bg: '#E7FFF7', color: '#0E8A60', dot: '#10B981' },
    Pending: { label: 'Verification pending', bg: '#FFF9E6', color: '#92660C', dot: '#F59E0B' },
    Rejected: { label: 'Verification rejected', bg: '#FFF3F3', color: '#B42318', dot: '#EF4444' },
    NotSubmitted: { label: 'Identity unverified', bg: '#F1F5F9', color: '#475569', dot: '#94A3B8' },
};

export const DashboardHero: React.FC<DashboardHeroProps> = ({ verificationStatus }) => {
    const navigate = useNavigate();
    const user = useUserStore((s) => s.user);
    const { getCurrentUserData, getCurrentUserType } = useUserManagementStore();
    const [inviteOpen, setInviteOpen] = useState(false);
    const [payoutOpen, setPayoutOpen] = useState(false);
    const pill = STATUS_PILL[verificationStatus];
    const isVerified = verificationStatus === 'Verified';

    const userData = getCurrentUserData();
    const userType = getCurrentUserType();
    const companyName =
        userData && userType === 'company'
            ? (userData as CompanyOnboardingData).companyName ||
              (userData as CompanyOnboardingData).legalCompanyName
            : undefined;
    const labelName = companyName?.trim() || user?.name?.trim() || 'your label';

    return (
        <Box
            bg="white"
            borderRadius="2xl"
            p={{ base: 4, md: 5 }}
            borderWidth="1px"
            borderColor="gray.100"
        >
            <Flex
                direction={{ base: 'column', lg: 'row' }}
                align={{ base: 'flex-start', lg: 'center' }}
                justify="space-between"
                gap={4}
            >
                <VStack align="start" gap={1} flex={1} minW={0}>
                    <HStack gap={2}>
                        <Text fontSize="sm" fontWeight="bold" color="gray.900" fontFamily="Poppins">
                            Welcome back, {labelName}
                        </Text>
                        <HStack
                            gap={1.5}
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            bg={pill.bg}
                            color={pill.color}
                        >
                            <Box w="6px" h="6px" borderRadius="full" bg={pill.dot} />
                            <Text fontSize="9px" fontWeight="semibold">
                                {pill.label}
                            </Text>
                        </HStack>
                    </HStack>
                    <Text fontSize="11px" color="gray.600">
                        Here's how your roster, releases, and revenue are moving today.
                    </Text>
                </VStack>

                <HStack gap={2} flexWrap="wrap" justify={{ base: 'flex-start', lg: 'flex-end' }}>
                    <Button
                        size="sm"
                        variant="outline"
                        borderColor="gray.200"
                        color="gray.700"
                        fontSize="xs"
                        fontWeight="medium"
                        borderRadius="lg"
                        onClick={() => setInviteOpen(true)}
                    >
                        <FiSend size={12} />
                        Invite artist
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        borderColor="gray.200"
                        color="gray.700"
                        fontSize="xs"
                        fontWeight="medium"
                        borderRadius="lg"
                        onClick={() => navigate('/label/releases')}
                    >
                        <FiPlus size={12} />
                        New release
                    </Button>
                    <Button
                        size="sm"
                        bg="primary.500"
                        color="white"
                        fontSize="xs"
                        fontWeight="semibold"
                        borderRadius="lg"
                        _hover={{ bg: 'primary.600' }}
                        disabled={!isVerified}
                        onClick={() => setPayoutOpen(true)}
                        title={isVerified ? undefined : 'Verify your label to enable payouts'}
                    >
                        <FiZap size={12} />
                        Trigger payout
                    </Button>
                </HStack>
            </Flex>

            <InviteArtistDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
            <PayoutTriggerDialog open={payoutOpen} onClose={() => setPayoutOpen(false)} />
        </Box>
    );
};
