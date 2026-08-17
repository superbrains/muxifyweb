import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box,
    Grid,
    Text,
    Button,
    HStack,
    VStack,
    Flex,
    Skeleton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { CalendarIcon, UploadIcon, EyeIcon, FlashIcon, PodCastAdsIcon, EyeOpenIcon, ClickIcon } from '@/shared/icons/CustomIcons';
import BackgroundBlueImg from '@/assets/images/Background-blue.png';
import { useWindowWidth } from '@/shared/hooks/useWindowsWidth';
import { formatNaira } from '@/shared/lib';
import { exportCsv, type CsvColumn } from '@shared/console/lib/exportCsv';
import { adsService } from '../services/adsService';
import type { AdActivityPointDto, AdDashboardSummaryDto } from '../types';

// Coral shades for the country map (darkest = most reach).
const CORAL_SHADES = ['#f94444', '#fb6a6a', '#fd9090', '#fdb6b6'];

export const AdsDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { windowWidth } = useWindowWidth();
    const [data, setData] = useState<AdDashboardSummaryDto | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        setLoading(true);
        adsService
            .getDashboard()
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const activity = useMemo(() => data?.activity ?? [], [data]);

    const deltaText = (pct: number) => `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs yesterday`;
    const deltaColor = (pct: number) => (pct > 0 ? 'green.500' : pct < 0 ? 'primary.500' : 'gray.500');

    // Country reach → coral fill map (top countries get the darkest shade).
    const countryFill = useMemo(() => {
        const map = new Map<string, string>();
        (data?.countryReach ?? []).forEach((c, i) => {
            if (c.country && c.country !== 'Unknown') map.set(c.country, CORAL_SHADES[Math.min(i, CORAL_SHADES.length - 1)]);
        });
        return map;
    }, [data]);

    const handleExport = () => {
        const columns: CsvColumn<AdActivityPointDto>[] = [
            { header: 'Month', value: (r) => r.label },
            { header: 'Impressions', value: (r) => r.impressions },
            { header: 'Clicks', value: (r) => r.clicks },
            { header: 'Spend (NGN)', value: (r) => (r.spendMinor / 100).toFixed(2) },
        ];
        exportCsv('ad-dashboard-activity', columns, activity);
    };

    // Activity Insights (impressions + clicks over the last 12 months).
    const activityChartOptions = {
        chart: { type: 'line' as const, height: 350, toolbar: { show: false }, fontFamily: 'Manrope, sans-serif', width: '100%' },
        colors: ['#f94444', '#3B82F6'],
        stroke: { width: 3, curve: 'smooth' as const, lineCap: 'round' as const },
        markers: { size: 0, hover: { size: 6 } },
        xaxis: {
            categories: activity.map((a) => a.label),
            labels: { style: { fontSize: '11px', fontFamily: 'Manrope, sans-serif', colors: '#7B91B0' } },
        },
        yaxis: { labels: { style: { fontSize: '11px', fontFamily: 'Manrope, sans-serif', colors: '#7B91B0' } } },
        legend: { position: 'bottom' as const, horizontalAlign: 'center' as const, fontSize: '12px', fontFamily: 'Manrope, sans-serif' },
        grid: { show: true, strokeDashArray: 3 },
    };
    const activityChartSeries = [
        { name: 'Impressions', data: activity.map((a) => a.impressions) },
        { name: 'Clicks', data: activity.map((a) => a.clicks) },
    ];

    // Spending (last-12-month spend area).
    const spendingChartOptions = {
        chart: { type: 'area' as const, height: 200, toolbar: { show: false }, fontFamily: 'Manrope, sans-serif', width: '100%' },
        colors: ['#f94444'],
        dataLabels: { enabled: false },
        stroke: { width: 3, curve: 'smooth' as const, lineCap: 'round' as const },
        fill: { type: 'solid' as const, opacity: 0.18 },
        markers: { size: 4, colors: ['#f94444'], strokeColors: '#fff', strokeWidth: 2, shape: 'circle' as const, hover: { size: 6 } },
        xaxis: { categories: activity.map((a) => a.label), labels: { show: false } },
        yaxis: { show: false },
        legend: { show: false },
        grid: { show: true, strokeDashArray: 3 },
    };
    const spendingChartSeries = [{ name: 'Spend', data: activity.map((a) => a.spendMinor / 100) }];

    // Optimisation Score donut.
    const score = data?.optimisationScore ?? 0;
    const optimisationChartOptions = {
        chart: { type: 'donut' as const, height: 200, toolbar: { show: false }, fontFamily: 'Manrope, sans-serif', width: '100%' },
        colors: ['#f94444', '#F1F1F4'],
        labels: ['Optimised', 'Headroom'],
        dataLabels: { enabled: false },
        legend: { show: false },
        tooltip: { enabled: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '72%',
                    labels: {
                        show: true,
                        name: { show: true, fontSize: '13px', fontFamily: 'Manrope, sans-serif', fontWeight: 600, color: '#374151' },
                        value: { show: true, fontSize: '22px', fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#111827', formatter: () => `${score}` },
                        total: { show: true, showAlways: true, label: 'Optimisation', fontSize: '12px', fontFamily: 'Manrope, sans-serif', fontWeight: 400, color: '#6B7280', formatter: () => `${score}` },
                    },
                },
            },
        },
    };
    const optimisationChartSeries = [score, Math.max(0, 100 - score)];

    return (
        <VStack gap={{ base: 2, lg: 6 }} bg="gray.50" minH="100vh">
            {/* Header Section */}
            <HStack
                w="full"
                align={{ base: 'stretch', md: 'center' }}
                gap={{ base: 3, md: 5 }}
                flexDirection={{ base: 'column', md: 'column', lg: 'row' }}
            >
                <VStack flexGrow={1} w={{ base: 'full', md: 'full', lg: 'auto' }} gap={{ base: 2, lg: 8 }} bg="white" p={5} borderRadius="xl">
                    <Flex justify={{ base: 'flex-start', md: 'space-between' }} w="full" align={{ base: 'flex-start', md: 'center' }} flexDirection={{ base: 'column', md: 'row' }} gap={{ base: 2, md: 0 }}>
                        <Box fontFamily="Poppins" display="flex" flexDirection="column" gap={1}>
                            <Text fontSize="md" fontWeight="semibold" color="gray.900" alignSelf="start">
                                Today's Insight
                            </Text>
                            <Text fontSize="xs" color="gray.600">Campaign Summary</Text>
                        </Box>

                        <HStack gap={3}>
                            <Button variant="outline" borderWidth="1px" borderColor="gray.blue.200" bg="white" size="sm" fontSize="xs" h="32px" _hover={{ bg: 'gray.50', borderColor: 'gray.blue.300' }} rounded="6px" color="gray.blue.800" gap={2} onClick={load}>
                                <CalendarIcon color="dark.800" boxSize={4} />
                                Today
                            </Button>
                            <Button variant="outline" borderWidth="1px" borderColor="gray.blue.200" bg="white" size="sm" fontSize="xs" h="32px" _hover={{ bg: 'gray.50', borderColor: 'gray.blue.300' }} rounded="6px" color="gray.blue.800" gap={2} onClick={handleExport} disabled={loading || activity.length === 0}>
                                <UploadIcon color="dark.800" boxSize={4} />
                                Export
                            </Button>
                        </HStack>
                    </Flex>

                    <Grid templateColumns={windowWidth >= 768 ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)'} gap={4} w="full">
                        <KpiCard bg="#ECF7FF" icon={EyeIcon} value={loading ? null : `${data?.visibilityScore ?? 0}`} label="Visibility Score" sub="Based on impressions" subColor="green.500" />
                        <KpiCard bg="#FFF5F3" icon={PodCastAdsIcon} value={loading ? null : `${data?.presenceScore ?? 0}%`} label="Presence Score" sub="Active campaigns ratio" subColor="green.500" />
                        <KpiCard bg="#E7FFF7" icon={EyeOpenIcon} value={loading ? null : (data?.totalImpressions ?? 0).toLocaleString()} label="Total Impressions" sub={loading ? '' : deltaText(data?.impressionsDeltaPct ?? 0)} subColor={deltaColor(data?.impressionsDeltaPct ?? 0)} />
                        <KpiCard bg="#F6F1FF" icon={ClickIcon} value={loading ? null : (data?.totalClicks ?? 0).toLocaleString()} label="Clicks" sub={loading ? '' : `CTR ${(data?.clickThroughRate ?? 0).toFixed(1)}% · ${deltaText(data?.clicksDeltaPct ?? 0)}`} subColor={deltaColor(data?.clicksDeltaPct ?? 0)} />
                    </Grid>
                </VStack>

                <div className="relative rounded-[15px] p-5 w-full lg:w-[250px] flex items-center justify-center h-[245px] bg-cover flex-col" style={{ backgroundImage: `url(${BackgroundBlueImg})` }}>
                    <div className="flex flex-col w-full gap-3 items-center self-center">
                        <Box bg="white" borderRadius="10px" p={1.5}>
                            <FlashIcon color="primary.500" boxSize={6} />
                        </Box>
                        <VStack align="center" gap={1}>
                            <Text fontSize="sm" color="white">
                                Create Campaign
                            </Text>
                            <Text textAlign="center" w="90%" color="white" fontSize="xs">
                                Start a new ad campaign to reach your audience
                            </Text>
                        </VStack>
                        <Button bg="white" color="primary.500" borderRadius="10px" fontSize="xs" size="sm" w="70%" border="none" _hover={{ bg: 'gray.100' }} onClick={() => navigate('/ads/create-campaign')}>
                            Create Now
                        </Button>
                    </div>
                </div>
            </HStack>

            {/* Charts Section: Activity Insights + Optimisation Score */}
            <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 2, lg: 6 }} w="full">
                <Box flex="2.3" minW="0" bg="white" p={4} borderRadius="xl" overflow="hidden">
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                        Activity Insights
                    </Text>
                    <Box width="100%" overflow="hidden">
                        {loading ? <Skeleton height="250px" /> : <Chart options={activityChartOptions} series={activityChartSeries} type="line" width="100%" height={250} />}
                    </Box>
                </Box>

                <Box flex="1" minW="0" bg="white" p={4} borderRadius="xl" overflow="hidden">
                    <VStack gap={3}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                            Optimisation Score
                        </Text>
                        <Box w="100%" minW={0}>
                            {loading ? <Skeleton height="250px" /> : <Chart options={optimisationChartOptions} series={optimisationChartSeries} type="donut" width="100%" height={250} />}
                        </Box>
                    </VStack>
                </Box>
            </Flex>

            {/* Bottom Row - Country reach + Spending */}
            <HStack gap={{ base: 2, lg: 6 }} w="full" flexDirection={{ base: 'column', md: 'row' }} alignItems="stretch">
                <Box bg="white" p={4} flex="1.8" borderRadius="xl" w={{ base: '100%', md: '60%', lg: '30%' }} minW={0}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={6}>
                        Campaign Reach by Country
                    </Text>
                    <Box h="140px" mb={4} overflow="hidden">
                        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 100, center: [0, 20] }} width={800} height={350} style={{ width: '100%', height: '100%' }}>
                            <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                                {/* eslint-disable @typescript-eslint/no-explicit-any */}
                                {({ geographies }: { geographies: any[] }) =>
                                    geographies.map((geo: any) => {
                                        /* eslint-enable @typescript-eslint/no-explicit-any */
                                        const fillColor = countryFill.get(geo.properties.name) ?? '#E5E7EB';
                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={fillColor}
                                                stroke="#FFFFFF"
                                                strokeWidth={0.5}
                                                style={{ default: { outline: 'none' }, hover: { outline: 'none', fill: fillColor, opacity: 0.8 }, pressed: { outline: 'none' } }}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ComposableMap>
                    </Box>

                    <Box w="100%">
                        {loading ? (
                            <Skeleton height="40px" />
                        ) : (data?.countryReach?.length ?? 0) === 0 ? (
                            <Text fontSize="xs" color="gray.500" textAlign="center">
                                No reach yet — your map fills in as campaigns are served.
                            </Text>
                        ) : (
                            <VStack align="stretch" gap={1}>
                                {data!.countryReach.slice(0, 4).map((c, i) => (
                                    <HStack key={c.country} justify="space-between">
                                        <HStack gap={1.5}>
                                            <Box w={2.5} h={2.5} bg={CORAL_SHADES[Math.min(i, CORAL_SHADES.length - 1)]} borderRadius="full" />
                                            <Text fontSize="xs" color="#7B91B0">{c.country}</Text>
                                        </HStack>
                                        <Text fontSize="xs" fontWeight="semibold" color="gray.900">{c.impressions.toLocaleString()}</Text>
                                    </HStack>
                                ))}
                            </VStack>
                        )}
                    </Box>
                </Box>

                <Box flex="2.74" minW="0" bg="white" p={4} borderRadius="xl" overflow="hidden">
                    <Flex justify="space-between" align="center" mb={4}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                            Spending
                        </Text>
                        {!loading && (
                            <Text fontSize="sm" fontWeight="bold" color="primary.500">
                                {formatNaira((data?.totalSpendMinor ?? 0) / 100, { compact: false })}
                            </Text>
                        )}
                    </Flex>
                    <Box width="100%" overflow="hidden">
                        {loading ? <Skeleton height="170px" /> : <Chart options={spendingChartOptions} series={spendingChartSeries} type="area" width="100%" height={170} />}
                    </Box>
                </Box>
            </HStack>
        </VStack>
    );
};

const KpiCard: React.FC<{
    bg: string;
    icon: React.ElementType;
    value: string | null;
    label: string;
    sub: string;
    subColor: string;
}> = ({ bg, icon: IconComp, value, label, sub, subColor }) => (
    <Box bg={bg} p={4} borderRadius="xl" flex="1">
        <VStack align="start" gap={3}>
            <IconComp boxSize={6} />
            <VStack align="start" gap={1}>
                {value === null ? (
                    <Skeleton height="20px" width="60px" />
                ) : (
                    <Text fontSize="lg" fontWeight="bold" color="gray.900">
                        {value}
                    </Text>
                )}
                <Text fontSize="xs" color="gray.600">
                    {label}
                </Text>
                {sub && (
                    <Text fontSize="xs" color={subColor}>
                        {sub}
                    </Text>
                )}
            </VStack>
        </VStack>
    </Box>
);

export default AdsDashboard;
