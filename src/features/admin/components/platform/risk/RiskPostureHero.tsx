import React from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { adminRelative, formatCount } from '@shared/console/lib/format';
import type { RiskCompliance } from '../../../types/platform';
import { levelStyle } from './riskFormat';

interface RiskPostureHeroProps {
    data: RiskCompliance;
}

interface SignalChip {
    label: string;
    value: number;
    /** Highlight when non-zero. */
    hot?: boolean;
}

/**
 * The risk command-center banner — a level-driven gradient with a radial score
 * gauge and the handful of signals an on-call reviewer scans first. The whole
 * surface re-tints with the platform's posture (green → amber → orange → rose),
 * so "how bad is it right now" is legible before a single number is read.
 */
export const RiskPostureHero: React.FC<RiskPostureHeroProps> = ({ data }) => {
    const level = levelStyle(data.riskLevel);

    const gaugeOptions: ApexOptions = {
        chart: { sparkline: { enabled: true }, animations: { speed: 600 } },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                hollow: { size: '60%' },
                track: { background: level.track, strokeWidth: '100%', margin: 0 },
                dataLabels: {
                    name: {
                        show: true,
                        offsetY: 22,
                        color: 'rgba(255,255,255,0.62)',
                        fontSize: '9px',
                        fontFamily: 'Manrope, sans-serif',
                    },
                    value: {
                        show: true,
                        offsetY: -8,
                        color: '#FFFFFF',
                        fontSize: '30px',
                        fontWeight: 700,
                        fontFamily: 'Poppins, sans-serif',
                        formatter: (v: number) => `${Math.round(v)}`,
                    },
                },
            },
        },
        fill: { type: 'solid', colors: [level.accent] },
        stroke: { lineCap: 'round' },
        labels: ['Risk score'],
    };

    const chips: SignalChip[] = [
        { label: 'Critical open', value: data.criticalOpenItems, hot: data.criticalOpenItems > 0 },
        { label: 'Escalated disputes', value: data.escalatedDisputes, hot: data.escalatedDisputes > 0 },
        { label: 'High-confidence dupes', value: data.highConfidenceDuplicates, hot: data.highConfidenceDuplicates > 0 },
        { label: 'Failed payouts', value: data.failedPayouts, hot: data.failedPayouts > 0 },
    ];

    return (
        <Box
            position="relative"
            overflow="hidden"
            borderRadius="2xl"
            style={{ background: level.gradient }}
            px={{ base: 5, md: 7 }}
            py={{ base: 5, md: 6 }}
            color="white"
        >
            {/* Atmospheric depth — soft accent glow + a faint dotted texture. */}
            <Box
                position="absolute"
                top="-40%"
                right="-8%"
                boxSize="360px"
                borderRadius="full"
                style={{ background: level.accent, filter: 'blur(120px)', opacity: 0.35 }}
                pointerEvents="none"
            />
            <Box
                position="absolute"
                inset={0}
                pointerEvents="none"
                style={{
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                    opacity: 0.4,
                    maskImage: 'linear-gradient(90deg, transparent, black 60%)',
                    WebkitMaskImage: 'linear-gradient(90deg, transparent, black 60%)',
                }}
            />

            <HStack
                position="relative"
                justify="space-between"
                align={{ base: 'flex-start', md: 'center' }}
                gap={6}
                flexDir={{ base: 'column', md: 'row' }}
            >
                <VStack align="start" gap={3} flex={1} minW={0}>
                    <HStack gap={2}>
                        <Box boxSize="7px" borderRadius="full" bg={level.accent} boxShadow={`0 0 0 4px ${level.track}`} />
                        <Text fontSize="10px" fontWeight="bold" letterSpacing="1.4px" color="whiteAlpha.700">
                            PLATFORM RISK POSTURE
                        </Text>
                    </HStack>

                    <Box>
                        <Text
                            fontSize={{ base: '3xl', md: '4xl' }}
                            fontWeight="bold"
                            fontFamily="Poppins"
                            lineHeight="1.05"
                            letterSpacing="-0.5px"
                        >
                            {data.riskLevel}
                        </Text>
                        <Text fontSize="13px" color="whiteAlpha.800" mt={1} maxW="42ch">
                            {level.blurb}
                        </Text>
                    </Box>

                    <HStack gap={2.5} flexWrap="wrap" pt={1}>
                        {chips.map((c) => (
                            <HStack
                                key={c.label}
                                gap={2}
                                bg={c.hot ? 'whiteAlpha.300' : 'whiteAlpha.100'}
                                borderWidth="1px"
                                borderColor={c.hot ? 'whiteAlpha.400' : 'whiteAlpha.200'}
                                borderRadius="full"
                                px={3}
                                py={1.5}
                            >
                                <Text fontSize="15px" fontWeight="bold" fontFamily="Poppins" lineHeight="1">
                                    {formatCount(c.value)}
                                </Text>
                                <Text fontSize="10px" color="whiteAlpha.800" fontWeight="medium">
                                    {c.label}
                                </Text>
                            </HStack>
                        ))}
                    </HStack>

                    <Text fontSize="10px" color="whiteAlpha.600" pt={1}>
                        {data.totalOpenItems > 0
                            ? `${formatCount(data.totalOpenItems)} open items across ${data.categories.length} exposure areas`
                            : 'No open exposure items'}
                        {data.generatedAt ? ` · refreshed ${adminRelative(data.generatedAt)}` : ''}
                    </Text>
                </VStack>

                <Box flexShrink={0} w={{ base: '100%', md: '188px' }} display="flex" justifyContent="center">
                    <Box w="188px">
                        <ReactApexChart options={gaugeOptions} series={[data.riskScore]} type="radialBar" height={188} />
                    </Box>
                </Box>
            </HStack>
        </Box>
    );
};
