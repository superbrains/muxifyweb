import React from 'react';
import { Box, Button, HStack, Text } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import { FiX } from 'react-icons/fi';

export interface BulkAction {
    label: string;
    icon?: IconType;
    tone?: 'default' | 'primary' | 'danger';
    onClick: () => void;
}

interface BulkActionBarProps {
    /** Number of currently-selected rows. The bar hides when 0. */
    count: number;
    actions: BulkAction[];
    onClear: () => void;
    /** Disables every action while a bulk run is in flight. */
    busy?: boolean;
    /** Singular noun for the count label, e.g. "item". */
    noun?: string;
}

const toneProps = (tone: BulkAction['tone']) => {
    switch (tone) {
        case 'primary':
            return { bg: 'primary.500', color: 'white', _hover: { bg: 'primary.600' } };
        case 'danger':
            return { variant: 'outline' as const, borderColor: '#FECACA', color: '#C53030' };
        default:
            return { variant: 'outline' as const };
    }
};

/**
 * Sticky selection action bar shown above the pager when rows are multi-selected
 * in a {@link DataTable}. Surfaces the count + a Clear control + bulk actions.
 */
export const BulkActionBar: React.FC<BulkActionBarProps> = ({
    count,
    actions,
    onClear,
    busy = false,
    noun = 'item',
}) => {
    if (count === 0) return null;

    return (
        <Box
            position="sticky"
            bottom={3}
            zIndex={2}
            bg="white"
            borderRadius="14px"
            border="1px solid"
            borderColor="gray.200"
            shadow="md"
            px={4}
            py={2.5}
        >
            <HStack justify="space-between" gap={3} flexWrap="wrap">
                <HStack gap={2}>
                    <Box
                        bg="primary.500"
                        color="white"
                        fontSize="11px"
                        fontWeight="bold"
                        borderRadius="full"
                        minW="20px"
                        h="20px"
                        px={1.5}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        {count}
                    </Box>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                        {noun}
                        {count === 1 ? '' : 's'} selected
                    </Text>
                    <Button
                        size="2xs"
                        variant="ghost"
                        color="gray.500"
                        fontSize="11px"
                        onClick={onClear}
                        disabled={busy}
                    >
                        <FiX /> Clear
                    </Button>
                </HStack>
                <HStack gap={2} flexWrap="wrap">
                    {actions.map((a) => (
                        <Button
                            key={a.label}
                            size="sm"
                            fontSize="xs"
                            borderRadius="10px"
                            disabled={busy}
                            onClick={a.onClick}
                            {...toneProps(a.tone)}
                        >
                            {a.icon && <a.icon />} {a.label}
                        </Button>
                    ))}
                </HStack>
            </HStack>
        </Box>
    );
};
