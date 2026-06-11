import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';

/** Labelled key/value row used inside detail panels. */
export const Field: React.FC<{ label: string; value: React.ReactNode }> = ({
    label,
    value,
}) => (
    <HStack justify="space-between" align="start" gap={4} py={1.5}>
        <Text
            fontSize="10px"
            color="gray.500"
            textTransform="uppercase"
            letterSpacing="0.4px"
            fontWeight="semibold"
            flexShrink={0}
        >
            {label}
        </Text>
        <Box fontSize="xs" color="gray.800" textAlign="right" minW={0} wordBreak="break-word">
            {value ?? '—'}
        </Box>
    </HStack>
);

/** White detail card with a small heading — the detail page's building block. */
export const Panel: React.FC<{
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}> = ({ title, children, actions }) => (
    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={5}>
        <HStack justify="space-between" align="center" mb={3}>
            <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                {title}
            </Text>
            {actions}
        </HStack>
        {children}
    </Box>
);
