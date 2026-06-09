import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { KpiCard } from '@/features/record-label/components/KpiCard';
import type { TrendValue } from '@/features/record-label/lib/format';

export interface KpiItem {
    label: string;
    value: string;
    /** Card background tint (defaults cycle through the brand palette). */
    bg?: string;
    iconColor?: string;
    sub?: string;
    trend?: TrendValue;
    trendCaption?: string;
}

interface KpiStripProps {
    items: KpiItem[];
    columns?: { base?: number; md?: number; xl?: number };
}

/** Rotating palette so a strip of cards reads as a cohesive set. */
const PALETTE: { bg: string; iconColor: string }[] = [
    { bg: '#FFF5F6', iconColor: 'primary.500' },
    { bg: '#ECF7FF', iconColor: '#3B82F6' },
    { bg: '#FFF9E6', iconColor: '#D97706' },
    { bg: '#F6F1FF', iconColor: '#7C3AED' },
    { bg: '#E7FFF7', iconColor: '#16A34A' },
    { bg: '#FEF2F2', iconColor: '#E53E3E' },
];

/**
 * Dashboard metric strip — wraps the shared {@link KpiCard} so every tower's
 * KPI row looks identical. Pass `items`; colours auto-cycle unless overridden.
 */
export const KpiStrip: React.FC<KpiStripProps> = ({ items, columns }) => (
    <SimpleGrid
        columns={{
            base: columns?.base ?? 2,
            md: columns?.md ?? 3,
            xl: columns?.xl ?? Math.min(items.length, 6),
        }}
        gap={3}
    >
        {items.map((item, i) => {
            const palette = PALETTE[i % PALETTE.length];
            return (
                <KpiCard
                    key={item.label}
                    bg={item.bg ?? palette.bg}
                    iconColor={item.iconColor ?? palette.iconColor}
                    label={item.label}
                    value={item.value}
                    sub={item.sub}
                    trend={item.trend}
                    trendCaption={item.trendCaption}
                />
            );
        })}
    </SimpleGrid>
);
