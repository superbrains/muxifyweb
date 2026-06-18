import React from 'react';
import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react';

interface ContributorPageShellProps {
    title: string;
    subtitle?: string;
    /** Right-aligned header actions (buttons, links). */
    actions?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * The shared scaffold for every contributor self-service page — a soft gray
 * canvas, a constrained content column and a consistent title/subtitle/action
 * header. Mirrors the established earner-dashboard layout (record label / artist)
 * so the contributor area reads as part of the same product.
 */
export const ContributorPageShell: React.FC<ContributorPageShellProps> = ({
    title,
    subtitle,
    actions,
    children,
}) => (
    <Box bg="gray.50" minH="100vh" px={{ base: 3, md: 6 }} py={{ base: 4, md: 6 }}>
        <VStack align="stretch" gap={{ base: 4, md: 5 }} maxW="1200px" mx="auto" w="full">
            <HStack justify="space-between" align="flex-start" gap={3} flexWrap="wrap">
                <VStack align="start" gap={0.5} minW={0}>
                    <Heading
                        as="h1"
                        fontSize={{ base: 'lg', md: 'xl' }}
                        fontWeight="bold"
                        color="gray.900"
                        fontFamily="Poppins"
                        lineHeight="1.2"
                    >
                        {title}
                    </Heading>
                    {subtitle && (
                        <Text fontSize="xs" color="gray.500" maxW="640px">
                            {subtitle}
                        </Text>
                    )}
                </VStack>
                {actions && (
                    <HStack gap={2} flexShrink={0}>
                        {actions}
                    </HStack>
                )}
            </HStack>

            {children}
        </VStack>
    </Box>
);
