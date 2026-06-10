import React from 'react';
import { Box, Grid, Text, VStack } from '@chakra-ui/react';
import type { GrowthRetention } from '../../../types/platform';
import { ChartCard } from '../ChartCard';
import { formatBucket } from '../chartFormat';

interface RetentionHeatmapProps {
    data?: GrowthRetention;
    loading: boolean;
}

/**
 * Weekly signup-cohort retention matrix as a custom CSS grid (Apex's heatmap
 * can't mask unreached weeks or render in-cell percentages cleanly). Cell
 * intensity ramps the brand red with the retention percentage; unreached
 * weeks render as muted placeholders.
 */
export const RetentionHeatmap: React.FC<RetentionHeatmapProps> = ({ data, loading }) => {
    const cohorts = data?.cohorts ?? [];
    const weeks = data?.weeks ?? 8;
    const hasData = cohorts.some((c) => c.cohortSize > 0);

    return (
        <ChartCard
            title="Weekly retention"
            subtitle="% of each signup cohort listening again in the weeks after joining"
            loading={loading}
            empty={!hasData}
            emptyText="No signup cohorts in range yet."
            minH="280px"
        >
            <Box overflowX="auto">
                <Grid
                    templateColumns={`minmax(110px, 140px) repeat(${weeks}, minmax(34px, 1fr))`}
                    gap="3px"
                    minW={`${110 + weeks * 38}px`}
                >
                    <Box />
                    {Array.from({ length: weeks }, (_, k) => (
                        <Text
                            key={`h-${k}`}
                            fontSize="9px"
                            fontWeight="semibold"
                            color="gray.500"
                            textAlign="center"
                            pb={1}
                        >
                            W{k}
                        </Text>
                    ))}

                    {cohorts.map((cohort) => (
                        <React.Fragment key={cohort.cohortStart}>
                            <VStack align="start" gap={0} justify="center" pr={2} minW={0}>
                                <Text fontSize="10px" fontWeight="medium" color="gray.700">
                                    {formatBucket(cohort.cohortStart, 'day')}
                                </Text>
                                <Text fontSize="8px" color="gray.500">
                                    {cohort.cohortSize.toLocaleString()} users
                                </Text>
                            </VStack>
                            {Array.from({ length: weeks }, (_, k) => {
                                const pct = cohort.cells[k];
                                if (pct === null || pct === undefined) {
                                    return (
                                        <Box
                                            key={`${cohort.cohortStart}-${k}`}
                                            h="30px"
                                            borderRadius="md"
                                            bg="gray.50"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Text fontSize="9px" color="gray.300">
                                                ·
                                            </Text>
                                        </Box>
                                    );
                                }
                                const alpha = 0.05 + 0.85 * (Math.min(pct, 100) / 100);
                                return (
                                    <Box
                                        key={`${cohort.cohortStart}-${k}`}
                                        h="30px"
                                        borderRadius="md"
                                        bg={`rgba(249, 68, 68, ${alpha.toFixed(3)})`}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        title={`Week of ${formatBucket(cohort.cohortStart, 'day')} · W${k} · ${pct.toFixed(1)}%`}
                                    >
                                        <Text
                                            fontSize="9px"
                                            fontWeight="semibold"
                                            color={alpha > 0.5 ? 'white' : 'gray.700'}
                                        >
                                            {pct.toFixed(0)}%
                                        </Text>
                                    </Box>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </Grid>
            </Box>
            <Text fontSize="8px" color="gray.400" mt={2}>
                W0 = signup week. The current week is partial; unreached weeks show as dots.
            </Text>
        </ChartCard>
    );
};
