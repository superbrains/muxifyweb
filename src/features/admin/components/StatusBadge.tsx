import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import type { StatusStyle } from '../lib/statusColor';

interface StatusBadgeProps {
    style: StatusStyle;
    /** Override the label baked into the style (e.g. priority pills). */
    label?: string;
}

/**
 * Rounded status pill — bg + foreground + accent dot. Shared across the admin
 * console so verification / account / ticket / moderation statuses render
 * identically. Mirrors the record-label payout-status pill.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ style, label }) => (
    <HStack
        gap={1.5}
        bg={style.bg}
        color={style.color}
        fontSize="10px"
        fontWeight="semibold"
        px={2.5}
        py={1}
        borderRadius="full"
        display="inline-flex"
        w="fit-content"
    >
        <Box boxSize="6px" borderRadius="full" bg={style.dot} />
        <Text>{label ?? style.label}</Text>
    </HStack>
);
