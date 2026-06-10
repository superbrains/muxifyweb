import React from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { formatCount } from '../../../lib/format';
import type { GrowthFunnel } from '../../../types/platform';
import { ChartCard } from '../ChartCard';

interface ActivationFunnelProps {
    data?: GrowthFunnel;
    loading: boolean;
}

const STAGE_OPACITY = [1, 0.88, 0.76, 0.64, 0.55];

/**
 * Activation funnel for users created in the window: each stage as a
 * proportional bar with the drop-off between consecutive stages called out.
 * Stages are lifetime milestones rather than a strict sequence, so drop-offs
 * are clamped at zero.
 */
export const ActivationFunnel: React.FC<ActivationFunnelProps> = ({ data, loading }) => {
    const signedUp = data?.signedUp ?? 0;

    const stages = data
        ? [
              { label: 'Signed up', count: data.signedUp },
              { label: 'Verified email', count: data.emailVerified },
              { label: 'Completed onboarding', count: data.onboarded },
              { label: 'First play', count: data.activated },
              { label: 'First purchase', count: data.converted },
          ]
        : [];

    const pctOf = (count: number): number =>
        signedUp === 0 ? 0 : Math.min(100, (count / signedUp) * 100);

    return (
        <ChartCard
            title="Activation funnel"
            subtitle="How far the window's signups progressed"
            headline={signedUp > 0 ? formatCount(signedUp) : undefined}
            headlineCaption={signedUp > 0 ? 'Signups in window' : undefined}
            loading={loading}
            empty={signedUp === 0}
            emptyText="No signups recorded in this window yet."
            minH="280px"
        >
            <VStack align="stretch" gap={0} pt={1}>
                {stages.map((stage, i) => {
                    const pct = pctOf(stage.count);
                    const prevPct = i === 0 ? 100 : pctOf(stages[i - 1].count);
                    const drop = Math.max(0, prevPct - pct);
                    return (
                        <React.Fragment key={stage.label}>
                            {i > 0 && (
                                <HStack justify="center" h="18px">
                                    {drop > 0 ? (
                                        <Text fontSize="9px" fontWeight="medium" color="red.500">
                                            −{drop.toFixed(drop < 1 ? 1 : 0)}% drop-off
                                        </Text>
                                    ) : (
                                        <Box w="1px" h="10px" bg="gray.200" />
                                    )}
                                </HStack>
                            )}
                            <Box>
                                <HStack justify="space-between" mb={1}>
                                    <Text fontSize="10px" fontWeight="medium" color="gray.700">
                                        {stage.label}
                                    </Text>
                                    <Text fontSize="10px" color="gray.600">
                                        <Text as="span" fontWeight="semibold" color="gray.900">
                                            {formatCount(stage.count)}
                                        </Text>
                                        {' · '}
                                        {pct.toFixed(pct > 0 && pct < 1 ? 1 : 0)}%
                                    </Text>
                                </HStack>
                                <Box bg="gray.100" h="22px" borderRadius="full" overflow="hidden">
                                    <Box
                                        h="full"
                                        w={`${pct}%`}
                                        minW={stage.count > 0 ? '6px' : 0}
                                        bg="#f94444"
                                        opacity={STAGE_OPACITY[i]}
                                        borderRadius="full"
                                        transition="width 0.4s ease"
                                    />
                                </Box>
                            </Box>
                        </React.Fragment>
                    );
                })}
            </VStack>
            <Text fontSize="8px" color="gray.400" mt={3}>
                Stages are lifetime milestones, not a strict sequence — some account types skip
                steps (e.g. WhatsApp signups skip email verification).
            </Text>
        </ChartCard>
    );
};
