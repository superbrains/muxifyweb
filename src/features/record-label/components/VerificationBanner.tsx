import React from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import type { VerificationStatus } from '../types';

interface VerificationBannerProps {
    status: VerificationStatus;
    rejectionReason?: string;
}

interface BannerStyle {
    bg: string;
    color: string;
    title: string;
    body: string;
    cta?: { label: string; to: string };
}

const styleFor = (
    status: VerificationStatus,
    rejectionReason?: string,
): BannerStyle | null => {
    switch (status) {
        case 'Verified':
            return null;
        case 'NotSubmitted':
            return {
                bg: '#FFF5F3',
                color: 'primary.700',
                title: 'Finish identity verification',
                body: 'Upload your business document to unlock payouts and roster invites.',
                cta: { label: 'Verify now', to: '/onboarding/company/identity-verification' },
            };
        case 'Pending':
            return {
                bg: '#FFF9E6',
                color: '#92660C',
                title: 'Verification in review',
                body: 'Your documents are with our team. Expect a response within 2 business days.',
            };
        case 'Rejected':
            return {
                bg: '#FFF3F3',
                color: 'primary.700',
                title: 'Verification needs another look',
                body:
                    rejectionReason ||
                    'Your documents could not be approved. Please resubmit a clearer copy.',
                cta: { label: 'Resubmit documents', to: '/onboarding/company/identity-verification' },
            };
        default:
            return null;
    }
};

export const VerificationBanner: React.FC<VerificationBannerProps> = ({
    status,
    rejectionReason,
}) => {
    const navigate = useNavigate();
    const style = styleFor(status, rejectionReason);
    if (!style) return null;

    return (
        <Box bg={style.bg} borderRadius="12px" p={4} mb={2}>
            <HStack justify="space-between" align="center" gap={4}>
                <VStack align="start" gap={0.5} flex={1}>
                    <Text fontSize="sm" fontWeight="semibold" color={style.color}>
                        {style.title}
                    </Text>
                    <Text fontSize="xs" color={style.color} opacity={0.85}>
                        {style.body}
                    </Text>
                </VStack>
                {style.cta && (
                    <Button
                        onClick={() => navigate(style.cta!.to)}
                        size="sm"
                        bg="white"
                        color={style.color}
                        fontSize="xs"
                        fontWeight="medium"
                        borderRadius="8px"
                        flexShrink={0}
                        _hover={{ bg: 'gray.50' }}
                    >
                        {style.cta.label}
                    </Button>
                )}
            </HStack>
        </Box>
    );
};
