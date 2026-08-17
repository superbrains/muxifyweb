import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { KpiCard } from '@/features/record-label/components/KpiCard';
import type { TrendValue } from '@/features/record-label/lib/format';

export interface KpiItem {
    label: string;
    value: string | number;
    /** Card background tint (defaults cycle through the brand palette). */
    bg?: string;
    iconColor?: string;
    /** Optional colour tone for semantic meaning (maps to palette overrides). */
    tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
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

const TONE_PALETTE: Record<string, { bg: string; iconColor: string }> = {
    success: { bg: '#E7FFF7', iconColor: '#16A34A' },
    warning: { bg: '#FFF9E6', iconColor: '#D97706' },
    danger: { bg: '#FEF2F2', iconColor: '#E53E3E' },
    info: { bg: '#ECF7FF', iconColor: '#3B82F6' },
    neutral: { bg: '#F1F5F9', iconColor: '#64748B' },
};

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
            const tonePalette = item.tone ? TONE_PALETTE[item.tone] : undefined;
            const defaultPalette = PALETTE[i % PALETTE.length];
            const resolved = tonePalette ?? defaultPalette;
            return (
                <KpiCard
                    key={item.label}
                    bg={item.bg ?? resolved.bg}
                    iconColor={item.iconColor ?? resolved.iconColor}
                    label={item.label}
                    value={typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                    sub={item.sub}
                    trend={item.trend}
                    trendCaption={item.trendCaption}
                />
            );
        })}
    </SimpleGrid>
);
