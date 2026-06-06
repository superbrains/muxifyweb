import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Text, VStack, HStack } from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon } from '@/shared/icons/CustomIcons';
import type { AnalyticsPeriod } from '../services/dashboardService';

/** A selection emitted by the filter: either a named preset or a custom range. */
export type DashboardDateSelection =
    | { kind: 'preset'; period: AnalyticsPeriod; label: string }
    | { kind: 'today'; label: string }
    | { kind: 'range'; from: string; to: string; label: string };

interface DashboardDateFilterProps {
    /** Label of the currently-applied selection, shown on the trigger button. */
    label: string;
    onApply: (selection: DashboardDateSelection) => void;
}

const PRESETS: { label: string; selection: DashboardDateSelection }[] = [
    { label: 'Today', selection: { kind: 'today', label: 'Today' } },
    { label: 'Last 7 Days', selection: { kind: 'preset', period: '7d', label: 'Last 7 Days' } },
    { label: 'Last 30 Days', selection: { kind: 'preset', period: '30d', label: 'Last 30 Days' } },
    { label: 'Last 90 Days', selection: { kind: 'preset', period: '90d', label: 'Last 90 Days' } },
    { label: 'Last 12 Months', selection: { kind: 'preset', period: '12m', label: 'Last 12 Months' } },
];

const toIso = (d: Date): string => {
    // Local date as YYYY-MM-DD (avoids timezone shifting the chosen day).
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
};

const formatRangeLabel = (from: Date, to: Date): string => {
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${from.toLocaleDateString('en-GB', opts)} - ${to.toLocaleDateString('en-GB', opts)}`;
};

export const DashboardDateFilter: React.FC<DashboardDateFilterProps> = ({ label, onApply }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [startDate, endDate] = range;

    // Close when clicking outside the filter.
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    const applyPreset = (selection: DashboardDateSelection) => {
        setRange([null, null]);
        onApply(selection);
        setIsOpen(false);
    };

    const applyRange = () => {
        if (!startDate || !endDate) return;
        onApply({
            kind: 'range',
            from: toIso(startDate),
            to: toIso(endDate),
            label: formatRangeLabel(startDate, endDate),
        });
        setIsOpen(false);
    };

    return (
        <Box position="relative" ref={containerRef}>
            <Button
                variant="outline"
                borderWidth="1px"
                borderColor="gray.blue.200"
                bg="white"
                size="xs"
                fontSize="10px"
                h="28px"
                _hover={{ bg: 'gray.50', borderColor: 'gray.blue.300' }}
                rounded="5px"
                color="gray.blue.800"
                gap={2}
                onClick={() => setIsOpen((v) => !v)}
            >
                <CalendarIcon color="dark.800" boxSize={4} />
                {label}
            </Button>

            {isOpen && (
                <Box
                    position="absolute"
                    top="34px"
                    right={0}
                    zIndex={20}
                    bg="white"
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="lg"
                    boxShadow="lg"
                    p={3}
                    minW="240px"
                >
                    <VStack align="stretch" gap={1} mb={3}>
                        {PRESETS.map((preset) => (
                            <Button
                                key={preset.label}
                                size="xs"
                                variant="ghost"
                                justifyContent="flex-start"
                                fontSize="11px"
                                h="28px"
                                color={label === preset.label ? 'primary.500' : 'gray.700'}
                                fontWeight={label === preset.label ? 'bold' : 'normal'}
                                _hover={{ bg: 'gray.50' }}
                                onClick={() => applyPreset(preset.selection)}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </VStack>

                    <Box borderTop="1px solid" borderColor="gray.100" pt={3}>
                        <Text fontSize="10px" fontWeight="semibold" color="gray.600" mb={2}>
                            Custom Range
                        </Text>
                        <Box className="dashboard-range-picker" fontSize="12px">
                            <DatePicker
                                selected={startDate}
                                onChange={(dates) => setRange(dates as [Date | null, Date | null])}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                inline
                                maxDate={new Date()}
                                calendarClassName="text-xs"
                            />
                        </Box>
                        <HStack justify="flex-end" mt={2} gap={2}>
                            <Button
                                size="xs"
                                variant="ghost"
                                fontSize="10px"
                                h="26px"
                                onClick={() => setRange([null, null])}
                            >
                                Clear
                            </Button>
                            <Button
                                size="xs"
                                fontSize="10px"
                                h="26px"
                                bg="primary.500"
                                color="white"
                                _hover={{ bg: 'primary.600' }}
                                disabled={!startDate || !endDate}
                                onClick={applyRange}
                            >
                                Apply
                            </Button>
                        </HStack>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default DashboardDateFilter;
