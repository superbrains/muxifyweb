import React from 'react';
import { Box, Grid, HStack, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { formatCount } from '../../../lib/format';
import type { RiskCategory } from '../../../types/platform';
import { bySeverityDesc, severityStyle } from './riskFormat';

interface RiskRegisterTableProps {
    categories: RiskCategory[];
}

/**
 * The risk register — every exposure area on one surface, ordered most-severe
 * first, each row a button that drills straight into its working queue. A left
 * severity rail and a dedicated "critical" tag let a reviewer triage the whole
 * platform's open risk in a single downward scan.
 */
export const RiskRegisterTable: React.FC<RiskRegisterTableProps> = ({ categories }) => {
    const navigate = useNavigate();
    const rows = [...categories].sort(bySeverityDesc);

    return (
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" overflow="hidden">
            <HStack justify="space-between" px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
                <VStack align="start" gap={0.5}>
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                        Risk register
                    </Text>
                    <Text fontSize="9px" color="gray.500">
                        Every open exposure area · click a row to work its queue
                    </Text>
                </VStack>
                <Text fontSize="10px" color="gray.400" fontWeight="medium">
                    {rows.length} areas
                </Text>
            </HStack>

            <VStack align="stretch" gap={0}>
                {rows.map((cat) => {
                    const sev = severityStyle(cat.severity);
                    const isClear = cat.openCount === 0;
                    return (
                        <Box
                            key={cat.key}
                            as="button"
                            textAlign="left"
                            onClick={() => navigate(cat.route)}
                            position="relative"
                            borderBottom="1px solid"
                            borderColor="gray.50"
                            transition="background 0.15s"
                            _hover={{ bg: 'gray.50' }}
                            _last={{ borderBottom: 'none' }}
                            role="group"
                        >
                            {/* Severity rail */}
                            <Box
                                position="absolute"
                                left={0}
                                top={0}
                                bottom={0}
                                w="3px"
                                bg={isClear ? 'gray.200' : sev.accent}
                            />
                            <Grid
                                templateColumns={{ base: '1fr auto', md: '1.6fr 0.7fr 0.9fr auto' }}
                                alignItems="center"
                                gap={3}
                                pl={5}
                                pr={4}
                                py={3.5}
                            >
                                {/* Area + description */}
                                <VStack align="start" gap={0.5} minW={0}>
                                    <Text fontSize="13px" fontWeight="semibold" color="gray.900">
                                        {cat.label}
                                    </Text>
                                    <Text fontSize="10px" color="gray.500" lineClamp={1}>
                                        {cat.description}
                                    </Text>
                                </VStack>

                                {/* Severity pill */}
                                <Box display={{ base: 'none', md: 'block' }}>
                                    <HStack
                                        gap={1.5}
                                        bg={isClear ? 'gray.100' : sev.bg}
                                        color={isClear ? 'gray.500' : sev.color}
                                        px={2.5}
                                        py={1}
                                        borderRadius="full"
                                        w="fit-content"
                                    >
                                        <Box boxSize="6px" borderRadius="full" bg={isClear ? 'gray.400' : sev.accent} />
                                        <Text fontSize="10px" fontWeight="semibold">
                                            {isClear ? 'Clear' : sev.label}
                                        </Text>
                                    </HStack>
                                </Box>

                                {/* Counts */}
                                <HStack gap={2} justify={{ base: 'flex-end', md: 'flex-start' }}>
                                    <VStack align={{ base: 'end', md: 'start' }} gap={0}>
                                        <Text fontSize="md" fontWeight="bold" color={isClear ? 'gray.400' : 'gray.900'} fontFamily="Poppins" lineHeight="1">
                                            {formatCount(cat.openCount)}
                                        </Text>
                                        <Text fontSize="8px" color="gray.400" textTransform="uppercase" letterSpacing="0.4px">
                                            open
                                        </Text>
                                    </VStack>
                                    {cat.criticalCount > 0 && (
                                        <Text
                                            fontSize="9px"
                                            fontWeight="bold"
                                            color={severityStyle('critical').color}
                                            bg={severityStyle('critical').bg}
                                            px={1.5}
                                            py={0.5}
                                            borderRadius="md"
                                            whiteSpace="nowrap"
                                        >
                                            {formatCount(cat.criticalCount)} critical
                                        </Text>
                                    )}
                                </HStack>

                                {/* Drill-in affordance */}
                                <HStack
                                    display={{ base: 'none', md: 'flex' }}
                                    color="gray.300"
                                    _groupHover={{ color: sev.accent }}
                                    transition="color 0.15s, transform 0.15s"
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
