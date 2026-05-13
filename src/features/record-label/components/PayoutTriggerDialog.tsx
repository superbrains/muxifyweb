import React, { useEffect, useMemo, useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Dialog,
    HStack,
    Input,
    Menu,
    Portal,
    RadioGroup,
    Stack,
    Text,
} from '@chakra-ui/react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import { useTriggerPayout } from '../hooks/usePayouts';
import { useRoster } from '../hooks/useRoster';
import { formatMinorAmount } from '../lib/format';
import type { PayoutBatchSummary, PayoutPeriod, TriggerPayoutRequest } from '../types';

interface PayoutTriggerDialogProps {
    open: boolean;
    onClose: () => void;
}

type Step = 'configure' | 'confirm' | 'result';

const PERIOD_OPTIONS: Array<{ value: PayoutPeriod; label: string; description: string }> = [
    { value: 'last-month', label: 'Last calendar month', description: 'The previous completed month.' },
    { value: 'mtd', label: 'Month to date', description: 'From the 1st of this month through today.' },
    { value: 'custom', label: 'Custom range', description: 'Pick exact start and end dates.' },
];

const generateIdempotencyKey = (): string => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

function toIsoStart(date: string): string | undefined {
    if (!date) return undefined;
    const d = new Date(`${date}T00:00:00.000Z`);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function toIsoEnd(date: string): string | undefined {
    if (!date) return undefined;
    const d = new Date(`${date}T23:59:59.999Z`);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export const PayoutTriggerDialog: React.FC<PayoutTriggerDialogProps> = ({ open, onClose }) => {
    const [step, setStep] = useState<Step>('configure');
    const [period, setPeriod] = useState<PayoutPeriod>('last-month');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedArtistIds, setSelectedArtistIds] = useState<Set<string>>(new Set());
    const [idempotencyKey, setIdempotencyKey] = useState<string>(() => generateIdempotencyKey());
    const [resultBatches, setResultBatches] = useState<PayoutBatchSummary[] | null>(null);

    const trigger = useTriggerPayout();
    const { data: roster } = useRoster();

    // Reset state each time the dialog opens — including a fresh idempotency key so a
    // closed-and-reopened dialog doesn't accidentally short-circuit on the server.
    useEffect(() => {
        if (open) {
            setStep('configure');
            setPeriod('last-month');
            setFromDate('');
            setToDate('');
            setSelectedArtistIds(new Set());
            setIdempotencyKey(generateIdempotencyKey());
            setResultBatches(null);
        }
    }, [open]);

    const customDatesInvalid =
        period === 'custom' &&
        (!fromDate || !toDate || new Date(fromDate) > new Date(toDate));

    const summaryArtistCount =
        selectedArtistIds.size === 0
            ? (roster?.length ?? 0)
            : selectedArtistIds.size;

    const periodSummary = useMemo(() => {
        if (period === 'mtd') return 'Month to date';
        if (period === 'last-month') return 'Last calendar month';
        return fromDate && toDate ? `${fromDate} → ${toDate}` : 'Custom range';
    }, [period, fromDate, toDate]);

    const handleSubmit = async () => {
        const req: TriggerPayoutRequest = {
            period,
            from: period === 'custom' ? toIsoStart(fromDate) : undefined,
            to: period === 'custom' ? toIsoEnd(toDate) : undefined,
            artistIds: selectedArtistIds.size > 0 ? Array.from(selectedArtistIds) : undefined,
        };
        try {
            const response = await trigger.mutateAsync({ req, idempotencyKey });
            setResultBatches(response.batches);
            setStep('result');
        } catch {
            // Error toast is fired inside the mutation; stay on confirm step so the user can retry.
        }
    };

    const toggleArtist = (id: string) => {
        setSelectedArtistIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(d) => !d.open && onClose()}
            size="md"
            placement="center"
        >
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="20px" p={2}>
                        <Dialog.Header>
                            <Dialog.Title fontSize="sm" fontWeight="semibold" fontFamily="Poppins">
                                {step === 'result' ? 'Payout initiated' : 'Trigger payout'}
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            {step === 'configure' && (
                                <Stack gap={4}>
                                    <Text fontSize="xs" color="gray.600">
                                        Splits are applied automatically from each track's saved
                                        configuration. Select a period and (optionally) narrow the
                                        recipients to a subset of your roster.
                                    </Text>

                                    <Stack gap={2}>
                                        <Text fontSize="10px" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.5px">
                                            Period
                                        </Text>
                                        <RadioGroup.Root
                                            value={period}
                                            onValueChange={(d) => setPeriod(d.value as PayoutPeriod)}
                                        >
                                            <Stack gap={2}>
                                                {PERIOD_OPTIONS.map((opt) => (
                                                    <RadioGroup.Item key={opt.value} value={opt.value}>
                                                        <RadioGroup.ItemHiddenInput />
                                                        <RadioGroup.ItemIndicator />
                                                        <RadioGroup.ItemText fontSize="xs">
                                                            <Box>
                                                                <Text fontWeight="medium" color="gray.900">{opt.label}</Text>
                                                                <Text fontSize="10px" color="gray.500">{opt.description}</Text>
                                                            </Box>
                                                        </RadioGroup.ItemText>
                                                    </RadioGroup.Item>
                                                ))}
                                            </Stack>
                                        </RadioGroup.Root>
                                    </Stack>

                                    {period === 'custom' && (
                                        <HStack gap={2}>
                                            <Stack gap={1} flex="1">
                                                <Text fontSize="10px" color="gray.500" fontWeight="semibold" textTransform="uppercase">
                                                    From
                                                </Text>
                                                <Input
                                                    type="date"
                                                    value={fromDate}
                                                    onChange={(e) => setFromDate(e.target.value)}
                                                    size="sm"
                                                    fontSize="xs"
                                                    bg="gray.50"
                                                    borderColor="gray.200"
                                                    borderRadius="10px"
                                                />
                                            </Stack>
                                            <Stack gap={1} flex="1">
                                                <Text fontSize="10px" color="gray.500" fontWeight="semibold" textTransform="uppercase">
                                                    To
                                                </Text>
                                                <Input
                                                    type="date"
                                                    value={toDate}
                                                    onChange={(e) => setToDate(e.target.value)}
                                                    size="sm"
                                                    fontSize="xs"
                                                    bg="gray.50"
                                                    borderColor="gray.200"
                                                    borderRadius="10px"
                                                />
                                            </Stack>
                                        </HStack>
                                    )}

                                    <Stack gap={2}>
                                        <Text fontSize="10px" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.5px">
                                            Recipients
                                        </Text>
                                        <Menu.Root>
                                            <Menu.Trigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    fontSize="xs"
                                                    fontWeight="medium"
                                                    borderRadius="10px"
                                                    borderColor="gray.200"
                                                    color="gray.700"
                                                    justifyContent="space-between"
                                                    width="100%"
                                                >
                                                    <Text>
                                                        {selectedArtistIds.size === 0
                                                            ? `All roster artists (${roster?.length ?? 0})`
                                                            : `${selectedArtistIds.size} selected`}
                                                    </Text>
                                                    <FiChevronDown />
                                                </Button>
                                            </Menu.Trigger>
                                            <Portal>
                                                <Menu.Positioner>
                                                    <Menu.Content
                                                        minW="280px"
                                                        maxH="280px"
                                                        overflowY="auto"
                                                        borderRadius="md"
                                                        boxShadow="lg"
                                                        p={1}
                                                        bg="white"
                                                        border="1px solid"
                                                        borderColor="gray.100"
                                                        zIndex={1600}
                                                    >
                                                        {(roster?.length ?? 0) === 0 ? (
                                                            <Text fontSize="xs" color="gray.500" px={3} py={2}>
                                                                No roster artists yet
                                                            </Text>
                                                        ) : (
                                                            (roster ?? []).map((a) => {
                                                                const checked = selectedArtistIds.has(a.artistUserId);
                                                                return (
                                                                    <Menu.Item
                                                                        key={a.artistUserId}
                                                                        value={a.artistUserId}
                                                                        onClick={() => toggleArtist(a.artistUserId)}
                                                                        fontSize="xs"
                                                                        _hover={{ bg: 'gray.50' }}
                                                                        closeOnSelect={false}
                                                                    >
                                                                        <HStack justify="space-between" width="100%">
                                                                            <HStack gap={2}>
                                                                                <Avatar.Root size="xs">
                                                                                    <Avatar.Fallback name={a.performingName} />
                                                                                </Avatar.Root>
                                                                                <Text>{a.performingName}</Text>
                                                                            </HStack>
                                                                            {checked && (
                                                                                <Box color="primary.500">
                                                                                    <FiCheck />
                                                                                </Box>
                                                                            )}
                                                                        </HStack>
                                                                    </Menu.Item>
                                                                );
                                                            })
                                                        )}
                                                    </Menu.Content>
                                                </Menu.Positioner>
                                            </Portal>
                                        </Menu.Root>
                                        <Text fontSize="10px" color="gray.500">
                                            Leave empty to pay out the entire roster.
                                        </Text>
                                    </Stack>

                                    <Box bg="primary.50" p={3} borderRadius="md" fontSize="xs" color="gray.700">
                                        Funds settle after a short review window. The action cannot be
                                        undone once a payout has been marked Paid.
                                    </Box>
                                </Stack>
                            )}

                            {step === 'confirm' && (
                                <Stack gap={4}>
                                    <Text fontSize="xs" color="gray.700">
                                        Confirm the payout below. Once initiated, splits will be calculated
                                        from each track's configuration and the eligible earnings will be
                                        consumed (so they can't be paid out twice).
                                    </Text>
                                    <Stack
                                        gap={2}
                                        bg="gray.50"
                                        borderRadius="14px"
                                        border="1px solid"
                                        borderColor="gray.100"
                                        px={4}
                                        py={3}
                                    >
                                        <SummaryRow label="Period" value={periodSummary} />
                                        <SummaryRow
                                            label="Recipients"
                                            value={`${summaryArtistCount} ${summaryArtistCount === 1 ? 'artist' : 'artists'}`}
                                        />
                                    </Stack>
                                </Stack>
                            )}

                            {step === 'result' && resultBatches && (
                                <Stack gap={3}>
                                    <Text fontSize="xs" color="gray.700">
                                        {resultBatches.reduce((s, b) => s + b.payoutCount, 0)} payout
                                        {resultBatches.reduce((s, b) => s + b.payoutCount, 0) === 1 ? '' : 's'}{' '}
                                        initiated across{' '}
                                        {resultBatches.length === 1
                                            ? '1 currency batch'
                                            : `${resultBatches.length} currency batches`}.
                                    </Text>
                                    <Stack gap={2}>
                                        {resultBatches.map((b) => (
                                            <Box
                                                key={b.batchId}
                                                bg="white"
                                                border="1px solid"
                                                borderColor="gray.100"
                                                borderRadius="12px"
                                                px={3}
                                                py={2.5}
                                            >
                                                <HStack justify="space-between">
                                                    <VStackTight>
                                                        <Text fontSize="10px" color="gray.500" textTransform="uppercase" fontWeight="semibold">
                                                            {b.currency} batch
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.700" fontFamily="mono" wordBreak="break-all">
                                                            {b.batchId}
                                                        </Text>
                                                    </VStackTight>
                                                    <VStackTight align="end">
                                                        <Text fontSize="10px" color="gray.500">
                                                            {b.payoutCount} {b.payoutCount === 1 ? 'payout' : 'payouts'}
                                                        </Text>
                                                        <Text fontSize="sm" fontWeight="bold" color="gray.900">
                                                            {formatMinorAmount(b.totalAmountMinor, b.currency)}
                                                        </Text>
                                                    </VStackTight>
                                                </HStack>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Stack>
                            )}
                        </Dialog.Body>
                        <Dialog.Footer>
                            <HStack gap={2} width="100%" justify="flex-end">
                                {step === 'configure' && (
                                    <>
                                        <Button onClick={onClose} variant="ghost" size="sm" fontSize="xs">
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => setStep('confirm')}
                                            disabled={customDatesInvalid}
                                            bg="primary.500"
                                            color="white"
                                            size="sm"
                                            fontSize="xs"
                                            fontWeight="medium"
                                            borderRadius="10px"
                                            _hover={{ bg: 'primary.600' }}
                                        >
                                            Continue
                                        </Button>
                                    </>
                                )}
                                {step === 'confirm' && (
                                    <>
                                        <Button
                                            onClick={() => setStep('configure')}
                                            variant="ghost"
                                            size="sm"
                                            fontSize="xs"
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            loading={trigger.isPending}
                                            bg="primary.500"
                                            color="white"
                                            size="sm"
                                            fontSize="xs"
                                            fontWeight="medium"
                                            borderRadius="10px"
                                            _hover={{ bg: 'primary.600' }}
                                        >
                                            Confirm payout
                                        </Button>
                                    </>
                                )}
                                {step === 'result' && (
                                    <Button
                                        onClick={onClose}
                                        bg="primary.500"
                                        color="white"
                                        size="sm"
                                        fontSize="xs"
                                        fontWeight="medium"
                                        borderRadius="10px"
                                        _hover={{ bg: 'primary.600' }}
                                    >
                                        Done
                                    </Button>
                                )}
                            </HStack>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

const SummaryRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <HStack justify="space-between" gap={3}>
        <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="0.5px" fontWeight="semibold">
            {label}
        </Text>
        <Text fontSize="xs" color="gray.900" fontWeight="medium" textAlign="right">
            {value}
        </Text>
    </HStack>
);

const VStackTight: React.FC<{ children: React.ReactNode; align?: 'start' | 'end' }> = ({
    children,
    align = 'start',
}) => (
    <Stack gap={0} alignItems={align === 'end' ? 'flex-end' : 'flex-start'}>
        {children}
    </Stack>
);
