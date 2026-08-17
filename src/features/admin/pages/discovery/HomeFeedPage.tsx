import React from 'react';
import { Box, Button, HStack, Image, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { AdminEmptyState, AdminError, AdminLoading, AdminPageLayout, KpiStrip } from '@shared/console';
import type { KpiItem } from '@shared/console';
import { useAuthedImageSrc } from '@/shared/hooks/useAuthedImageSrc';
import { useHomeFeed } from '../../hooks/useDiscovery';
import { adminDateTime } from '@shared/console/lib/format';
import type { AdminHomeFeedItemDto, AdminHomeFeedSectionDto } from '../../types/discovery';

/**
 * Home feed preview — a read-only render of exactly what the mobile home feed
 * will serve, grouped by section. Kept defensive about the response shape: it
 * accepts a `sections` array (preferred) or any object whose values are arrays
 * of feed items, and renders whatever metadata is present. Links out to the
 * Featured + curation surfaces for actual management.
 */
const HomeFeedPage: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading, error } = useHomeFeed();

    const sections = normalizeSections(data);
    const totalItems = sections.reduce((sum, s) => sum + (s.items?.length ?? 0), 0);
    const kpis: KpiItem[] = [
        { label: 'Sections', value: sections.length, tone: 'info' },
        { label: 'Total items', value: totalItems, tone: 'success' },
        {
            label: 'Largest section',
            value: sections.reduce((max, s) => Math.max(max, s.items?.length ?? 0), 0),
            tone: 'neutral',
        },
    ];

    return (
        <AdminPageLayout
            title="Home Feed Preview"
            subtitle={
                data?.generatedAt
                    ? `Generated ${adminDateTime(data.generatedAt)}`
                    : 'A read-only preview of the live mobile home feed.'
            }
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Home Feed' }]}
            actions={
                <HStack gap={2}>
                    <Button
                        size="sm"
                        fontSize="xs"
                        variant="outline"
                        borderColor="gray.300"
                        color="gray.700"
                        borderRadius="10px"
                        onClick={() => navigate('/admin/discovery/featured')}
                    >
                        Manage featured
                    </Button>
                    <Button
                        size="sm"
                        fontSize="xs"
                        variant="outline"
                        borderColor="gray.300"
                        color="gray.700"
                        borderRadius="10px"
                        onClick={() => navigate('/admin/discovery/trending')}
                    >
                        Curate trending
                    </Button>
                </HStack>
            }
        >
            {error ? (
                <AdminError error={error} message="Could not load the home feed preview." />
            ) : isLoading && !data ? (
                <AdminLoading />
            ) : sections.length === 0 ? (
                <AdminEmptyState
                    icon={FiHome}
                    title="The home feed is empty"
                    description="No sections were returned. Add featured content or curation overrides to populate the feed."
                    cta={{ label: 'Manage featured', onClick: () => navigate('/admin/discovery/featured') }}
                />
            ) : (
                <VStack align="stretch" gap={4}>
                    <KpiStrip items={kpis} columns={{ base: 3, md: 3, xl: 3 }} />
                    {sections.map((section, i) => (
                        <FeedSection key={section.key ?? section.title ?? i} section={section} />
                    ))}
                </VStack>
            )}
        </AdminPageLayout>
    );
};

export default HomeFeedPage;

/* ------------------------------------------------------------------ */

const FeedSection: React.FC<{ section: AdminHomeFeedSectionDto }> = ({ section }) => {
    const items = section.items ?? [];
    return (
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={4}>
            <HStack justify="space-between" mb={3}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                    {section.title ?? section.key ?? 'Section'}
                </Text>
                {section.type && (
                    <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="0.4px">
                        {section.type}
                    </Text>
                )}
            </HStack>
            {items.length === 0 ? (
                <Text fontSize="xs" color="gray.400">
                    No items in this section.
                </Text>
            ) : (
                <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} gap={3}>
                    {items.map((item, i) => (
                        <FeedItem key={item.id ?? item.contentId ?? i} item={item} />
                    ))}
                </SimpleGrid>
            )}
        </Box>
    );
};

const FeedItem: React.FC<{ item: AdminHomeFeedItemDto }> = ({ item }) => {
    const img = useAuthedImageSrc(item.imageUrl || undefined);
    return (
        <Box borderRadius="lg" border="1px solid" borderColor="gray.100" overflow="hidden">
            <Box w="100%" h="100px" bg="gray.100">
                {img && <Image src={img} alt="" w="100%" h="100%" objectFit="cover" />}
            </Box>
            <Box p={2.5}>
                <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                    {item.title ?? item.contentId ?? 'Untitled'}
                </Text>
                {(item.subtitle || item.contentType) && (
                    <Text fontSize="10px" color="gray.500" lineClamp={1} textTransform="capitalize">
                        {item.subtitle ?? item.contentType}
                    </Text>
                )}
            </Box>
        </Box>
    );
};

/**
 * Tolerant normalisation: prefer an explicit `sections` array; otherwise treat
 * any array-valued top-level field as a named section so the page renders
 * whatever the backend ships without coupling to an exact contract.
 */
function normalizeSections(data?: {
    sections?: AdminHomeFeedSectionDto[] | null;
    [k: string]: unknown;
}): AdminHomeFeedSectionDto[] {
    if (!data) return [];
    if (Array.isArray(data.sections)) return data.sections;

    const derived: AdminHomeFeedSectionDto[] = [];
    for (const [key, value] of Object.entries(data)) {
        if (key === 'sections' || key === 'generatedAt') continue;
        if (Array.isArray(value)) {
            derived.push({ key, title: humanize(key), items: value as AdminHomeFeedItemDto[] });
        }
    }
    return derived;
}

const humanize = (key: string): string => {
    const spaced = key
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};
