import React from 'react';
import { Box, Button, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { FiFlag, FiPaperclip } from 'react-icons/fi';
import { formatMinorAmount } from '@/features/record-label/lib/format';
import { DataTable, FilterBar, KpiStrip, StatusBadge } from '@/features/admin/components/ui';
import type { DataColumn, KpiItem } from '@/features/admin/components/ui';
import { useDisputes } from '../hooks/useDisputes';
import { RaiseDisputeDialog } from './RaiseDisputeDialog';
import { DisputeDetailDrawer } from './DisputeDetailDrawer';
import { STATUS_FILTER_OPTIONS, subjectLabel } from '../lib/disputeFamily';
import type { DisputeListItem } from '../services/disputeService';
import type { DisputeRoleConfig } from '../config/roleConfig';

const PAGE_SIZE = 15;

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

interface DisputesPageContentProps {
    config: DisputeRoleConfig;
}

/**
 * The shared self-service disputes experience — a KPI strip, a status filter, a
 * paginated case table, a detail drawer and the raise dialog. Rendered identically
 * for artists, labels, ad managers and contributors; only the {@link DisputeRoleConfig}
 * (endpoint, subjects, copy) differs.
 */
export const DisputesPageContent: React.FC<DisputesPageContentProps> = ({ config }) => {
    const base = config.endpointBase;
    const [status, setStatus] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [raiseOpen, setRaiseOpen] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const { data, isLoading } = useDisputes(base, { status: status || undefined, page, pageSize: PAGE_SIZE });
    const disputes = data?.items ?? [];

    // Lightweight roll-up for the KPI strip: a recent unfiltered slice counted
    // client-side. `total` is the authoritative server count.
    const { data: rollup } = useDisputes(base, { pageSize: 100 });
    const kpis = React.useMemo<KpiItem[]>(() => {
        const items = rollup?.items ?? [];
        const count = (pred: (d: DisputeListItem) => boolean) => items.filter(pred).length;
        const open = count((d) => d.status === 'Open');
        const inReview = count((d) =>
            d.status === 'UnderReview' || d.status === 'AwaitingInfo' || d.status === 'Escalated');
        const resolved = count((d) => d.status === 'Resolved' || d.status === 'Rejected');
        return [
            { label: 'Total disputes', value: rollup?.total ?? 0, tone: 'info' },
            { label: 'Open', value: open, tone: 'warning' },
            { label: 'In review', value: inReview, tone: 'info' },
            { label: 'Closed', value: resolved, tone: 'success' },
        ];
    }, [rollup]);

    const columns: DataColumn<DisputeListItem>[] = [
        {
            key: 'reference',
            header: 'Reference',
            render: (d) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.900" fontFamily="mono">
                    {d.reference}
                </Text>
            ),
        },
        {
            key: 'about',
            header: 'About',
            render: (d) => <Text fontSize="xs" color="gray.700">{subjectLabel(d.subjectType)}</Text>,
        },
        {
            key: 'amount',
            header: 'Amount',
            align: 'right',
            render: (d) => (
                <Text fontSize="xs" color="gray.600">
                    {d.amountMinor != null ? formatMinorAmount(d.amountMinor, d.currency ?? 'NGN') : '—'}
                </Text>
            ),
        },
        // Evidence only applies to roles whose endpoint supports attachments.
        ...(config.supportsAttachments
            ? [
                  {
                      key: 'evidence',
                      header: 'Evidence',
                      align: 'center' as const,
                      render: (d: DisputeListItem) =>
                          d.attachmentCount && d.attachmentCount > 0 ? (
                              <HStack gap={1} justify="center" color="gray.500">
                                  <FiPaperclip size={12} />
                                  <Text fontSize="xs">{d.attachmentCount}</Text>
                              </HStack>
                          ) : (
                              <Text fontSize="xs" color="gray.300">—</Text>
                          ),
                  },
              ]
            : []),
        {
            key: 'status',
            header: 'Status',
            align: 'center',
            render: (d) => <StatusBadge status={d.status} />,
        },
        {
            key: 'raised',
            header: 'Raised',
            align: 'right',
            render: (d) => <Text fontSize="xs" color="gray.600">{formatDate(d.createdAt)}</Text>,
        },
    ];

    return (
        <VStack align="stretch" gap={{ base: 4, md: 5 }} maxW="1200px" mx="auto" w="full">
            <HStack justify="space-between" align="flex-start" gap={3} flexWrap="wrap">
                <VStack align="start" gap={0.5} minW={0}>
                    <Heading
                        as="h1"
                        fontSize={{ base: 'lg', md: 'xl' }}
                        fontWeight="bold"
                        color="gray.900"
                        fontFamily="Poppins"
                        lineHeight="1.2"
                    >
                        {config.title}
                    </Heading>
                    <Text fontSize="xs" color="gray.500" maxW="640px">
                        {config.subtitle}
                    </Text>
                </VStack>
                <Button
                    size="sm"
                    bg="primary.500"
                    color="white"
                    fontSize="xs"
                    borderRadius="10px"
                    flexShrink={0}
                    _hover={{ bg: 'primary.600' }}
                    onClick={() => setRaiseOpen(true)}
                >
                    <FiFlag /> Raise a dispute
                </Button>
            </HStack>

            <KpiStrip items={kpis} columns={{ base: 2, md: 4, xl: 4 }} />

            <Box>
                <FilterBar
                    filters={[
                        {
                            key: 'status',
                            value: status,
                            onChange: (v) => {
                                setStatus(v);
                                setPage(1);
                            },
                            options: STATUS_FILTER_OPTIONS,
                            width: '180px',
                        },
                    ]}
                />

                <DataTable
                    columns={columns}
                    rows={disputes}
                    rowKey={(d) => d.id}
                    loading={isLoading}
                    onRowClick={(d) => setSelectedId(d.id)}
                    emptyIcon={FiFlag}
                    emptyTitle="No disputes yet"
                    emptyDescription="When you raise a dispute, it appears here so you can follow its progress to resolution."
                    pagination={{
                        page,
                        pageSize: PAGE_SIZE,
                        total: data?.total ?? 0,
                        onPageChange: setPage,
                    }}
                />
            </Box>

            <DisputeDetailDrawer base={base} id={selectedId} onClose={() => setSelectedId(null)} />

            <RaiseDisputeDialog
                isOpen={raiseOpen}
                onClose={() => setRaiseOpen(false)}
                config={config}
                onSubmitted={(id) => setSelectedId(id)}
            />
        </VStack>
    );
};
