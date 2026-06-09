import React from 'react';
import { Box, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { FiClipboard } from 'react-icons/fi';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    DataTable,
    DetailDrawer,
    FilterBar,
} from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { adminDateTime } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useAuditTrail } from '../../hooks/useGovernance';
import type { AuditTrailEntryDto, AuditTrailQuery } from '../../types/governance';
import { NoAccess } from './NoAccess';

const PAGE_SIZE = 25;

const TARGET_TYPE_OPTIONS = [
    { value: 'All', label: 'All targets' },
    { value: 'User', label: 'User' },
    { value: 'Track', label: 'Track' },
    { value: 'Campaign', label: 'Campaign' },
    { value: 'Withdrawal', label: 'Withdrawal' },
    { value: 'Role', label: 'Role' },
    { value: 'Invitation', label: 'Invitation' },
    { value: 'Report', label: 'Report' },
    { value: 'Dispute', label: 'Dispute' },
    { value: 'RoyaltySplit', label: 'Royalty split' },
];

const ACTION_OPTIONS = [
    { value: 'All', label: 'All actions' },
    { value: 'Created', label: 'Created' },
    { value: 'Updated', label: 'Updated' },
    { value: 'Deleted', label: 'Deleted' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'Resolved', label: 'Resolved' },
];

/** Pretty-print a JSON string; returns the raw value when it isn't valid JSON. */
const prettyJson = (raw?: string | null): string | null => {
    if (!raw) return null;
    try {
        return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
        return raw;
    }
};

/**
 * Audit Trail — the platform-wide, append-only admin action log
 * (`GET /admin/governance/audit-trail`). Filterable by action, target type and
 * date range; each row opens a drawer with the before/after diff, request
 * metadata and the originating IP/device. Gated on `AuditView`.
 */
