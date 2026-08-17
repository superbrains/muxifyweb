import React from 'react';
import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import { FiCreditCard, FiDownload } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    DataTable,
    DetailDrawer,
    FilterBar,
    IdentityCell,
    KpiStrip,
    MetaGrid,
    StatusBadge,
} from '@shared/console';
import type { DataColumn, KpiItem, MetaField } from '@shared/console';
import { ActionDialog } from '../../components/finance/ActionDialog';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { exportCsv } from '@shared/console/lib/exportCsv';
import { adminDate, adminDateTime } from '@shared/console/lib/format';
import { financeStatusStyle } from '../../lib/financeStatusColor';
import {
    useDeactivatePayoutAccount,
    useDeletePayoutAccount,
    useForceVerifyPayoutAccount,
    usePayoutAccounts,
    usePayoutAccountSummary,
    useReactivatePayoutAccount,
    useSetDefaultPayoutAccount,
} from '../../hooks/useFinance';
import type { PayoutAccountDto, PayoutAccountQuery } from '../../types/finance';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Failed', label: 'Failed' },
];

type ActionKind = 'setDefault' | 'forceVerify' | 'deactivate' | 'reactivate' | 'delete';

function actionsForStatus(
    a: PayoutAccountDto,
    onAct: (id: string, kind: ActionKind) => void,
    size: 'xs' | 'sm' = 'xs',
) {
    const btn = (label: string, kind: ActionKind, danger?: boolean) => (
        <Button
            key={kind}
            size={size}
            variant="outline"
            borderColor={danger ? '#FECACA' : 'gray.200'}
            color={danger ? '#C53030' : 'gray.700'}
            borderRadius="md"
            fontSize="11px"
            onClick={(e) => {
                e.stopPropagation();
                onAct(a.id, kind);
            }}
        >
            {label}
        </Button>
    );
    const out: React.ReactNode[] = [];
    if (a.status === 'Active' && !a.isDefault) out.push(btn('Set default', 'setDefault'));
    if (a.status === 'Pending' || a.status === 'Failed') out.push(btn('Verify', 'forceVerify'));
    if (a.status === 'Active') out.push(btn('Deactivate', 'deactivate', true));
    if (a.status === 'Inactive') out.push(btn('Reactivate', 'reactivate'));
    out.push(btn('Delete', 'delete', true));
    return out;
}

