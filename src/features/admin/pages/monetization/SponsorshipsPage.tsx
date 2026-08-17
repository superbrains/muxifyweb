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
import { FiBriefcase } from 'react-icons/fi';
import { Select } from '@shared/components';
import { useChakraToast } from '@shared/hooks';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    ConfirmActionModal,
    DataTable,
    DetailDrawer,
    FilterBar,
    StatusBadge,
} from '@shared/console';
import type { ActionTone, DataColumn } from '@shared/console';
import { adminDate, adminDateTime, formatMinorAmount } from '@shared/console/lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useActivateSponsorship,
    useApproveSponsorship,
    useCancelSponsorship,
    useCompleteSponsorship,
    useCreateSponsorship,
    useRejectSponsorship,
    useSponsorship,
    useSponsorships,
    useUpdateSponsorship,
} from '../../hooks/useMonetization';
import {
    SPONSORED_CONTENT_TYPE_OPTIONS,
    SPONSORSHIP_STATUS_OPTIONS,
    type CreateSponsorshipRequest,
    type SponsorshipDto,
    type SponsorshipQuery,
} from '../../types/monetization';

const PAGE_SIZE = 20;

type ReasonAction = 'reject' | 'cancel';

/** Sponsorships — list, detail drawer, lifecycle actions and a create/edit dialog. */
const SponsorshipsPage: React.FC = () => {
    const canManage = useHasPermission('SponsorshipsManage');
    const [query, setQuery] = React.useState<SponsorshipQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [creating, setCreating] = React.useState(false);
    const { data, isLoading, error } = useSponsorships(query);

    const columns: DataColumn<SponsorshipDto>[] = [
        {
            key: 'sponsor',
            header: 'Sponsor',
            render: (s) => (
                <VStack align="start" gap={0.5} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {s.sponsorName}
                    </Text>
                    <Text fontSize="10px" color="gray.500" lineClamp={1}>
                        {s.contentType} · {s.contentTitle ?? s.contentId}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'amount',
            header: 'Amount',
            align: 'right',
            render: (s) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                    {formatMinorAmount(s.amountMinor, s.currency)}
                </Text>
            ),
        },
        {
            key: 'window',
            header: 'Window',
            render: (s) => (
                <Text fontSize="11px" color="gray.600">
                    {adminDate(s.startDate)} – {adminDate(s.endDate)}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (s) => <StatusBadge status={s.status} />,
        },
        {
            key: 'created',
            header: 'Created',
            render: (s) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDate(s.createdAt)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Sponsorships"
            subtitle="Brand sponsorships attached to tracks and videos, with a full approval lifecycle."
            breadcrumbs={[{ label: 'Monetization' }, { label: 'Sponsorships' }]}
            actions={
                canManage ? (
                    <Button
                        size="sm"
                        fontSize="xs"
                        bg="primary.500"
                        color="white"
                        borderRadius="10px"
                        _hover={{ bg: '#E61E45' }}
                        onClick={() => setCreating(true)}
                    >
                        New sponsorship
                    </Button>
                ) : undefined
            }
        >
            <FilterBar
                search={{
                    value: query.search ?? '',
                    onChange: (v) => setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                    placeholder: 'Search by sponsor',
                }}
                filters={[
                    {
                        key: 'status',
                        value: query.status ?? 'All',
                        onChange: (v) =>
                            setQuery((q) => ({ ...q, status: v === 'All' ? undefined : v, page: 1 })),
                        options: SPONSORSHIP_STATUS_OPTIONS,
                        width: '160px',
                    },
                    {
                        key: 'contentType',
                        value: query.contentType ?? 'All',
                        onChange: (v) =>
                            setQuery((q) => ({
                                ...q,
                                contentType: v === 'All' ? undefined : v,
                                page: 1,
                            })),
                        options: SPONSORED_CONTENT_TYPE_OPTIONS,
                        width: '150px',
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message="Could not load sponsorships." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(s) => s.id}
                    loading={isLoading && !data}
                    onRowClick={(s) => setSelectedId(s.id)}
                    emptyIcon={FiBriefcase}
                    emptyTitle="No sponsorships"
                    emptyDescription="No sponsorships match the current filters."
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

            <SponsorshipDrawer
                sponsorshipId={selectedId}
                canManage={canManage}
                onClose={() => setSelectedId(null)}
            />

            {creating && <SponsorshipDialog onClose={() => setCreating(false)} />}
        </AdminPageLayout>
    );
};

export default SponsorshipsPage;

/* ------------------------------ Detail drawer ----------------------------- */

const SponsorshipDrawer: React.FC<{
    sponsorshipId: string | null;
    canManage: boolean;
    onClose: () => void;
}> = ({ sponsorshipId, canManage, onClose }) => {
    const { data, isLoading, error } = useSponsorship(sponsorshipId);
    const [reasonAction, setReasonAction] = React.useState<ReasonAction | null>(null);
    const [editing, setEditing] = React.useState(false);

    const approve = useApproveSponsorship();
    const activate = useActivateSponsorship();
    const complete = useCompleteSponsorship();
    const reject = useRejectSponsorship();
    const cancel = useCancelSponsorship();

    const status = data?.status;
    const canApprove = status === 'Pending';
    const canActivate = status === 'Approved';
    const canComplete = status === 'Active';
    const canReject = status === 'Pending' || status === 'Approved';
    const canCancel = status === 'Pending' || status === 'Approved' || status === 'Active';

    const runReason = (reason: string) => {
        if (!sponsorshipId || !reasonAction) return;
        const done = () => setReasonAction(null);
        if (reasonAction === 'reject')
            reject.mutate({ id: sponsorshipId, payload: { reason } }, { onSuccess: done });
        else cancel.mutate({ id: sponsorshipId, payload: { reason } }, { onSuccess: done });
    };

    const REASON_META: Record<ReasonAction, { title: string; confirm: string; tone: ActionTone }> = {
        reject: { title: 'Reject sponsorship', confirm: 'Reject', tone: 'danger' },
        cancel: { title: 'Cancel sponsorship', confirm: 'Cancel sponsorship', tone: 'danger' },
    };

    return (
        <DetailDrawer
            open={sponsorshipId !== null}
            onClose={onClose}
            title={data?.sponsorName ?? 'Sponsorship'}
            subtitle={data ? `${data.contentType} · ${data.contentTitle ?? data.contentId}` : undefined}
            size="md"
            footer={
                canManage && data ? (
                    <HStack gap={2} justify="flex-end" w="100%" flexWrap="wrap">
                        {canReject && (
                            <Button
                                size="sm"
                                fontSize="xs"
                                variant="outline"
                                borderColor="gray.300"
                                color="#E53E3E"
                                borderRadius="10px"
                                onClick={() => setReasonAction('reject')}
                            >
                                Reject
                            </Button>
                        )}
                        {canCancel && (
                            <Button
                                size="sm"
                                fontSize="xs"
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.700"
                                borderRadius="10px"
                                onClick={() => setReasonAction('cancel')}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            size="sm"
                            fontSize="xs"
                            variant="outline"
                            borderColor="gray.300"
                            color="gray.700"
                            borderRadius="10px"
                            onClick={() => setEditing(true)}
                        >
                            Edit
                        </Button>
                        {canApprove && (
                            <Button
                                size="sm"
                                fontSize="xs"
                                bg="primary.500"
                                color="white"
                                borderRadius="10px"
                                _hover={{ bg: '#E61E45' }}
                                loading={approve.isPending}
                                onClick={() => approve.mutate(data.id)}
                            >
                                Approve
                            </Button>
                        )}
                        {canActivate && (
                            <Button
                                size="sm"
                                fontSize="xs"
                                bg="primary.500"
                                color="white"
                                borderRadius="10px"
                                _hover={{ bg: '#E61E45' }}
                                loading={activate.isPending}
                                onClick={() => activate.mutate(data.id)}
                            >
                                Activate
                            </Button>
                        )}
                        {canComplete && (
                            <Button
                                size="sm"
                                fontSize="xs"
                                bg="primary.500"
                                color="white"
                                borderRadius="10px"
                                _hover={{ bg: '#E61E45' }}
                                loading={complete.isPending}
                                onClick={() => complete.mutate(data.id)}
                            >
                                Complete
                            </Button>
                        )}
                    </HStack>
                ) : undefined
            }
        >
            {error ? (
                <AdminError error={error} message="Could not load this sponsorship." />
            ) : isLoading || !data ? (
                <AdminLoading />
            ) : (
                <VStack align="stretch" gap={4}>
                    <StatusBadge status={data.status} />
                    <DetailRow label="Amount" value={formatMinorAmount(data.amountMinor, data.currency)} />
                    <DetailRow label="Sponsor contact" value={data.sponsorContact ?? '—'} />
                    <DetailRow label="Content owner" value={data.ownerName ?? data.contentOwnerUserId} />
                    <DetailRow label="Start" value={adminDate(data.startDate)} />
                    <DetailRow label="End" value={adminDate(data.endDate)} />
                    <DetailRow label="Submitted by" value={data.submittedByUserId} />
                    {data.reviewedByUserId && (
                        <DetailRow
                            label="Reviewed"
                            value={`${data.reviewedByUserId} · ${adminDateTime(data.reviewedAt)}`}
                        />
                    )}
                    {data.decisionReason && (
                        <DetailRow label="Decision reason" value={data.decisionReason} />
                    )}
                    {data.notes && <DetailRow label="Notes" value={data.notes} />}
                </VStack>
            )}

            {reasonAction && (
                <ConfirmActionModal
                    isOpen
                    onClose={() => setReasonAction(null)}
                    onConfirm={runReason}
                    title={REASON_META[reasonAction].title}
                    confirmText={REASON_META[reasonAction].confirm}
                    tone={REASON_META[reasonAction].tone}
                    isLoading={reject.isPending || cancel.isPending}
                />
            )}

            {editing && data && (
                <SponsorshipDialog existing={data} onClose={() => setEditing(false)} />
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

/* ------------------------------ Create / edit ----------------------------- */

const SponsorshipDialog: React.FC<{ existing?: SponsorshipDto; onClose: () => void }> = ({
    existing,
    onClose,
}) => {
    const toast = useChakraToast();
    const create = useCreateSponsorship();
    const update = useUpdateSponsorship();
    const isEdit = !!existing;

    const [contentType, setContentType] = React.useState(existing?.contentType ?? 'Track');
    const [contentId, setContentId] = React.useState(existing?.contentId ?? '');
    const [contentOwnerUserId, setContentOwnerUserId] = React.useState(
        existing?.contentOwnerUserId ?? '',
    );
    const [sponsorName, setSponsorName] = React.useState(existing?.sponsorName ?? '');
    const [sponsorContact, setSponsorContact] = React.useState(existing?.sponsorContact ?? '');
    const [amountMajor, setAmountMajor] = React.useState(
        existing ? String(existing.amountMinor / 100) : '',
    );
    const [startDate, setStartDate] = React.useState(existing?.startDate?.slice(0, 10) ?? '');
    const [endDate, setEndDate] = React.useState(existing?.endDate?.slice(0, 10) ?? '');
    const [notes, setNotes] = React.useState(existing?.notes ?? '');

    const amountMinor = Math.round((parseFloat(amountMajor) || 0) * 100);
    const valid = isEdit
        ? sponsorName.trim().length > 0 && amountMinor > 0
        : sponsorName.trim().length > 0 &&
          contentId.trim().length > 0 &&
          contentOwnerUserId.trim().length > 0 &&
          amountMinor > 0;

    const submit = () => {
        if (!valid) {
            toast.error('Missing fields', 'Sponsor name, content and a positive amount are required.');
            return;
        }
        if (isEdit && existing) {
            update.mutate(
                {
                    id: existing.id,
                    payload: {
                        sponsorName: sponsorName.trim(),
                        sponsorContact: sponsorContact.trim() || null,
                        amountMinor,
                        startDate: startDate || null,
                        endDate: endDate || null,
                        notes: notes.trim() || null,
                    },
                },
                { onSuccess: onClose },
            );
        } else {
            const payload: CreateSponsorshipRequest = {
                contentType,
                contentId: contentId.trim(),
                contentOwnerUserId: contentOwnerUserId.trim(),
                sponsorName: sponsorName.trim(),
                sponsorContact: sponsorContact.trim() || null,
                amountMinor,
                startDate: startDate || null,
                endDate: endDate || null,
                notes: notes.trim() || null,
            };
            create.mutate(payload, { onSuccess: onClose });
        }
    };

    const pending = create.isPending || update.isPending;

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
                            {isEdit ? 'Edit sponsorship' : 'New sponsorship'}
                        </Text>
                        <VStack align="stretch" gap={3}>
                            {!isEdit && (
                                <SimpleGrid columns={2} gap={3}>
                                    <DialogField label="Content type">
                                        <Select
                                            options={SPONSORED_CONTENT_TYPE_OPTIONS.filter(
                                                (o) => o.value !== 'All',
                                            )}
                                            value={contentType}
                                            onChange={(v) => setContentType(v as string)}
                                            width="100%"
                                        />
                                    </DialogField>
                                    <DialogField label="Content ID">
                                        <Input
                                            value={contentId}
                                            onChange={(e) => setContentId(e.target.value)}
                                            size="sm"
                                            placeholder="GUID"
                                        />
                                    </DialogField>
                                </SimpleGrid>
                            )}
                            {!isEdit && (
                                <DialogField label="Content owner user ID">
                                    <Input
                                        value={contentOwnerUserId}
                                        onChange={(e) => setContentOwnerUserId(e.target.value)}
                                        size="sm"
                                        placeholder="GUID"
                                    />
                                </DialogField>
                            )}
                            <SimpleGrid columns={2} gap={3}>
                                <DialogField label="Sponsor name">
                                    <Input
                                        value={sponsorName}
                                        onChange={(e) => setSponsorName(e.target.value)}
                                        size="sm"
                                    />
                                </DialogField>
                                <DialogField label="Sponsor contact">
                                    <Input
                                        value={sponsorContact}
                                        onChange={(e) => setSponsorContact(e.target.value)}
                                        size="sm"
                                        placeholder="Email / phone"
                                    />
                                </DialogField>
                            </SimpleGrid>
                            <DialogField label="Amount (major units)">
                                <Input
                                    type="number"
                                    value={amountMajor}
                                    onChange={(e) => setAmountMajor(e.target.value)}
                                    size="sm"
                                    placeholder="e.g. 50000"
                                />
                            </DialogField>
                            <SimpleGrid columns={2} gap={3}>
                                <DialogField label="Start date">
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        size="sm"
                                    />
                                </DialogField>
                                <DialogField label="End date">
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        size="sm"
                                    />
                                </DialogField>
                            </SimpleGrid>
                            <DialogField label="Notes">
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    fontSize="xs"
                                    resize="none"
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
                                    disabled={pending}
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
                                    disabled={!valid || pending}
                                    _hover={{ bg: '#E61E45' }}
                                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                >
                                    {pending ? <Spinner size="xs" color="white" /> : isEdit ? 'Save' : 'Create'}
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
