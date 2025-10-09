import React from 'react';
import { NewPasswordForm } from '../components/NewPasswordForm';
import {
    Box,
    VStack,
} from '@chakra-ui/react';
import MuxifyLogoIcon from '@/shared/icons/CustomIcons';

interface CreateNewPasswordProps {
    email: string;
    verificationCode: string;
    onBack: () => void;
}

export const CreateNewPassword: React.FC<CreateNewPasswordProps> = ({
    email,
    verificationCode,
    onBack
}) => {
    return (
        <Box
            minH="100vh"
            w="full"
            bg="primary.100"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            px={{ base: 4, sm: 4, lg: 6 }}
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

                {/* Main Create New Password Card */}
                <Box
                    w="full"
                    maxW="370px"
                    bg="white"
                    borderRadius="20px"
                    py={6}
                    px={10}
                    pb={10}
                >
                    <VStack gap={4} align="center">
                        <NewPasswordForm
                            email={email}
                            verificationCode={verificationCode}
                            onBack={onBack}
                        />
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
};

export default CreateNewPassword;
