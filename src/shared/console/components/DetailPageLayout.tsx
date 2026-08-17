import React from 'react';
import { Box, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import { AdminPageLayout } from './AdminPageLayout';
import { CoverThumb } from './CoverThumb';
import { DetailTabs } from './DetailTabs';
import { StatusBadge, toneStyle, resolveStatusStyle } from './statusBadge';
import type { StatusTone } from './statusBadge';
import type { Breadcrumb } from './AdminPageLayout';
import type { DetailTab } from './DetailTabs';

interface HeroBadge {
    label: string;
    tone?: StatusTone;
}

interface DetailPageLayoutProps {
    /** Page title (used in breadcrumb + AdminPageLayout). */
    title: string;
    /** Secondary title shown in the hero header (e.g. item title). */
    heroTitle: string;
    heroSubtitle?: string;
    coverArtUrl?: string;
    breadcrumbs: Breadcrumb[];
    badges?: HeroBadge[];
    /** Right-aligned action buttons. */
    actions?: React.ReactNode;
    tabs: DetailTab[];
    activeTab?: string;
    onTabChange?: (id: string) => void;
    /** Optional inline content above the tabs (e.g. quick stats). */
    summary?: React.ReactNode;
}

/**
 * Full-page chrome for content detail routes. Provides a hero header (cover
 * art, title, badges, actions) wired into AdminPageLayout, plus a tabbed body.
 */
export const DetailPageLayout: React.FC<DetailPageLayoutProps> = ({
    title,
    heroTitle,
    heroSubtitle,
    coverArtUrl,
    breadcrumbs,
    badges,
    actions,
    tabs,
    activeTab,
    onTabChange,
    summary,
}) => (
    <AdminPageLayout title={title} breadcrumbs={breadcrumbs} actions={actions}>
        <Box
            bg="white"
            borderRadius="16px"
            border="1px solid"
            borderColor="gray.100"
            p={{ base: 4, md: 5 }}
            shadow="xs"
        >
            <Stack direction={{ base: 'column', sm: 'row' }} gap={4} align="flex-start">
                <CoverThumb
                    src={coverArtUrl}
                    alt={heroTitle}
                    size={{ base: '64px', sm: '80px' }}
                    radius="12px"
                    fallbackFontSize="28px"
                />

                <VStack align="start" gap={1.5} flex="1" minW={0}>
                    <Text
                        fontSize={{ base: 'md', md: 'lg' }}
                        fontWeight="bold"
                        color="gray.900"
                        fontFamily="Poppins"
                        lineClamp={2}
                    >
                        {heroTitle}
                    </Text>
                    {heroSubtitle && (
                        <Text fontSize="sm" color="gray.500" lineClamp={1}>
                            {heroSubtitle}
                        </Text>
                    )}
                    {badges && badges.length > 0 && (
                        <HStack gap={2} flexWrap="wrap">
                            {badges.map((b) => (
                                <StatusBadge
                                    key={b.label}
                                    style={b.tone ? toneStyle(b.tone, b.label) : resolveStatusStyle(b.label)}
                                />
                            ))}
                        </HStack>
                    )}
                </VStack>
            </Stack>
        </Box>

        {summary}

        <DetailTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
    </AdminPageLayout>
);