/** Saved creator payout (bank) accounts — review verification state and manage them. */
const AccountsPage: React.FC = () => {
    const [query, setQuery] = React.useState<PayoutAccountQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [action, setAction] = React.useState<{ id: string; kind: ActionKind } | null>(null);
    const [selected, setSelected] = React.useState<PayoutAccountDto | null>(null);

    const { data, isLoading, error } = usePayoutAccounts(query);
    const { data: summary } = usePayoutAccountSummary();

    const setDefault = useSetDefaultPayoutAccount();
    const forceVerify = useForceVerifyPayoutAccount();
    const deactivate = useDeactivatePayoutAccount();
    const reactivate = useReactivatePayoutAccount();
    const del = useDeletePayoutAccount();
    const pending =
        setDefault.isPending ||
        forceVerify.isPending ||
        deactivate.isPending ||
        reactivate.isPending ||
        del.isPending;

    const patch = (next: Partial<PayoutAccountQuery>) =>
        setQuery((q) => ({ ...q, ...next, page: 1 }));
    const close = () => setAction(null);
    const onAct = (id: string, kind: ActionKind) => setAction({ id, kind });

    const kpis: KpiItem[] = [
        { label: 'Active', value: summary?.active ?? 0, tone: 'success' },
        { label: 'Pending', value: summary?.pending ?? 0, tone: 'info' },
        { label: 'Inactive', value: summary?.inactive ?? 0, tone: 'neutral' },
        { label: 'Failed', value: summary?.failed ?? 0, tone: 'danger' },
        { label: 'Default accounts', value: summary?.defaultCount ?? 0 },
    ];

    const columns: DataColumn<PayoutAccountDto>[] = [
        {
            key: 'artist',
            header: 'Owner',
            render: (a) => (
                <IdentityCell name={a.artistName ?? '—'} secondary={a.nickname ?? undefined} size="xs" />
            ),
        },
        {
            key: 'bank',
            header: 'Bank',
            render: (a) => (
                <Text fontSize="xs" color="gray.700">
                    {a.bankName}
                </Text>
            ),
        },
        {
            key: 'accountName',
            header: 'Account name',
            render: (a) => (
                <Text fontSize="xs" color="gray.700">
                    {a.accountName}
                </Text>
            ),
        },
        {
            key: 'accountNumber',
            header: 'Account number',
            render: (a) => (
                <Text fontSize="xs" color="gray.600" fontFamily="mono">
                    {a.accountNumber ? `••••${a.accountNumber.slice(-4)}` : '—'}
                </Text>
            ),
        },
        {
            key: 'default',
            header: 'Default',
            render: (a) =>
                a.isDefault ? (
                    <StatusBadge status="Active" label="Default" />
                ) : (
                    <Text fontSize="xs" color="gray.400">
                        —
                    </Text>
                ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (a) => <StatusBadge style={financeStatusStyle(a.status)} />,
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (a) => (
                <HStack gap={1.5} justify="flex-end">
                    {actionsForStatus(a, onAct)}
                </HStack>
            ),
        },
    ];

    const onExport = () =>
        exportCsv<PayoutAccountDto>(
            'payout-accounts',
            [
                { header: 'Owner', value: (a) => a.artistName ?? '' },
                { header: 'Nickname', value: (a) => a.nickname ?? '' },
                { header: 'Bank', value: (a) => a.bankName },
                { header: 'Bank code', value: (a) => a.bankCode },
                { header: 'Account name', value: (a) => a.accountName },
                { header: 'Account number', value: (a) => a.accountNumber },
                { header: 'Currency', value: (a) => a.currency },
                { header: 'Default', value: (a) => (a.isDefault ? 'Yes' : 'No') },
                { header: 'Status', value: (a) => a.status },
                { header: 'Verified', value: (a) => a.verifiedAt ?? '' },
                { header: 'Last used', value: (a) => a.lastUsedAt ?? '' },
                { header: 'Created', value: (a) => a.createdAt },
            ],
            data?.items ?? [],
        );

    const metaFields: MetaField[] = selected
        ? [
              { label: 'Owner', value: selected.artistName },
              { label: 'Nickname', value: selected.nickname },
              { label: 'Bank', value: selected.bankName },
              { label: 'Bank code', value: selected.bankCode },
              { label: 'Account name', value: selected.accountName },
              { label: 'Account number', value: selected.accountNumber },
              { label: 'Currency', value: selected.currency },
              { label: 'Default', value: selected.isDefault ? 'Yes' : 'No', hideWhenEmpty: false },
              { label: 'Verified', value: adminDate(selected.verifiedAt) },
              { label: 'Last used', value: adminDateTime(selected.lastUsedAt) },
              { label: 'Created', value: adminDateTime(selected.createdAt) },
          ]
        : [];

    return (
        <AdminPageLayout
            title="Payout Accounts"
            subtitle="Bank/payout destinations saved by creators and their verification state."
            breadcrumbs={[{ label: 'Payouts' }, { label: 'Accounts' }]}
            actions={
                <Button
                    size="sm"
                    variant="outline"
                    borderColor="gray.200"
                    color="gray.700"
                    borderRadius="lg"
                    fontSize="xs"
                    onClick={onExport}
                >
                    <FiDownload /> Export CSV
                </Button>
            }
        >
            <KpiStrip items={kpis} />

            <FilterBar
                search={{
                    value: query.search ?? '',
                    onChange: (v) => patch({ search: v || undefined }),
                    placeholder: 'Search owner, bank or account',
                }}
                filters={[
                    {
                        key: 'status',
                        value: query.status ?? 'All',
                        onChange: (v) => patch({ status: v === 'All' ? undefined : v }),
                        options: STATUS_OPTIONS,
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message={getApiErrorMessage(error)} />
            ) : (
                <DataTable<PayoutAccountDto>
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(a) => a.id}
                    onRowClick={setSelected}
                    loading={isLoading && !data}
                    emptyIcon={FiCreditCard}
                    emptyTitle="No payout accounts"
                    emptyDescription="No payout accounts match the current filters."
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

            <DetailDrawer
                open={selected !== null}
                onClose={() => setSelected(null)}
                title={selected?.accountName ?? 'Payout account'}
                subtitle={selected ? `${selected.bankName} · ${selected.artistName ?? 'Creator'}` : undefined}
                footer={
                    selected ? (
                        <HStack gap={2} justify="flex-end" w="100%" flexWrap="wrap">
                            {actionsForStatus(selected, onAct, 'sm')}
                        </HStack>
                    ) : undefined
                }
            >
                {selected && (
                    <VStack align="stretch" gap={5}>
                        <HStack gap={2}>
                            <StatusBadge style={financeStatusStyle(selected.status)} size="md" />
                            {selected.isDefault && <StatusBadge status="Active" label="Default" />}
                        </HStack>
                        <MetaGrid fields={metaFields} />
                    </VStack>
                )}
            </DetailDrawer>

            <ActionDialog
                isOpen={action?.kind === 'setDefault'}
                onClose={close}
                title="Set as default"
                description="Makes this the default payout destination for the creator."
                confirmLabel="Set default"
                isLoading={pending}
                onConfirm={() => action && setDefault.mutate({ id: action.id }, { onSuccess: close })}
            />
            <ActionDialog
                isOpen={action?.kind === 'forceVerify'}
                onClose={close}
                title="Force verify account"
                description="Marks the account active without a gateway re-check. Use when bank details are confirmed out-of-band."
                confirmLabel="Verify"
                optionalFields={[{ key: 'note', label: 'Note (optional)' }]}
                isLoading={pending}
                onConfirm={({ fields }) =>
                    action && forceVerify.mutate({ id: action.id, note: fields.note || undefined }, { onSuccess: close })
                }
            />
            <ActionDialog
                isOpen={action?.kind === 'deactivate'}
                onClose={close}
                title="Deactivate account"
                description="Marks the account inactive. If it was the default, another active account is promoted."
                confirmLabel="Deactivate"
                reasonLabel="Reason"
                danger
                isLoading={pending}
                onConfirm={({ reason }) =>
                    action && deactivate.mutate({ id: action.id, reason }, { onSuccess: close })
                }
            />
            <ActionDialog
                isOpen={action?.kind === 'reactivate'}
                onClose={close}
                title="Reactivate account"
                description="Returns an inactive account to active."
                confirmLabel="Reactivate"
                isLoading={pending}
                onConfirm={() => action && reactivate.mutate({ id: action.id }, { onSuccess: close })}
            />
            <ActionDialog
                isOpen={action?.kind === 'delete'}
                onClose={close}
                title="Delete account"
                description="Permanently removes this payout account. If it was the default, another active account is promoted."
                confirmLabel="Delete"
                reasonLabel="Reason"
                danger
                isLoading={pending}
                onConfirm={({ reason }) =>
                    action && del.mutate({ id: action.id, reason }, { onSuccess: close })
                }
            />
        </AdminPageLayout>
    );
};

export default AccountsPage;
