import React from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';

interface AdminPageHeaderProps {
    title: string;
    subtitle?: React.ReactNode;
    /** Right-aligned action(s), e.g. a button. */
    action?: React.ReactNode;
}

/**
 * Standard admin page header — title + optional subtitle on the left, optional
 * action on the right. Matches the `HStack justify="space-between"` header used
 * across the record-label pages.
 */
export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
    title,
    subtitle,
    action,
}) => (
    <HStack justify="space-between" align="center" gap={3} flexWrap="wrap">
        <Box>
            <Text
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                fontFamily="Poppins"
            >
                {title}
            </Text>
            {subtitle && (
                <Text fontSize="11px" color="gray.600" mt={0.5}>
                    {subtitle}
                </Text>
            )}
        </Box>
        {action && <VStack align="end">{action}</VStack>}
    </HStack>
);
