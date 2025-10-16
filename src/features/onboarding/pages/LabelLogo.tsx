import React from 'react';
import {
    Box,
    VStack,
} from '@chakra-ui/react';
import MuxifyLogoIcon from '@/shared/icons/CustomIcons';
import { ReusableImageUpload } from '../components/ReusableImageUpload';

export const LabelLogo: React.FC = () => {
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

                {/* Main Logo Upload Card */}
                <Box
                    w="full"
                    maxW="370px"
                    bg="white"
                    borderRadius="20px"
                    py={6}
                    px={10}
                    pb={10}
                >
                    <ReusableImageUpload
                        title="Label Logo"
                        subtitle="This is the identity of your company"
                        nextRoute="/onboarding/company/identity-verification"
                        uploadType="logo"
                    />
                </Box>
            </VStack>
        </Box>
    );
};

export default LabelLogo;
