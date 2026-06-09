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
    SimpleGrid,
    Spinner,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { FiAlertCircle } from 'react-icons/fi';
import { Select } from '@shared/components';
import { useChakraToast } from '@shared/hooks';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    AuditTimeline,
    ConfirmActionModal,
    DataTable,
    DetailDrawer,
    FilterBar,
    StatusBadge,
} from '../../components/ui';
import type { AuditEntry, DataColumn } from '../../components/ui';
import { adminDate, adminDateTime, formatMinorAmount } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useAddDisputeNote,
    useAssignDispute,
    useDispute,
    useDisputes,
    useOpenDispute,
    useRejectDispute,
    useResolveDispute,
    useSetDisputeStatus,
} from '../../hooks/useMonetization';
import {
    DISPUTE_STATUS_OPTIONS,
    DISPUTE_SUBJECT_TYPE_OPTIONS,
    DISPUTE_TYPE_OPTIONS,
    type CreateDisputeRequest,
    type DisputeListItemDto,
    type DisputeQuery,
} from '../../types/monetization';

const PAGE_SIZE = 20;

/** Refunds & disputes — case list, detail drawer with event timeline, workflow actions and an open-case dialog. */
const DisputesPage: React.FC = () => {
    const canManage = useHasPermission('DisputesManage');
    const [query, setQuery] = React.useState<DisputeQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [opening, setOpening] = React.useState(false);
    const { data, isLoading, error } = useDisputes(query);

    const columns: DataColumn<DisputeListItemDto>[] = [
        {
            key: 'ref',
            header: 'Reference',
            render: (d) => (
                <VStack align="start" gap={0.5} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {d.reference}
                    </Text>
                    <Text fontSize="10px" color="gray.500">
                        {d.subjectType}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            render: (d) => (
                <Text fontSize="xs" color="gray.700">
                    {d.type}
                </Text>
            ),
        },
        {
            key: 'amount',
            header: 'Amount',
            align: 'right',
            render: (d) =>
                d.amountMinor != null ? (
                    <Text fontSize="xs" color="gray.700">
                        {formatMinorAmount(d.amountMinor, d.currency ?? 'NGN')}
                    </Text>
                ) : (
                    <Text fontSize="11px" color="gray.400">
                        —
                    </Text>
                ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (d) => <StatusBadge status={d.status} />,
        },
        {
            key: 'created',
            header: 'Opened',
            render: (d) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDate(d.createdAt)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Refunds & Disputes"
            subtitle="Case management for refunds, chargebacks, reversals and complaints."
            breadcrumbs={[{ label: 'Monetization' }, { label: 'Refunds & Disputes' }]}
            actions={
                canManage ? (
                    <Button
                        size="sm"
                        fontSize="xs"
                        bg="primary.500"
                        color="white"
                        borderRadius="10px"
                        _hover={{ bg: '#E61E45' }}
                        onClick={() => setOpening(true)}
                    >
                        Open case
                    </Button>
                ) : undefined
            }
        >
            <FilterBar
                search={{
                    value: query.search ?? '',
                    onChange: (v) => setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                    placeholder: 'Search by reference',
                }}
                filters={[
                    {
                        key: 'status',
                        value: query.status ?? 'All',
                        onChange: (v) =>
                            setQuery((q) => ({ ...q, status: v === 'All' ? undefined : v, page: 1 })),
                        options: DISPUTE_STATUS_OPTIONS,
                        width: '150px',
                    },
                    {
                        key: 'type',
                        value: query.type ?? 'All',
                        onChange: (v) =>
                            setQuery((q) => ({ ...q, type: v === 'All' ? undefined : v, page: 1 })),
                        options: DISPUTE_TYPE_OPTIONS,
                        width: '140px',
                    },
                    {
                        key: 'subjectType',
                        value: query.subjectType ?? 'All',
                        onChange: (v) =>
                            setQuery((q) => ({
                                ...q,
                                subjectType: v === 'All' ? undefined : v,
                                page: 1,
                            })),
                        options: DISPUTE_SUBJECT_TYPE_OPTIONS,
                        width: '150px',
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message="Could not load disputes." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(d) => d.id}
                    loading={isLoading && !data}
                    onRowClick={(d) => setSelectedId(d.id)}
                    emptyIcon={FiAlertCircle}
                    emptyTitle="No cases"
                    emptyDescription="No disputes match the current filters."
                    pagination={
                        data
                            ? {
                                  page: data.page,
                                  pageSize: data.pageSize,
                                  total: data.total,
                                  onPageChange: (page) => setQuery((q) => ({ ...q, page })),
                              }
                            : undefined
                    }
                />
            )}

            <DisputeDrawer
                disputeId={selectedId}
                canManage={canManage}
                onClose={() => setSelectedId(null)}
            />

            {opening && <OpenCaseDialog onClose={() => setOpening(false)} />}
        </AdminPageLayout>
    );
};

export default DisputesPage;

/* ------------------------------ Detail drawer ----------------------------- */

type DrawerForm = 'assign' | 'status' | 'note' | 'resolve' | null;

const DisputeDrawer: React.FC<{
    disputeId: string | null;
    canManage: boolean;
    onClose: () => void;
}> = ({ disputeId, canManage, onClose }) => {
    const { data, isLoading, error } = useDispute(disputeId);
    const [form, setForm] = React.useState<DrawerForm>(null);
    const [rejecting, setRejecting] = React.useState(false);

    const assign = useAssignDispute();
    const setStatus = useSetDisputeStatus();
    const addNote = useAddDisputeNote();
    const resolve = useResolveDispute();
    const reject = useRejectDispute();

    // Inline form fields (reset whenever the active form changes).
    const [assigneeUserId, setAssigneeUserId] = React.useState('');
    const [statusValue, setStatusValue] = React.useState('UnderReview');
    const [note, setNote] = React.useState('');
    const [resolutionNotes, setResolutionNotes] = React.useState('');
    const [linkedTransactionId, setLinkedTransactionId] = React.useState('');

    React.useEffect(() => {
        setAssigneeUserId('');
        setNote('');
        setResolutionNotes('');
        setLinkedTransactionId('');
    }, [form]);

    const events: AuditEntry[] = (data?.events ?? []).map((e) => ({
        id: e.id,
        action: e.action,
        actor: e.actorUserId,
        timestamp: e.createdAt,
        detail: e.note ?? undefined,
    }));

    const submitForm = () => {
        if (!disputeId) return;
        const done = () => setForm(null);
        if (form === 'assign')
            assign.mutate(
                { id: disputeId, payload: { assigneeUserId: assigneeUserId.trim(), note: note.trim() || null } },
                { onSuccess: done },
            );
        else if (form === 'status')
            setStatus.mutate(
                { id: disputeId, payload: { status: statusValue, note: note.trim() || null } },
                { onSuccess: done },
            );
        else if (form === 'note')
            addNote.mutate({ id: disputeId, payload: { note: note.trim() } }, { onSuccess: done });
        else if (form === 'resolve')
            resolve.mutate(
                {
                    id: disputeId,
                    payload: {
                        resolutionNotes: resolutionNotes.trim(),
                        linkedTransactionId: linkedTransactionId.trim() || null,
                    },
                },
                { onSuccess: done },
            );
    };

    const formPending = assign.isPending || setStatus.isPending || addNote.isPending || resolve.isPending;

    const STATUS_VALUES = DISPUTE_STATUS_OPTIONS.filter((o) => o.value !== 'All');

    return (
        <DetailDrawer
            open={disputeId !== null}
            onClose={onClose}
            title={data?.reference ?? 'Dispute'}
            subtitle={data ? `${data.type} · ${data.subjectType}` : undefined}
            size="lg"
            footer={
                canManage && data ? (
                    <HStack gap={2} justify="flex-end" w="100%" flexWrap="wrap">
                        <Button
                            size="sm"
                            fontSize="xs"
                            variant="outline"
                            borderColor="gray.300"
                            color="#E53E3E"
                            borderRadius="10px"
                            onClick={() => setRejecting(true)}
                        >
                            Reject
                        </Button>
                        <Button
                            size="sm"
                            fontSize="xs"
                            variant="outline"
                            borderColor="gray.300"
                            color="gray.700"
                            borderRadius="10px"
                            onClick={() => setForm('assign')}
                        >
                            Assign
                        </Button>
                        <Button
                            size="sm"
                            fontSize="xs"
                            variant="outline"
                            borderColor="gray.300"
                            color="gray.700"
                            borderRadius="10px"
                            onClick={() => setForm('note')}
                        >
                            Add note
                        </Button>
                        <Button
                            size="sm"
                            fontSize="xs"
                            variant="outline"
                            borderColor="gray.300"
                            color="gray.700"
                            borderRadius="10px"
                            onClick={() => setForm('status')}
                        >
                            Status
                        </Button>
                        <Button
                            size="sm"
                            fontSize="xs"
                            bg="primary.500"
                            color="white"
                            borderRadius="10px"
                            _hover={{ bg: '#E61E45' }}
                            onClick={() => setForm('resolve')}
                        >
                            Resolve
                        </Button>
                    </HStack>
                ) : undefined
            }
        >
            {error ? (
                <AdminError error={error} message="Could not load this case." />
            ) : isLoading || !data ? (
                <AdminLoading />
            ) : (
                <VStack align="stretch" gap={4}>
                    <StatusBadge status={data.status} />
                    {data.amountMinor != null && (
                        <DetailRow
                            label="Amount"
                            value={formatMinorAmount(data.amountMinor, data.currency ?? 'NGN')}
                        />
                    )}
                    <DetailRow label="Raised by" value={data.raisedByUserId} />
                    {data.againstUserId && <DetailRow label="Against" value={data.againstUserId} />}
                    {data.assignedToUserId && (
                        <DetailRow label="Assigned to" value={data.assignedToUserId} />
                    )}
                    {data.subjectId && <DetailRow label="Subject ID" value={data.subjectId} />}
                    {data.description && <DetailRow label="Description" value={data.description} />}
                    {data.resolutionNotes && (
                        <DetailRow
                            label="Resolution"
                            value={`${data.resolutionNotes} (${adminDateTime(data.resolvedAt)})`}
                        />
                    )}
                    {data.linkedTransactionId && (
                        <DetailRow label="Linked txn" value={data.linkedTransactionId} />
                    )}

                    {/* Inline workflow form */}
                    {form && (
                        <Box bg="gray.50" borderRadius="lg" p={3}>
                            <VStack align="stretch" gap={2}>
                                {form === 'assign' && (
                                    <Input
                                        value={assigneeUserId}
                                        onChange={(e) => setAssigneeUserId(e.target.value)}
                                        size="sm"
                                        fontSize="11px"
                                        placeholder="Assignee user ID"
                                    />
                                )}
                                {form === 'status' && (
                                    <Select
                                        options={STATUS_VALUES}
                                        value={statusValue}
                                        onChange={(v) => setStatusValue(v as string)}
                                        width="100%"
                                    />
                                )}
                                {form === 'resolve' && (
                                    <>
                                        <Textarea
                                            value={resolutionNotes}
                                            onChange={(e) => setResolutionNotes(e.target.value)}
                                            rows={2}
                                            fontSize="11px"
                                            resize="none"
                                            placeholder="Resolution notes"
                                        />
                                        <Input
                                            value={linkedTransactionId}
                                            onChange={(e) => setLinkedTransactionId(e.target.value)}
                                            size="sm"
                                            fontSize="11px"
                                            placeholder="Linked transaction ID (optional)"
                                        />
                                    </>
                                )}
                                {form !== 'resolve' && (
                                    <Textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        rows={2}
                                        fontSize="11px"
                                        resize="none"
                                        placeholder={form === 'note' ? 'Note' : 'Note (optional)'}
                                    />
                                )}
                                <HStack gap={2} justify="flex-end">
                                    <Button
                                        size="xs"
                                        fontSize="11px"
                                        variant="ghost"
                                        color="gray.600"
                                        onClick={() => setForm(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="xs"
                                        fontSize="11px"
                                        bg="primary.500"
                                        color="white"
                                        borderRadius="8px"
                                        _hover={{ bg: '#E61E45' }}
                                        loading={formPending}
                                        onClick={submitForm}
                                    >
                                        Submit
                                    </Button>
                                </HStack>
                            </VStack>
                        </Box>
                    )}

                    <Box>
                        <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={2}>
                            Case timeline
                        </Text>
                        <AuditTimeline entries={events} />
                    </Box>
                </VStack>
            )}

            {rejecting && (
                <ConfirmActionModal
                    isOpen
                    onClose={() => setRejecting(false)}
                    onConfirm={(reason) => {
                        if (!disputeId) return;
                        reject.mutate(
                            { id: disputeId, payload: { reason } },
                            { onSuccess: () => setRejecting(false) },
                        );
                    }}
                    title="Reject case"
                    confirmText="Reject"
                    tone="danger"
                    isLoading={reject.isPending}
                />
            )}
        </DetailDrawer>
    );
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <HStack justify="space-between" align="flex-start" gap={4}>
        <Text fontSize="11px" color="gray.500" flexShrink={0}>
            {label}
        </Text>
        <Text fontSize="xs" color="gray.800" textAlign="right" wordBreak="break-word">
            {value}
        </Text>
    </HStack>
);

/* -------------------------------- Open case ------------------------------- */

const OpenCaseDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const toast = useChakraToast();
    const open = useOpenDispute();

    const [subjectType, setSubjectType] = React.useState('CoinPurchase');
    const [subjectId, setSubjectId] = React.useState('');
    const [type, setType] = React.useState('Refund');
    const [raisedByUserId, setRaisedByUserId] = React.useState('');
    const [againstUserId, setAgainstUserId] = React.useState('');
    const [amountMajor, setAmountMajor] = React.useState('');
    const [description, setDescription] = React.useState('');

    const amountMinor = amountMajor ? Math.round((parseFloat(amountMajor) || 0) * 100) : undefined;
    const valid = raisedByUserId.trim().length > 0 && description.trim().length >= 10;

    const submit = () => {
        if (!valid) {
            toast.error('Missing fields', 'A raised-by user and a 10+ character description are required.');
            return;
        }
        const payload: CreateDisputeRequest = {
            subjectType,
            subjectId: subjectId.trim() || null,
            type,
            raisedByUserId: raisedByUserId.trim(),
            description: description.trim(),
            againstUserId: againstUserId.trim() || null,
            amountMinor: amountMinor,
        };
        open.mutate(payload, { onSuccess: onClose });
    };

    return (
        <Dialog.Root open onOpenChange={(e) => !e.open && onClose()} placement="center">
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content maxW="520px" p={6} borderRadius="20px" position="relative">
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
                        <Text fontSize="md" fontWeight="semibold" color="gray.900" fontFamily="Poppins" mb={4}>
                            Open a dispute case
                        </Text>
                        <VStack align="stretch" gap={3}>
                            <SimpleGrid columns={2} gap={3}>
                                <DialogField label="Subject type">
                                    <Select
                                        options={DISPUTE_SUBJECT_TYPE_OPTIONS.filter((o) => o.value !== 'All')}
                                        value={subjectType}
                                        onChange={(v) => setSubjectType(v as string)}
                                        width="100%"
                                    />
                                </DialogField>
                                <DialogField label="Type">
                                    <Select
                                        options={DISPUTE_TYPE_OPTIONS.filter((o) => o.value !== 'All')}
                                        value={type}
                                        onChange={(v) => setType(v as string)}
                                        width="100%"
                                    />
                                </DialogField>
                            </SimpleGrid>
                            <DialogField label="Subject ID (optional)">
                                <Input
                                    value={subjectId}
                                    onChange={(e) => setSubjectId(e.target.value)}
                                    size="sm"
                                    placeholder="GUID"
                                />
                            </DialogField>
                            <SimpleGrid columns={2} gap={3}>
                                <DialogField label="Raised by user ID">
                                    <Input
                                        value={raisedByUserId}
                                        onChange={(e) => setRaisedByUserId(e.target.value)}
                                        size="sm"
                                        placeholder="GUID"
                                    />
                                </DialogField>
                                <DialogField label="Against user ID (optional)">
                                    <Input
                                        value={againstUserId}
                                        onChange={(e) => setAgainstUserId(e.target.value)}
                                        size="sm"
                                        placeholder="GUID"
                                    />
                                </DialogField>
                            </SimpleGrid>
                            <DialogField label="Amount (major units, optional)">
                                <Input
                                    type="number"
                                    value={amountMajor}
                                    onChange={(e) => setAmountMajor(e.target.value)}
                                    size="sm"
                                />
                            </DialogField>
                            <DialogField label="Description">
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    fontSize="xs"
                                    resize="none"
                                    placeholder="Explain the dispute — at least 10 characters."
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
                                    disabled={open.isPending}
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
                                    disabled={!valid || open.isPending}
                                    _hover={{ bg: '#E61E45' }}
                                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                >
                                    {open.isPending ? <Spinner size="xs" color="white" /> : 'Open case'}
                                </Button>
                            </HStack>
                        </VStack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

const DialogField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <Box>
        <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
            {label}
        </Text>
        {children}
    </Box>
);
