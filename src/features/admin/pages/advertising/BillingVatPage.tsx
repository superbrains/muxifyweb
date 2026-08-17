import React from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Icon,
    IconButton,
    Input,
    Portal,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { FiFileText } from 'react-icons/fi';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    ConfirmActionModal,
    DataTable,
    FilterBar,
    KpiStrip,
    StatusBadge,
} from '@shared/console';
import type { DataColumn, KpiItem } from '@shared/console';
import { adminDate, formatMinorAmount } from '@shared/console/lib/format';
import { exportCsv } from '@shared/console/lib/exportCsv';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useAdBilling,
    useAdInvoices,
    useGenerateInvoice,
    useIssueInvoice,
    useMarkInvoicePaid,
    useVoidInvoice,
} from '../../hooks/useAdvertising';
import {
    AD_INVOICE_STATUS_OPTIONS,
    type AdInvoiceDto,
    type AdInvoiceQuery,
    type BillingQuery,
    type BillingReportRowDto,
} from '../../types/advertising';
import { RANGE_OPTIONS, rangeFor } from '../monetization/rangeFilter';
import { NoAccess } from './NoAccess';

const PAGE_SIZE = 20;

/** Billing & VAT — computed billing/VAT summary plus an invoice list with a full lifecycle. */
const BillingVatPage: React.FC = () => {
    const canView = useHasPermission('AdvertisingView');
    const canManage = useHasPermission('AdvertisingManage');

    const [preset, setPreset] = React.useState('30d');
    const billingQuery: BillingQuery = React.useMemo(() => rangeFor(preset), [preset]);
    const { data: billing } = useAdBilling(billingQuery);

    const [invoiceQuery, setInvoiceQuery] = React.useState<AdInvoiceQuery>({
        page: 1,
        pageSize: PAGE_SIZE,
    });
    const { data, isLoading, error } = useAdInvoices(invoiceQuery);

    const [generating, setGenerating] = React.useState(false);

    const currency = billing?.currency ?? 'NGN';

    const billingRows = billing?.rows ?? [];
    const exportBillingCsv = () => {
        exportCsv<BillingReportRowDto>(
            `ad-billing-${preset}`,
            [
                { header: 'Advertiser', value: (r) => r.advertiserName },
                { header: 'Advertiser ID', value: (r) => r.advertiserId },
                { header: `Gross (${currency})`, value: (r) => (r.grossSpendMinor / 100).toFixed(2) },
                { header: `VAT (${currency})`, value: (r) => (r.vatMinor / 100).toFixed(2) },
                { header: `Total (${currency})`, value: (r) => (r.totalMinor / 100).toFixed(2) },
            ],
            billingRows,
        );
    };

    const kpis: KpiItem[] = [
        { label: 'Gross spend', value: formatMinorAmount(billing?.grossSpendMinor, currency) },
        {
            label: `VAT (${billing?.vatRatePercent ?? 0}%)`,
            value: formatMinorAmount(billing?.vatMinor, currency),
        },
        { label: 'Total billed', value: formatMinorAmount(billing?.totalMinor, currency) },
    ];

    const columns: DataColumn<AdInvoiceDto>[] = [
        {
            key: 'number',
            header: 'Invoice',
            render: (i) => (
                <VStack align="start" gap={0.5} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {i.invoiceNumber}
                    </Text>
                    <Text fontSize="10px" color="gray.500">
                        {adminDate(i.createdAt)}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'advertiser',
            header: 'Advertiser',
            render: (i) => (
                <Text fontSize="xs" color="gray.700" lineClamp={1}>
                    {i.advertiserName}
                </Text>
            ),
        },
        {
            key: 'period',
            header: 'Period',
            render: (i) => (
                <Text fontSize="11px" color="gray.600">
                    {adminDate(i.periodStart)} – {adminDate(i.periodEnd)}
                </Text>
            ),
        },
        {
            key: 'gross',
            header: 'Gross',
            align: 'right',
            render: (i) => (
                <Text fontSize="xs" color="gray.700">
                    {formatMinorAmount(i.grossSpendMinor, i.currency)}
                </Text>
            ),
        },
        {
            key: 'vat',
            header: 'VAT',
            align: 'right',
            render: (i) => (
                <Text fontSize="xs" color="gray.700">
                    {formatMinorAmount(i.vatMinor, i.currency)}
                </Text>
            ),
        },
        {
            key: 'total',
            header: 'Total',
            align: 'right',
            render: (i) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                    {formatMinorAmount(i.totalMinor, i.currency)}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (i) => <StatusBadge status={i.status} />,
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (i) => <InvoiceRowActions invoice={i} canManage={canManage} />,
        },
    ];

    return (
        <AdminPageLayout
            title="Billing & VAT"
            subtitle="Advertiser billing with VAT breakdown, invoiced with a full lifecycle."
            breadcrumbs={[{ label: 'Advertising' }, { label: 'Billing & VAT' }]}
            actions={
                <HStack gap={2}>
                    <Button
                        size="sm"
                        fontSize="xs"
                        variant="outline"
                        borderColor="gray.300"
                        color="gray.700"
                        borderRadius="10px"
                        disabled={billingRows.length === 0}
                        _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                        onClick={exportBillingCsv}
                    >
                        Export CSV
                    </Button>
                    {canManage && (
                        <Button
                            size="sm"
                            fontSize="xs"
                            bg="primary.500"
                            color="white"
                            borderRadius="10px"
                            _hover={{ bg: '#E61E45' }}
                            onClick={() => setGenerating(true)}
                        >
                            Generate invoice
                        </Button>
                    )}
                </HStack>
            }
        >
            {!canView ? (
                <NoAccess />
            ) : (
                <>
                    <FilterBar
                        filters={[
                            {
                                key: 'range',
                                value: preset,
                                onChange: setPreset,
                                options: RANGE_OPTIONS,
                                width: '170px',
                            },
                            {
                                key: 'status',
                                value: invoiceQuery.status ?? 'All',
                                onChange: (v) =>
                                    setInvoiceQuery((q) => ({
                                        ...q,
                                        status: v === 'All' ? undefined : v,
                                        page: 1,
                                    })),
                                options: AD_INVOICE_STATUS_OPTIONS,
                                width: '160px',
                            },
                        ]}
                    />

                    <KpiStrip items={kpis} columns={{ base: 1, md: 3, xl: 3 }} />

                    {error ? (
                        <AdminError error={error} message="Could not load invoices." />
                    ) : isLoading && !data ? (
                        <AdminLoading />
                    ) : (
                        <DataTable
                            columns={columns}
                            rows={data?.items ?? []}
                            rowKey={(i) => i.id}
                            emptyIcon={FiFileText}
                            emptyTitle="No invoices"
                            emptyDescription="No advertiser invoices match the current filters."
                            pagination={
                                data
                                    ? {
                                          page: data.page,
                                          pageSize: data.pageSize,
                                          total: data.total,
                                          onPageChange: (page) =>
                                              setInvoiceQuery((q) => ({ ...q, page })),
                                      }
                                    : undefined
                            }
                        />
                    )}

                    {generating && <GenerateInvoiceDialog onClose={() => setGenerating(false)} />}
                </>
            )}
        </AdminPageLayout>
    );
};

export default BillingVatPage;

/* ------------------------------ Row lifecycle ----------------------------- */

const InvoiceRowActions: React.FC<{ invoice: AdInvoiceDto; canManage: boolean }> = ({
    invoice,
    canManage,
}) => {
    const issue = useIssueInvoice();
    const markPaid = useMarkInvoicePaid();
    const voidInvoice = useVoidInvoice();
    const [voiding, setVoiding] = React.useState(false);

    if (!canManage) return null;

    const canIssue = invoice.status === 'Draft';
    const canMarkPaid = invoice.status === 'Issued';
    const canVoid = invoice.status !== 'Paid' && invoice.status !== 'Void';

    if (!canIssue && !canMarkPaid && !canVoid) return null;

    return (
        <HStack gap={2} justify="flex-end">
            {canIssue && (
                <Button
                    size="xs"
                    fontSize="11px"
                    variant="outline"
                    borderColor="gray.300"
                    color="gray.700"
                    borderRadius="8px"
                    loading={issue.isPending}
                    onClick={() => issue.mutate(invoice.id)}
                >
                    Issue
                </Button>
            )}
            {canMarkPaid && (
                <Button
                    size="xs"
                    fontSize="11px"
                    bg="primary.500"
                    color="white"
                    borderRadius="8px"
                    _hover={{ bg: '#E61E45' }}
                    loading={markPaid.isPending}
                    onClick={() => markPaid.mutate(invoice.id)}
                >
                    Mark paid
                </Button>
            )}
            {canVoid && (
                <Button
                    size="xs"
                    fontSize="11px"
                    variant="outline"
                    borderColor="gray.300"
                    color="#E53E3E"
                    borderRadius="8px"
                    onClick={() => setVoiding(true)}
                >
                    Void
                </Button>
            )}

            {voiding && (
                <ConfirmActionModal
                    isOpen
                    onClose={() => setVoiding(false)}
                    onConfirm={(reason) =>
                        voidInvoice.mutate(
                            { id: invoice.id, payload: { reason: reason || undefined } },
                            { onSuccess: () => setVoiding(false) },
                        )
                    }
                    title="Void invoice"
                    message={`Void ${invoice.invoiceNumber}? This cannot be undone.`}
                    confirmText="Void invoice"
                    tone="danger"
                    requireReason={false}
                    reasonLabel="Reason (optional)"
                    isLoading={voidInvoice.isPending}
                />
            )}
        </HStack>
    );
};

/* ------------------------------ Generate dialog --------------------------- */

const GenerateInvoiceDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const generate = useGenerateInvoice();
    const [advertiserId, setAdvertiserId] = React.useState('');
    const [periodStart, setPeriodStart] = React.useState('');
    const [periodEnd, setPeriodEnd] = React.useState('');

    const valid =
        advertiserId.trim().length > 0 && periodStart.length > 0 && periodEnd.length > 0;

    const submit = () => {
        if (!valid) return;
        generate.mutate(
            { advertiserId: advertiserId.trim(), periodStart, periodEnd },
            { onSuccess: onClose },
        );
    };

    return (
        <Dialog.Root open onOpenChange={(e) => !e.open && onClose()} placement="center">
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content maxW="460px" p={6} borderRadius="20px" position="relative">
                        <IconButton
                            aria-label="Close"
                            variant="ghost"
                            size="sm"
                            color="gray.500"
                            position="absolute"
                            right={3}
                            top={3}
                            onClick={onClose}
                        >
                            <Icon as={MdClose} />
                        </IconButton>
                        <Text
                            fontSize="md"
                            fontWeight="semibold"
                            color="gray.900"
                            fontFamily="Poppins"
                            mb={4}
                        >
                            Generate invoice
                        </Text>
                        <VStack align="stretch" gap={3}>
                            <DialogField label="Advertiser ID">
                                <Input
                                    value={advertiserId}
                                    onChange={(e) => setAdvertiserId(e.target.value)}
                                    size="sm"
                                    placeholder="GUID"
                                />
                            </DialogField>
                            <DialogField label="Period start">
                                <Input
                                    type="date"
                                    value={periodStart}
                                    onChange={(e) => setPeriodStart(e.target.value)}
                                    size="sm"
                                />
                            </DialogField>
                            <DialogField label="Period end">
                                <Input
                                    type="date"
                                    value={periodEnd}
                                    onChange={(e) => setPeriodEnd(e.target.value)}
                                    size="sm"
                                />
                            </DialogField>
                            <HStack gap={3} justify="flex-end" pt={1}>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    borderColor="gray.300"
                                    color="gray.700"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={generate.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submit}
                                    bg="primary.500"
                                    color="white"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={!valid || generate.isPending}
                                    _hover={{ bg: '#E61E45' }}
                                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                >
                                    {generate.isPending ? (
                                        <Spinner size="xs" color="white" />
                                    ) : (
                                        'Generate'
                                    )}
                                </Button>
                            </HStack>
                        </VStack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

const DialogField: React.FC<{ label: string; children: React.ReactNode }> = ({
    label,
    children,
}) => (
    <Box>
        <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
            {label}
        </Text>
        {children}
    </Box>
);
