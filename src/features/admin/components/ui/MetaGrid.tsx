import React from 'react';
import { Box, SimpleGrid, Text, VStack } from '@chakra-ui/react';

export interface MetaField {
    label: string;
    value?: React.ReactNode;
    /** Hide row when value is falsy (default: true). */
    hideWhenEmpty?: boolean;
}

interface MetaGridProps {
    fields: MetaField[];
    columns?: number;
}

const MetaEntry: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <VStack align="start" gap={0.5}>
        <Text
            fontSize="10px"
            fontWeight="600"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="0.5px"
        >
            {label}
        </Text>
        <Box fontSize="xs" color="gray.800">
            {value}
        </Box>
    </VStack>
);

/**
 * Responsive label/value metadata grid for content detail Overview tabs.
 * Fields with falsy values are hidden by default.
 */
export const MetaGrid: React.FC<MetaGridProps> = ({ fields, columns = 2 }) => {
    const visible = fields.filter((f) => f.hideWhenEmpty === false || Boolean(f.value));

    if (visible.length === 0) return null;

    return (
        <SimpleGrid columns={columns} gap={4}>
            {visible.map((f) => (
                <MetaEntry key={f.label} label={f.label} value={f.value} />
            ))}
        </SimpleGrid>
    );
};
