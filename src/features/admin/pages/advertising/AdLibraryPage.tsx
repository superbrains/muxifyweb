import React from 'react';
import { Box, Center, Icon, Image, Link, SimpleGrid, Skeleton, Text, VStack } from '@chakra-ui/react';
import { FiImage } from 'react-icons/fi';
import {
    AdminEmptyState,
    AdminError,
    AdminPageLayout,
    FilterBar,
    StatusBadge,
} from '@shared/console';
import { Paginator } from '@shared/console/components/Paginator';
import { useAuthedImageSrc } from '@/shared/hooks/useAuthedImageSrc';
import { adminDate } from '@shared/console/lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useAdCreatives } from '../../hooks/useAdvertising';
import {
    CAMPAIGN_STATUS_OPTIONS,
    CAMPAIGN_TYPE_OPTIONS,
    type AdCreativeDto,
    type AdCreativeQuery,
} from '../../types/advertising';
import { NoAccess } from './NoAccess';

const PAGE_SIZE = 24;

/** Ad library — a grid of campaign creatives with preview thumbnails and click URLs. */
const AdLibraryPage: React.FC = () => {
    const canView = useHasPermission('AdvertisingView');
    const [query, setQuery] = React.useState<AdCreativeQuery>({ page: 1, pageSize: PAGE_SIZE });
    const { data, isLoading, error } = useAdCreatives(query);

    return (
        <AdminPageLayout
            title="Ad Library"
            subtitle="Every campaign creative across the platform, with previews and destinations."
            breadcrumbs={[{ label: 'Advertising' }, { label: 'Ad Library' }]}
        >
            {!canView ? (
                <NoAccess />
            ) : (
                <>
                    <FilterBar
                        search={{
                            value: query.search ?? '',
                            onChange: (v) =>
                                setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                            placeholder: 'Search by campaign or advertiser',
                        }}
                        filters={[
                            {
                                key: 'type',
                                value: query.type ?? 'All',
                                onChange: (v) =>
                                    setQuery((q) => ({
                                        ...q,
                                        type: v === 'All' ? undefined : v,
                                        page: 1,
                                    })),
                                options: CAMPAIGN_TYPE_OPTIONS,
                                width: '160px',
                            },
                            {
                                key: 'status',
                                value: query.status ?? 'All',
                                onChange: (v) =>
                                    setQuery((q) => ({
                                        ...q,
                                        status: v === 'All' ? undefined : v,
                                        page: 1,
                                    })),
                                options: CAMPAIGN_STATUS_OPTIONS,
                                width: '170px',
                            },
                        ]}
                    />

                    {error ? (
                        <AdminError error={error} message="Could not load the ad library." />
                    ) : isLoading && !data ? (
                        <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} gap={3}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} height="220px" borderRadius="xl" />
                            ))}
                        </SimpleGrid>
                    ) : (data?.items.length ?? 0) === 0 ? (
                        <AdminEmptyState
                            icon={FiImage}
                            title="No creatives"
                            description="No creatives match the current filters."
                        />
                    ) : (
                        <VStack align="stretch" gap={3}>
                            <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} gap={3}>
                                {(data?.items ?? []).map((c) => (
                                    <CreativeCard key={`${c.campaignId}-${c.createdAt}`} creative={c} />
                                ))}
                            </SimpleGrid>
                            {data && (
                                <Paginator
                                    page={data.page}
                                    pageSize={data.pageSize}
                                    total={data.total}
                                    onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
                                />
                            )}
                        </VStack>
                    )}
                </>
            )}
        </AdminPageLayout>
    );
};

export default AdLibraryPage;

const CreativeCard: React.FC<{ creative: AdCreativeDto }> = ({ creative }) => {
    // Prefer the cover image (audio ads); fall back to the creative (photo). Backend
    // URLs are JWT-gated proxy paths, so resolve to a loadable blob URL.
    const cover = useAuthedImageSrc(creative.coverImageUrl ?? creative.creativeUrl);
    return (
    <Box
        bg="white"
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.100"
        overflow="hidden"
        display="flex"
        flexDirection="column"
    >
        {cover ? (
            <Image
                src={cover}
                alt={creative.campaignName}
                w="100%"
                h="130px"
                objectFit="cover"
                bg="gray.50"
            />
        ) : (
            <Center h="130px" bg="gray.50">
                <Icon as={FiImage} boxSize={7} color="gray.300" />
            </Center>
        )}
        <VStack align="stretch" gap={1.5} p={3}>
            <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                {creative.campaignName}
            </Text>
            <Text fontSize="10px" color="gray.500" lineClamp={1}>
                {creative.advertiserName} · {creative.type}
            </Text>
            <StatusBadge status={creative.status} />
            {creative.clickUrl && (
                <Link
                    href={creative.clickUrl}
                    color="primary.500"
                    fontSize="10px"
                    target="_blank"
                    lineClamp={1}
                >
                    {creative.clickUrl}
                </Link>
            )}
            <Text fontSize="10px" color="gray.400">
                {adminDate(creative.createdAt)}
            </Text>
        </VStack>
    </Box>
    );
};
