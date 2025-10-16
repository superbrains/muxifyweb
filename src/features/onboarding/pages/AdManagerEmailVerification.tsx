import React from 'react';
import {
    Box,
    VStack,
} from '@chakra-ui/react';
import MuxifyLogoIcon from '@/shared/icons/CustomIcons';
import { ReusableEmailVerification } from '../components/ReusableEmailVerification';

export const AdManagerEmailVerification: React.FC = () => {
    return (
        <Box
            minH="100vh"
            w="full"
            bg="primary.100"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            px={{ base: 4, sm: 4, lg: 6 }}
            py={6}
        >
            <VStack gap={6} w="full" maxW="370px" mx="auto">
                {/* Header with Logo */}
                <Box h="60px" w="150px" display="flex" justifyContent="center" alignItems="center">
                    <MuxifyLogoIcon
                        color="primary.500"
                        h="full"
                        w="full"
                    />
                </Box>

                {/* Main Verification Card */}
                <Box
                    w="full"
                    maxW="370px"
                    bg="white"
                    borderRadius="20px"
                    py={6}
                    px={10}
                    pb={10}
                >
                    <ReusableEmailVerification
                        title="Verify Email Address"
                        nextRoute="/onboarding/ad-manager/complete-information"
                    />
                </Box>
            </VStack>
        </Box>
    );
};

export default AdManagerEmailVerification;