const AuditTrailPage: React.FC = () => {
    const canView = useHasPermission('AuditView');
    const [query, setQuery] = React.useState<AuditTrailQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [selected, setSelected] = React.useState<AuditTrailEntryDto | null>(null);

    const { data, isLoading, error } = useAuditTrail(query);

    const columns: DataColumn<AuditTrailEntryDto>[] = [
        {
            key: 'actor',
            header: 'Actor',
            render: (e) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                    {e.actorName}
                </Text>
            ),
        },
        {
            key: 'action',
            header: 'Action',
            render: (e) => (
                <Text fontSize="xs" color="gray.700">
                    {e.action}
                </Text>
            ),
        },
        {
            key: 'target',
            header: 'Target',
            render: (e) => (
                <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="gray.700">
                        {e.targetType}
                    </Text>
                    {e.targetId && (
                        <Text fontSize="10px" color="gray.400" lineClamp={1} maxW="160px">
                            {e.targetId}
                        </Text>
                    )}
                </VStack>
            ),
        },
        {
            key: 'summary',
            header: 'Summary',
            render: (e) => (
                <Text fontSize="xs" color="gray.600" lineClamp={2} maxW="320px">
                    {e.summary}
                </Text>
            ),
        },
        {
            key: 'when',
            header: 'When',
            render: (e) => (
                <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                    {adminDateTime(e.createdAt)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Audit Trail"
            subtitle="Append-only record of every privileged admin action across the platform."
            breadcrumbs={[{ label: 'Support & Governance' }, { label: 'Audit Trail' }]}
        >
            {!canView ? (
                <NoAccess description="This area requires the audit view permission." />
            ) : (
                <>
                    <FilterBar
                        search={{
                            value: query.actorId ?? '',
                            onChange: (v) =>
                                setQuery((q) => ({ ...q, actorId: v || undefined, page: 1 })),
                            placeholder: 'Filter by actor user ID',
                        }}
                        filters={[
                            {
                                key: 'action',
                                value: query.action ?? 'All',
                                onChange: (v) =>
                                    setQuery((q) => ({
                                        ...q,
                                        action: v === 'All' ? undefined : v,
                                        page: 1,
                                    })),
                                options: ACTION_OPTIONS,
                                width: '160px',
                            },
                            {
                                key: 'targetType',
                                value: query.targetType ?? 'All',
                                onChange: (v) =>
                                    setQuery((q) => ({
                                        ...q,
                                        targetType: v === 'All' ? undefined : v,
                                        page: 1,
                                    })),
                                options: TARGET_TYPE_OPTIONS,
                                width: '160px',
                            },
                        ]}
                        right={
                            <HStack gap={2}>
                                <Input
                                    type="date"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    borderColor="gray.200"
                                    value={query.from ?? ''}
                                    onChange={(e) =>
                                        setQuery((q) => ({
                                            ...q,
                                            from: e.target.value || undefined,
                                            page: 1,
                                        }))
                                    }
                                    aria-label="From date"
                                />
                                <Text fontSize="xs" color="gray.400">
                                    to
                                </Text>
                                <Input
                                    type="date"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    borderColor="gray.200"
                                    value={query.to ?? ''}
                                    onChange={(e) =>
                                        setQuery((q) => ({
                                            ...q,
                                            to: e.target.value || undefined,
                                            page: 1,
                                        }))
                                    }
                                    aria-label="To date"
                                />
                            </HStack>
                        }
                    />

                    {error ? (
                        <AdminError error={error} message="Could not load the audit trail." />
                    ) : (
                        <DataTable
                            columns={columns}
                            rows={data?.items ?? []}
                            rowKey={(e) => e.id}
                            loading={isLoading && !data}
                            onRowClick={(e) => setSelected(e)}
                            emptyIcon={FiClipboard}
                            emptyTitle="No audit entries"
                            emptyDescription="No actions match the current filters."
                            pagination={
                                data
                                    ? {
                                          page: data.page,
                                          pageSize: data.pageSize,
                                          total: data.total,
                                          onPageChange: (page) =>
                                              setQuery((q) => ({ ...q, page })),
                                      }
                                    : undefined
                            }
                        />
                    )}

                    <AuditEntryDrawer entry={selected} onClose={() => setSelected(null)} />
                </>
            )}
        </AdminPageLayout>
    );
};

export default AuditTrailPage;

/* ------------------------------ Detail drawer ----------------------------- */

const JsonBlock: React.FC<{ label: string; raw?: string | null }> = ({ label, raw }) => {
    const pretty = prettyJson(raw);
    if (!pretty) return null;
    return (
        <Box>
            <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1}>
                {label}
            </Text>
            <Box
                as="pre"
                bg="gray.50"
                border="1px solid"
                borderColor="gray.100"
                borderRadius="10px"
                p={3}
                fontSize="11px"
                color="gray.800"
                fontFamily="mono"
                whiteSpace="pre-wrap"
                wordBreak="break-word"
                overflowX="auto"
            >
                {pretty}
            </Box>
        </Box>
    );
};

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <HStack justify="space-between" align="flex-start" gap={4}>
        <Text fontSize="11px" color="gray.500" flexShrink={0}>
            {label}
        </Text>
        <Text fontSize="xs" color="gray.800" textAlign="right" wordBreak="break-word">
            {value}
        </Text>
    </HStack>
);

const AuditEntryDrawer: React.FC<{
    entry: AuditTrailEntryDto | null;
    onClose: () => void;
}> = ({ entry, onClose }) => (
    <DetailDrawer
        open={entry !== null}
        onClose={onClose}
        title={entry?.action ?? 'Audit entry'}
        subtitle={entry ? `${entry.actorName} · ${entry.targetType}` : undefined}
        size="md"
    >
        {!entry ? (
            <AdminLoading />
        ) : (
            <VStack align="stretch" gap={4}>
                <Row label="Actor" value={entry.actorName} />
                <Row label="Actor ID" value={entry.actorUserId} />
                <Row label="Action" value={entry.action} />
                <Row label="Target type" value={entry.targetType} />
                {entry.targetId && <Row label="Target ID" value={entry.targetId} />}
                <Row label="Summary" value={entry.summary} />
                <Row label="When" value={adminDateTime(entry.createdAt)} />
                {entry.ipAddress && <Row label="IP address" value={entry.ipAddress} />}
                {entry.userAgent && <Row label="Device" value={entry.userAgent} />}
                <JsonBlock label="Before" raw={entry.beforeJson} />
                <JsonBlock label="After" raw={entry.afterJson} />
                <JsonBlock label="Metadata" raw={entry.metadataJson} />
            </VStack>
        )}
    </DetailDrawer>
);
