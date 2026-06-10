import React from 'react';
import { Button, HStack } from '@chakra-ui/react';
import { isoDaysAgo, todayIso } from '../../lib/format';
import type { DateWindow } from '../../types/platform';

export type QuickRangeKey = '7d' | '30d' | '90d' | '12m';

const PRESETS: { key: QuickRangeKey; label: string; days: number }[] = [
    { key: '7d', label: '7D', days: 7 },
    { key: '30d', label: '30D', days: 30 },
    { key: '90d', label: '90D', days: 90 },
    { key: '12m', label: '12M', days: 365 },
];

interface QuickRangesProps {
    active?: QuickRangeKey;
    onSelect: (key: QuickRangeKey, range: DateWindow) => void;
}

/**
 * Segmented quick-range presets for the analytics window. Selecting a preset
 * rewrites the from/to dates; editing the dates manually clears `active`.
 */
export const QuickRanges: React.FC<QuickRangesProps> = ({ active, onSelect }) => (
    <HStack gap={1} p={0.5} bg="gray.100" borderRadius="lg" flexShrink={0}>
        {PRESETS.map((preset) => {
            const isActive = active === preset.key;
            return (
                <Button
                    key={preset.key}
                    size="xs"
                    h="26px"
                    px={2.5}
                    fontSize="10px"
                    fontWeight={isActive ? 'bold' : 'medium'}
                    bg={isActive ? 'white' : 'transparent'}
                    color={isActive ? 'gray.900' : 'gray.500'}
                    border="1px solid"
                    borderColor={isActive ? 'gray.200' : 'transparent'}
                    borderRadius="md"
                    _hover={{ bg: isActive ? 'white' : 'gray.50', color: 'gray.800' }}
                    onClick={() =>
                        onSelect(preset.key, { from: isoDaysAgo(preset.days), to: todayIso() })
                    }
                >
                    {preset.label}
                </Button>
            );
        })}
    </HStack>
);
