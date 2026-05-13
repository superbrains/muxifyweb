import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Center,
    HStack,
    Skeleton,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePayouts } from '../hooks/usePayouts';
import { useLabelSummary } from '../hooks/useLabelSummary';
import { PayoutTriggerDialog } from '../components/PayoutTriggerDialog';
import { PayoutsKpiStrip } from '../components/PayoutsKpiStrip';
import { PayoutsFilterBar } from '../components/PayoutsFilterBar';
import { PayoutDetailDrawer } from '../components/PayoutDetailDrawer';
import { formatMinorAmount } from '../lib/format';
import { payoutStatusStyle, PAYOUT_STATUSES } from '../lib/payoutStatusColor';
import type { PayoutDto, PayoutStatus, PayoutsFilters } from '../types';

const PAGE_SIZE = 25;

function isPayoutStatus(value: string): value is PayoutStatus {
    return (PAYOUT_STATUSES as readonly string[]).includes(value);
}

function filtersFromParams(params: URLSearchParams): PayoutsFilters {
    const status = params.get('status');
    const from = params.get('from');
    const to = params.get('to');
    const page = params.get('page');
    const search = params.get('search');
    return {
        status: status && isPayoutStatus(status) ? status : undefined,
        from: from ?? undefined,
        to: to ?? undefined,
        page: page ? Math.max(1, Number(page)) : 1,
        pageSize: PAGE_SIZE,
        search: search ?? undefined,
    };
}

function paramsFromFilters(filters: PayoutsFilters): URLSearchParams {
    const p = new URLSearchParams();
    if (filters.status) p.set('status', filters.status);
    if (filters.from) p.set('from', filters.from);
    if (filters.to) p.set('to', filters.to);
    if (filters.page && filters.page > 1) p.set('page', String(filters.page));
    if (filters.search) p.set('search', filters.search);
    return p;
}

const PayoutsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const filters = React.useMemo(() => filtersFromParams(searchParams), [searchParams]);
    const updateFilters = React.useCallback(
        (next: PayoutsFilters) => setSearchParams(paramsFromFilters(next), { replace: false }),
        [setSearchParams],
    );

    const [triggerOpen, setTriggerOpen] = React.useState(false);
    const [detailId, setDetailId] = React.useState<string | null>(null);

    const { data: payouts, isLoading } = usePayouts(filters);
    const { data: summary, isLoading: summaryLoading } = useLabelSummary();

    const canTrigger = summary?.verificationStatus === 'Verified';

    // Client-side recipient search applied to the loaded page (the backend doesn't
    // currently support server-side recipient text search — tracked for a follow-up).
    const searchTerm = (filters.search ?? '').trim().toLowerCase();
    const visiblePayouts = React.useMemo(() => {
        if (!payouts) return [] as PayoutDto[];
        if (!searchTerm) return payouts;
        return payouts.filter((p) => p.recipientName.toLowerCase().includes(searchTerm));
    }, [payouts, searchTerm]);

    const goPage = (delta: number) => {
        const current = filters.page ?? 1;
        updateFilters({ ...filters, page: Math.max(1, current + delta) });
    };

    const total = summary?.pendingPayoutsCount ?? 0;
    const headerSub =
        total === 0
            ? 'Send earnings to artists on your roster.'
            : `${total} pending · ${formatMinorAmount(
                  summary?.pendingPayoutsAmountMinor ?? 0,
                  summary?.currency ?? 'NGN',
              )} pending balance`;

    return (
        <VStack
            gap={{ base: 2, lg: 6 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <HStack justify="space-between" align="center">
                <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                        Payouts
                    </Text>
                    <Text fontSize="11px" color="gray.600">
                        {headerSub}
                    </Text>
                </Box>
                <Button
                    onClick={() => setTriggerOpen(true)}
                    disabled={!canTrigger}
                    bg="primary.500"
                    color="white"
                    size="sm"
                    fontSize="xs"
                    fontWeight="medium"
                    borderRadius="10px"
                    _hover={{ bg: 'primary.600' }}
                >
                    Trigger payout
                </Button>
            </HStack>

            {!canTrigger && summary && (
                <HStack
                    bg="#FFF9E6"
                    color="#92660C"
                    borderRadius="12px"
                    border="1px solid"
                    borderColor="#FDE68A"
                    px={4}
                    py={3}
                    justify="space-between"
                    flexWrap="wrap"
                    gap={2}
                >
                    <Text fontSize="xs">
                        Verification is required before you can trigger a payout.
                    </Text>
                    <Button
                        onClick={() => navigate('/label/settings/verification')}
                        size="xs"
                        fontSize="11px"
                        fontWeight="semibold"
                        borderRadius="8px"
                        bg="#92660C"
                        color="white"
                        _hover={{ bg: '#7A5409' }}
                    >
                        Start verification
                    </Button>
                </HStack>
            )}

            <PayoutsKpiStrip
                summary={summary}
                payouts={payouts}
                isLoading={summaryLoading || isLoading}
            />

            <PayoutsFilterBar filters={filters} onChange={updateFilters} />

            {isLoading ? (
                <Stack gap={2} bg="white" borderRadius="20px" border="1px solid" borderColor="gray.100" p={3}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} height="56px" borderRadius="md" />
                    ))}
                </Stack>
            ) : visiblePayouts.length === 0 ? (
                <Center
                    bg="white"
                    borderRadius="20px"
                    border="1px solid"
                    borderColor="gray.100"
                    py={12}
                    px={4}
                    minH="40vh"
                >
                    <Stack gap={2} align="center" maxW="320px" textAlign="center">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                            {filters.status || filters.from || filters.to || searchTerm
                                ? 'No payouts match these filters'
                                : 'No payouts yet'}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            {filters.status || filters.from || filters.to || searchTerm
                                ? 'Try clearing some filters, or pick a wider date range.'
                                : 'When you trigger a payout for a period, every eligible artist on your roster receives a row here.'}
                        </Text>
                        {canTrigger && !(filters.status || filters.from || filters.to || searchTerm) && (
                            <Button
                                onClick={() => setTriggerOpen(true)}
                                mt={2}
                                bg="primary.500"
                                color="white"
                                size="sm"
                                fontSize="xs"
                                fontWeight="medium"
                                borderRadius="10px"
                                _hover={{ bg: 'primary.600' }}
                            >
                                Trigger first payout
                            </Button>
                        )}
                    </Stack>
                </Center>
            ) : (
                <Box
                    bg="white"
                    borderRadius="20px"
                    border="1px solid"
                    borderColor="gray.100"
                    p={2}
                >
                    <Stack gap={0}>
                        {visiblePayouts.map((p) => (
                            <PayoutRow key={p.id} payout={p} onOpen={() => setDetailId(p.id)} />
                        ))}
                    </Stack>
                </Box>
            )}

            {(payouts?.length ?? 0) >= PAGE_SIZE || (filters.page ?? 1) > 1 ? (
                <HStack justify="space-between" align="center" px={1}>
                    <Text fontSize="11px" color="gray.500">
                        Page {filters.page ?? 1}
                        {searchTerm && payouts && payouts.length !== visiblePayouts.length
                            ? ` · ${visiblePayouts.length} of ${payouts.length} shown`
                            : ''}
                    </Text>
                    <HStack gap={2}>
                        <Button
                            onClick={() => goPage(-1)}
                            disabled={(filters.page ?? 1) <= 1}
                            size="xs"
                            variant="outline"
                            fontSize="11px"
                            borderRadius="8px"
                            borderColor="gray.200"
                            color="gray.700"
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={() => goPage(1)}
                            disabled={(payouts?.length ?? 0) < PAGE_SIZE}
                            size="xs"
                            variant="outline"
                            fontSize="11px"
                            borderRadius="8px"
                            borderColor="gray.200"
                            color="gray.700"
                        >
                            Next
                        </Button>
                    </HStack>
                </HStack>
            ) : null}

            <PayoutTriggerDialog open={triggerOpen} onClose={() => setTriggerOpen(false)} />
            <PayoutDetailDrawer payoutId={detailId} onClose={() => setDetailId(null)} />
        </VStack>
    );
};

const PayoutRow: React.FC<{ payout: PayoutDto; onOpen: () => void }> = ({ payout, onOpen }) => {
    const style = payoutStatusStyle(payout.status);
    return (
        <HStack
            onClick={onOpen}
            py={3}
            px={3}
            borderRadius="md"
            cursor="pointer"
            transition="background 120ms ease"
            _hover={{ bg: 'gray.50' }}
            justify="space-between"
            borderBottom="1px solid"
            borderColor="gray.50"
        >
            <HStack gap={3} minW={0}>
                <Avatar.Root size="sm">
                    <Avatar.Fallback name={payout.recipientName} />
                </Avatar.Root>
                <VStack align="start" gap={0} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {payout.recipientName}
                    </Text>
                    <Text fontSize="10px" color="gray.500">
                        Initiated {new Date(payout.initiatedAt).toLocaleString()}
                    </Text>
                </VStack>
            </HStack>
            <HStack gap={4}>
                <HStack
                    gap={1.5}
                    bg={style.bg}
                    color={style.color}
                    fontSize="10px"
                    fontWeight="semibold"
                    px={2.5}
                    py={1}
                    borderRadius="full"
                >
                    <Box boxSize="6px" borderRadius="full" bg={style.dot} />
                    <Text>{style.label}</Text>
                </HStack>
                <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color="gray.900"
                    fontVariantNumeric="tabular-nums"
                >
                    {formatMinorAmount(payout.amountMinor, payout.currency)}
                </Text>
            </HStack>
        </HStack>
    );
};

export default PayoutsPage;
