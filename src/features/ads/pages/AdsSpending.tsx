import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Flex,
    Grid,
    Icon,
    Skeleton,
} from '@chakra-ui/react';
import { AnimatedTabs } from '@shared/components';
import Chart from 'react-apexcharts';
import { adsService } from '../services/adsService';
import { formatNaira } from '@/shared/lib';
import { ClickFilledIcon, EyeFilledIcon, GalleryIcon, MusicFilledIcon, VideoPlayIcon } from '@/shared/icons/CustomIcons';
import type { AdSpendingSeriesDto } from '../types';

type Grouping = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const AdsSpending: React.FC = () => {
    const [grouping, setGrouping] = useState<Grouping>('daily');
    const [data, setData] = useState<AdSpendingSeriesDto | null>(null);
    const [loading, setLoading] = useState(true);

    // The grouping tabs drive the query.
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        adsService
            .getSpending(grouping)
            .then((res) => {
                if (!cancelled) setData(res);
            })
            .catch(() => {
                if (!cancelled) setData(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [grouping]);

    const buckets = useMemo(() => data?.buckets ?? [], [data]);

    const photoTotal = buckets.reduce((s, b) => s + b.photoMinor, 0);
    const videoTotal = buckets.reduce((s, b) => s + b.videoMinor, 0);
    const audioTotal = buckets.reduce((s, b) => s + b.audioMinor, 0);
    const totalSpend = (data?.totalSpendMinor ?? 0) / 100;
    const avgSpend = buckets.length > 0 ? totalSpend / buckets.length : 0;

    const totalClicks = data?.totalClicks ?? 0;
    const totalViews = data?.totalImpressions ?? 0;
    const clicksCost = (data?.clicksCostMinor ?? 0) / 100;
    const viewsCost = (data?.impressionsCostMinor ?? 0) / 100;
    const totalActions = clicksCost + viewsCost;

    const spendingChartOptions = {
        chart: { type: 'bar' as const, height: 350, toolbar: { show: false }, fontFamily: 'Manrope, sans-serif', stacked: true },
        colors: ['#f94444', '#f97316', '#ffa800'],
        dataLabels: { enabled: false },
        plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 2 } },
        xaxis: {
            categories: buckets.map((b) => b.label),
            labels: { style: { fontSize: '11px', fontFamily: 'Manrope, sans-serif', colors: '#7b91b0' } },
        },
        yaxis: {
            labels: {
                style: { fontSize: '11px', fontFamily: 'Manrope, sans-serif', colors: '#7b91b0' },
                formatter: (value: number) => (value >= 1000 ? value / 1000 + 'k' : Math.round(value).toString()),
            },
        },
        legend: { position: 'bottom' as const, horizontalAlign: 'center' as const, fontSize: '12px', fontFamily: 'Manrope, sans-serif' },
        grid: { show: true, strokeDashArray: 3 },
    };

    const spendingChartSeries = [
        { name: 'Photo Ads', data: buckets.map((b) => b.photoMinor / 100) },
        { name: 'Video Ads', data: buckets.map((b) => b.videoMinor / 100) },
        { name: 'Audio Ads', data: buckets.map((b) => b.audioMinor / 100) },
    ];

    const distTotal = photoTotal + videoTotal + audioTotal;
    const distributionChartOptions = {
        chart: { type: 'pie' as const, height: 350, toolbar: { show: false }, fontFamily: 'Manrope, sans-serif' },
        colors: ['#f94444', '#f97316', '#ffa800'],
        labels: ['Photo Ads', 'Video Ads', 'Audio Ads'],
        legend: { position: 'bottom' as const, horizontalAlign: 'center' as const, fontSize: '12px', fontFamily: 'Manrope, sans-serif' },
        dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(1)}%`, style: { fontSize: '11px', fontFamily: 'Manrope, sans-serif' } },
    };
    const distributionChartSeries = [photoTotal, videoTotal, audioTotal];

    const timeTabs = [
        { id: 'daily', label: 'Daily' },
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' },
        { id: 'yearly', label: 'Yearly' },
    ];

    const hasData = !loading && buckets.length > 0;

    return (
        <Box bg="gray.50" minH="100vh" p={6}>
            <VStack align="stretch" gap={6}>
                {/* Top Section - Tabs and Metrics */}
                <Box bg="white" p={6} borderRadius="xl">
                    <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={4}>
                        <AnimatedTabs
                            tabs={timeTabs}
                            activeTab={grouping}
                            onTabChange={(tab) => setGrouping(tab as Grouping)}
                            size="sm"
                            backgroundColor="gray.100"
                            selectedColor="primary.500"
                            textColor="black"
                            selectedTextColor="white"
                            tabStyle={1}
                        />

                        <HStack gap={6}>
                            <VStack align="end" gap={1}>
                                {loading ? (
                                    <Skeleton height="24px" width="100px" />
                                ) : (
                                    <Text fontSize="lg" color="primary.500" fontWeight="bold">
                                        {formatNaira(avgSpend, { compact: false })}
                                    </Text>
                                )}
                                <Text fontSize="xs" color="gray.900">
                                    Avg / {grouping === 'daily' ? 'day' : grouping === 'weekly' ? 'week' : grouping === 'monthly' ? 'month' : 'year'}
                                </Text>
                            </VStack>
                            <VStack align="end" gap={1}>
                                {loading ? (
                                    <Skeleton height="24px" width="120px" />
                                ) : (
                                    <Text fontSize="lg" color="primary.500" fontWeight="bold">
                                        {formatNaira(totalSpend, { compact: false })}
                                    </Text>
                                )}
                                <Text fontSize="xs" color="gray.900">
                                    Total Expenditure
                                </Text>
                            </VStack>
                        </HStack>
                    </Flex>
                </Box>

                {/* Charts Section */}
                <Grid templateColumns={{ base: '1fr', lg: '1.5fr 1fr' }} gap={6}>
                    <Box bg="white" p={6} borderRadius="xl">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                            Advert Spending
                        </Text>
                        {loading ? (
                            <Skeleton height="300px" borderRadius="md" />
                        ) : hasData ? (
                            <Chart options={spendingChartOptions} series={spendingChartSeries} type="bar" width="100%" height={300} />
                        ) : (
                            <EmptyChart label="No spending in this period yet" />
                        )}
                    </Box>

                    <Box bg="white" p={6} borderRadius="xl">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                            Distribution
                        </Text>
                        {loading ? (
                            <Skeleton height="300px" borderRadius="md" />
                        ) : distTotal > 0 ? (
                            <Chart options={distributionChartOptions} series={distributionChartSeries} type="pie" width="100%" height={300} />
                        ) : (
                            <EmptyChart label="No spend to distribute yet" />
                        )}
                    </Box>
                </Grid>

                {/* Bottom Section - Spending Allocation and Actions */}
                <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={5}>
                    {/* Spending Allocation */}
                    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" p={5}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={3}>
                            Spending Allocation
                        </Text>
                        <HStack gap={3} justify="space-between" align="stretch">
                            <AllocationItem icon={GalleryIcon} label="Photo Ad" amount={photoTotal / 100} />
                            <Box h="18" w="1px" bg="gray.200" alignSelf="center" />
                            <AllocationItem icon={VideoPlayIcon} label="Video Ad" amount={videoTotal / 100} />
                            <Box h="18" w="1px" bg="gray.200" alignSelf="center" />
                            <AllocationItem icon={MusicFilledIcon} label="Audio Ad" amount={audioTotal / 100} />
                        </HStack>
                    </Box>

                    {/* Spending Actions */}
                    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" p={5}>
                        <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                                Spending Actions
                            </Text>
                            <Text fontSize="xs" fontWeight="semibold" color="primary.500">
                                {formatNaira(totalActions, { compact: false })}
                            </Text>
                        </Flex>
                        <HStack gap={3} justify="space-between" align="stretch">
                            <ActionItem icon={ClickFilledIcon} label="Clicks" count={totalClicks} cost={clicksCost} />
                            <Box h="20" w="1px" bg="gray.200" alignSelf="center" />
                            <ActionItem icon={EyeFilledIcon} label="Impressions" count={totalViews} cost={viewsCost} />
                        </HStack>
                    </Box>
                </Grid>
            </VStack>
        </Box>
    );
};

const EmptyChart: React.FC<{ label: string }> = ({ label }) => (
    <Flex h="300px" align="center" justify="center" direction="column" gap={2}>
        <Text fontSize="sm" color="gray.500">
            {label}
        </Text>
    </Flex>
);

const AllocationItem: React.FC<{ icon: React.ElementType; label: string; amount: number }> = ({ icon, label, amount }) => (
    <VStack align="center" gap={2} flex="1">
        <Box w={10} h={10} borderRadius="md" border="1px solid" borderColor="primary.500" display="flex" alignItems="center" justifyContent="center">
            <Icon as={icon} boxSize={5} color="primary.500" />
        </Box>
        <Text fontSize="xs" color="gray.600">
            {label}
        </Text>
        <Text fontSize="sm" fontWeight="bold" color="primary.500">
            {formatNaira(amount, { compact: false })}
        </Text>
    </VStack>
);

const ActionItem: React.FC<{ icon: React.ElementType; label: string; count: number; cost: number }> = ({ icon, label, count, cost }) => (
    <VStack align="center" gap={2} flex="1">
        <Box w={10} h={10} borderRadius="md" border="1px solid" borderColor="primary.500" display="flex" alignItems="center" justifyContent="center">
            <Icon as={icon} boxSize={5} color="primary.500" />
        </Box>
        <Text fontSize="xs" color="gray.600">
            {label}
        </Text>
        <Text fontSize="sm" fontWeight="bold" color="black">
            {count.toLocaleString()}
        </Text>
        <Text fontSize="xs" fontWeight="medium" color="primary.500">
            {formatNaira(cost, { compact: false })}
        </Text>
    </VStack>
);

export default AdsSpending;
