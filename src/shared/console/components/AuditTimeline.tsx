import React from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { adminDateTime } from '../lib/format';
import { CopyableId } from './CopyableId';

export interface AuditEntry {
    id: string;
    /** Headline, e.g. "Withdrawal approved". */
    action: string;
    actor?: string;
    timestamp?: string | null;
    /** Optional longer description / reason. */
    detail?: string;
    /** Optional target label, e.g. the affected user or entity. */
    target?: string;
    /** Optional id of the affected entity — rendered as a copyable mono value. */
    targetId?: string | null;
    /** Toast label for the copied id (defaults to "ID"). */
    idLabel?: string;
    tone?: 'default' | 'success' | 'warning' | 'danger';
}

const DOT: Record<NonNullable<AuditEntry['tone']>, string> = {
    default: '#94A3B8',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#E53E3E',
};

interface AuditTimelineProps {
    entries: AuditEntry[];
    emptyText?: string;
}

/**
 * Reusable vertical activity/audit timeline. Used by detail drawers, the audit
 * trail tower and per-entity history tabs so every "what happened" view reads
 * identically.
 */
export const AuditTimeline: React.FC<AuditTimelineProps> = ({
    entries,
    emptyText = 'No activity recorded yet.',
}) => {
    if (entries.length === 0) {
        return (
            <Text fontSize="xs" color="gray.400" py={2}>
                {emptyText}
            </Text>
        );
    }

    return (
        <VStack align="stretch" gap={0}>
            {entries.map((entry, i) => {
                const isLast = i === entries.length - 1;
                return (
                    <HStack key={entry.id} align="stretch" gap={3}>
                        <VStack gap={0} align="center" minW="14px">
                            <Box
                                boxSize="10px"
                                borderRadius="full"
                                bg={DOT[entry.tone ?? 'default']}
                                mt={1}
                                flexShrink={0}
                            />
                            {!isLast && <Box w="2px" flex="1" bg="gray.100" my={1} />}
                        </VStack>
                        <Box pb={isLast ? 0 : 4} minW={0}>
                            <HStack gap={2} flexWrap="wrap">
                                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                                    {entry.action}
                                </Text>
                                {entry.target && (
                                    <Text fontSize="11px" color="gray.500">
                                        · {entry.target}
                                    </Text>
                                )}
                            </HStack>
                            {entry.detail && (
                                <Text fontSize="11px" color="gray.600" mt={0.5}>
                                    {entry.detail}
                                </Text>
                            )}
                            {entry.targetId && (
                                <Box mt={1}>
                                    <CopyableId
                                        value={entry.targetId}
                                        label={entry.idLabel ?? 'ID'}
                                        truncate={18}
                                        fontSize="10px"
                                    />
                                </Box>
                            )}
                            <Text fontSize="10px" color="gray.400" mt={0.5}>
                                {entry.actor ? `${entry.actor} · ` : ''}
                                {adminDateTime(entry.timestamp)}
                            </Text>
                        </Box>
                    </HStack>
                );
            })}
        </VStack>
    );
};
