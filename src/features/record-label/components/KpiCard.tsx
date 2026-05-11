import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

interface KpiCardProps {
    bg: string;
    iconColor: string;
    label: string;
    value: string;
    sub?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ bg, iconColor, label, value, sub }) => (
    <Box bg={bg} p={4} borderRadius="xl">
        <VStack align="start" gap={1}>
            <Box w={2} h={2} borderRadius="full" bg={iconColor} />
            <Text fontSize="9px" color="gray.600" fontWeight="medium">
                {label}
            </Text>
            <Text fontSize="md" fontWeight="bold" color="gray.900">
                {value}
            </Text>
            {sub && (
                <Text fontSize="8px" color="gray.500">
                    {sub}
                </Text>
            )}
        </VStack>
    </Box>
);
