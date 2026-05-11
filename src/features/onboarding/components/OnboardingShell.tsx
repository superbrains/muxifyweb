import React from 'react';
import { Box, HStack, VStack } from '@chakra-ui/react';
import MuxifyLogoIcon from '@/shared/icons/CustomIcons';

interface OnboardingShellProps {
    children: React.ReactNode;
    currentStep?: number;
    totalSteps?: number;
}

export const OnboardingShell: React.FC<OnboardingShellProps> = ({
    children,
    currentStep,
    totalSteps,
}) => {
    const showProgress =
        typeof currentStep === 'number' &&
        typeof totalSteps === 'number' &&
        totalSteps > 0;

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
                <Box
                    h="60px"
                    w="150px"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                >
                    <MuxifyLogoIcon color="primary.500" h="full" w="full" />
                </Box>

                <Box
                    w="full"
                    maxW="370px"
                    bg="white"
                    borderRadius="20px"
                    py={6}
                    px={10}
                    pb={10}
                >
                    {showProgress && (
                        <HStack gap={1} mb={4} justify="center">
                            {Array.from({ length: totalSteps! }).map((_, idx) => {
                                const isActive = idx + 1 === currentStep;
                                return (
                                    <Box
                                        key={idx}
                                        h="6px"
                                        w={isActive ? '20px' : '6px'}
                                        bg={isActive ? 'primary.500' : 'primary.200'}
                                        borderRadius="full"
                                        transition="all 0.2s ease"
                                    />
                                );
                            })}
                        </HStack>
                    )}
                    {children}
                </Box>
            </VStack>
        </Box>
    );
};

export default OnboardingShell;
