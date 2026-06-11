import React from 'react';
import { Box, Grid, HStack, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import { formatCount } from '../../../lib/format';
import type { TodayQueueItem } from '../../../types/platform';
import { AGING_COLORS, bySlaSeverityDesc, formatAge, slaStyle } from './queueFormat';

interface QueueRegisterTableProps {
    queues: TodayQueueItem[];
}

const AGING_SEGMENTS = [
    { key: 'fresh' as const, label: '< 24h' },
    { key: 'day' as const, label: '1–3 days' },
    { key: 'week' as const, label: '3–7 days' },
    { key: 'stale' as const, label: '> 7 days' },
];

/** A slim proportional bar showing how a queue's backlog is distributed by age. */
const AgingBar: React.FC<{ aging: TodayQueueItem['aging'] }> = ({ aging }) => {
    const total = aging.fresh + aging.day + aging.week + aging.stale;
    if (total === 0) {
        return (
            <Box h="6px" borderRadius="full" bg="gray.100" w="100%" />
        );
    }
    return (
        <HStack h="6px" borderRadius="full" overflow="hidden" gap={0} w="100%" bg="gray.100">
            {AGING_SEGMENTS.map((seg, i) => {
                const count = aging[seg.key];
                if (count === 0) return null;
                return (
                    <Box
                        key={seg.key}
                        h="100%"
                        flex={`${count} 0 0`}
                        bg={AGING_COLORS[i]}
                        title={`${seg.label}: ${count}`}
                    />
                );
            })}
        </HStack>
    );
};

/**
 * The queue register — every open work queue on one surface, ordered by SLA
 * urgency (breached first), each row a button drilling straight into its working
 * area. A left SLA rail, the oldest-waiting age and a per-row aging bar let an
 * operator triage the whole platform's outstanding work in a single scan.
 */
export const QueueRegisterTable: React.FC<QueueRegisterTableProps> = ({ queues }) => {
    const navigate = useNavigate();
    const rows = [...queues].sort(bySlaSeverityDesc);

    return (
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" overflow="hidden">
            <HStack justify="space-between" px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
                <VStack align="start" gap={0.5}>
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                        Queue register
                    </Text>
                    <Text fontSize="9px" color="gray.500">
                        Every open work queue, most urgent first · click a row to work it
                    </Text>
                </VStack>
                <Text fontSize="10px" color="gray.400" fontWeight="medium">
                    {rows.length} queues
                </Text>
            </HStack>

            <VStack align="stretch" gap={0}>
                {rows.map((q) => {
                    const sla = slaStyle(q.slaStatus);
                    const isClear = q.openCount === 0;
                    return (
                        <Box
                            key={q.key}
                            as="button"
                            textAlign="left"
                            onClick={() => navigate(q.route)}
                            position="relative"
                            borderBottom="1px solid"
                            borderColor="gray.50"
                            transition="background 0.15s"
                            _hover={{ bg: 'gray.50' }}
                            _last={{ borderBottom: 'none' }}
                            role="group"
                        >
                            {/* SLA rail */}
                            <Box
                                position="absolute"
                                left={0}
                                top={0}
                                bottom={0}
                                w="3px"
                                bg={isClear ? 'gray.200' : sla.accent}
                            />
                            <Grid
                                templateColumns={{
                                    base: '1fr auto',
                                    md: '1.7fr 0.8fr 1fr auto',
                                    xl: '1.7fr 0.8fr 1fr 1.2fr auto',
                                }}
                                alignItems="center"
                                gap={3}
                                pl={5}
                                pr={4}
                                py={3.5}
                            >
                                {/* Queue + description */}
                                <VStack align="start" gap={0.5} minW={0}>
                                    <Text fontSize="13px" fontWeight="semibold" color="gray.900">
                                        {q.label}
                                    </Text>
                                    <Text fontSize="10px" color="gray.500" lineClamp={1}>
                                        {q.description}
                                    </Text>
                                </VStack>

                                {/* SLA pill */}
                                <Box display={{ base: 'none', md: 'block' }}>
                                    <HStack
                                        gap={1.5}
                                        bg={sla.bg}
                                        color={sla.color}
                                        px={2.5}
                                        py={1}
                                        borderRadius="full"
                                        w="fit-content"
                                    >
                                        <Box boxSize="6px" borderRadius="full" bg={sla.accent} />
                                        <Text fontSize="10px" fontWeight="semibold">
                                            {sla.label}
                                        </Text>
                                    </HStack>
                                </Box>

                                {/* Counts: open + added today + oldest age */}
                                <HStack gap={2.5} justify={{ base: 'flex-end', md: 'flex-start' }}>
                                    <VStack align={{ base: 'end', md: 'start' }} gap={0}>
                                        <HStack gap={1.5} align="baseline">
                                            <Text
                                                fontSize="md"
                                                fontWeight="bold"
                                                color={isClear ? 'gray.400' : 'gray.900'}
                                                fontFamily="Poppins"
                                                lineHeight="1"
                                            >
                                                {formatCount(q.openCount)}
                                            </Text>
                                            {q.addedToday > 0 && (
                                                <Text
                                                    fontSize="9px"
                                                    fontWeight="bold"
                                                    color="#0F7B5C"
                                                    bg="#E7FBF3"
                                                    px={1.5}
                                                    py={0.5}
                                                    borderRadius="md"
                                                    whiteSpace="nowrap"
                                                >
                                                    +{formatCount(q.addedToday)} today
                                                </Text>
                                            )}
                                        </HStack>
                                        <HStack gap={1} color="gray.400" mt={0.5}>
                                            <FiClock size={9} />
                                            <Text fontSize="9px" textTransform="uppercase" letterSpacing="0.3px">
                                                {isClear ? 'cleared' : `oldest ${formatAge(q.oldestItemAgeHours)}`}
                                            </Text>
                                        </HStack>
                                    </VStack>
                                    {q.criticalCount > 0 && (
                                        <Text
                                            fontSize="9px"
                                            fontWeight="bold"
                                            color="#C01744"
                                            bg="#FEEEF2"
                                            px={1.5}
                                            py={0.5}
                                            borderRadius="md"
                                            whiteSpace="nowrap"
                                        >
                                            {formatCount(q.criticalCount)} critical
                                        </Text>
                                    )}
                                </HStack>

                                {/* Aging distribution bar */}
                                <Box display={{ base: 'none', xl: 'block' }} minW={0}>
                                    <AgingBar aging={q.aging} />
                                </Box>

                                {/* Drill-in affordance */}
                                <HStack
                                    display={{ base: 'none', md: 'flex' }}
                                    color="gray.300"
                                    _groupHover={{ color: sla.accent }}
                                    transition="color 0.15s"
                                    justify="flex-end"
                                >
                                    <FiArrowRight size={15} />
                                </HStack>
                            </Grid>
                        </Box>
                    );
                })}
            </VStack>
        </Box>
    );
};
