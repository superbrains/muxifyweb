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
import { FiAward, FiSlash } from 'react-icons/fi';
import { useChakraToast } from '@shared/hooks';
import {
    AdminEmptyState,
    AdminError,
    AdminLoading,
    AdminPageLayout,
    DataTable,
    FilterBar,
    KpiStrip,
    StatusBadge,
} from '@shared/console';
import type { DataColumn, KpiItem } from '@shared/console';
import { adminDate, formatCount } from '@shared/console/lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useCreateExclusion,
    useDeleteExclusion,
    useLeaderboardConfigs,
    useLeaderboardExclusions,
    useLeaderboardPreview,
    useSetLeaderboardEnabled,
    useUpdateLeaderboardConfig,
} from '../../hooks/useDiscovery';
import {
    DISCOVERY_PERIOD_OPTIONS,
    type AdminLeaderboardConfigDto,
    type AdminLeaderboardExclusionDto,
    type UpsertLeaderboardConfigRequest,
} from '../../types/discovery';
import { LinkBtn } from './discoveryShared';

/**
 * A row in the live preview. The backend preview returns the raw feed/leaderboard
 * DTOs — top-gifters carry userId/displayName, most-gifted-artists carry id/name —
 * so every field is optional.
 */
interface PreviewRow {
    rank?: number;
    userId?: string;
    id?: string;
    displayName?: string | null;
    name?: string | null;
    username?: string | null;
    totalGiftValue?: number;
}

const ACCENT = '#FF2D55';

const ELIGIBILITY_OPTIONS = ['Day', 'Week', 'Month', 'AllTime'];
const MODE_OPTIONS = ['Organic', 'Boosted'];

/** Leaderboard management — configs (enable/disable + edit), exclusions, and a live preview. */
const LeaderboardManagementPage: React.FC = () => {
    const canManage = useHasPermission('LeaderboardManage');
    const { data: configs, isLoading, error } = useLeaderboardConfigs();

    const setEnabled = useSetLeaderboardEnabled();
    const [editing, setEditing] = React.useState<AdminLeaderboardConfigDto | null>(null);
    const [selectedType, setSelectedType] = React.useState<string | null>(null);

    // Default the preview/exclusions panel to the first config once loaded.
    React.useEffect(() => {
        if (!selectedType && configs && configs.length > 0) {
            setSelectedType(configs[0].leaderboardType);
        }
    }, [configs, selectedType]);

    const configColumns: DataColumn<AdminLeaderboardConfigDto>[] = [
        {
            key: 'name',
            header: 'Leaderboard',
            render: (cfg) => (
                <VStack align="start" gap={0.5}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                        {cfg.displayName}
                    </Text>
                    <Text fontSize="10px" color="gray.500">
                        {cfg.leaderboardType}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'eligibility',
            header: 'Eligibility',
            render: (cfg) => (
                <Text fontSize="xs" color="gray.700">
                    {cfg.eligibilityPeriod}
                </Text>
            ),
        },
        {
            key: 'mode',
            header: 'Mode',
            render: (cfg) => (
                <Text fontSize="xs" color="gray.700">
                    {cfg.mode}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (cfg) => <StatusBadge status={cfg.isEnabled ? 'Enabled' : 'Inactive'} />,
        },
        {
            key: 'updated',
            header: 'Updated',
            render: (cfg) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDate(cfg.updatedAt)}
                </Text>
            ),
        },
    ];

    if (canManage) {
        configColumns.push({
            key: 'actions',
            header: '',
            align: 'right',
            render: (cfg) => (
                <HStack gap={3} justify="flex-end">
                    <LinkBtn onClick={() => setSelectedType(cfg.leaderboardType)}>Preview</LinkBtn>
                    <LinkBtn onClick={() => setEditing(cfg)}>Edit</LinkBtn>
                    <LinkBtn
                        color={cfg.isEnabled ? 'gray.500' : '#16A34A'}
                        onClick={() =>
                            setEnabled.mutate({
                                leaderboardType: cfg.leaderboardType,
                                enabled: !cfg.isEnabled,
                            })
                        }
                    >
                        {cfg.isEnabled ? 'Disable' : 'Enable'}
                    </LinkBtn>
                </HStack>
            ),
        });
    } else {
        configColumns.push({
            key: 'actions',
            header: '',
            align: 'right',
            render: (cfg) => <LinkBtn onClick={() => setSelectedType(cfg.leaderboardType)}>Preview</LinkBtn>,
        });
    }

    return (
        <AdminPageLayout
            title="Leaderboard Management"
            subtitle="Configure leaderboards, manage exclusions and preview the live ranking."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Leaderboards' }]}
        >
            {error ? (
                <AdminError error={error} message="Could not load leaderboard configs." />
            ) : isLoading && !configs ? (
                <AdminLoading />
            ) : (
                <VStack align="stretch" gap={4}>
                    <KpiStrip
                        items={
                            [
                                { label: 'Leaderboards', value: configs?.length ?? 0, tone: 'info' },
                                { label: 'Enabled', value: (configs ?? []).filter((c) => c.isEnabled).length, tone: 'success' },
                                { label: 'Disabled', value: (configs ?? []).filter((c) => !c.isEnabled).length, tone: 'neutral' },
                            ] as KpiItem[]
                        }
                        columns={{ base: 3, md: 3, xl: 3 }}
                    />

                    <SectionCard title="Leaderboards">
                        <DataTable
                            columns={configColumns}
                            rows={configs ?? []}
                            rowKey={(cfg) => cfg.leaderboardType}
                            emptyIcon={FiAward}
                            emptyTitle="No leaderboards configured"
                        />
                    </SectionCard>

                    {selectedType && (
                        <SimpleGrid columns={{ base: 1, xl: 2 }} gap={4}>
                            <ExclusionsPanel leaderboardType={selectedType} canManage={canManage} />
                            <PreviewPanel leaderboardType={selectedType} />
                        </SimpleGrid>
                    )}
                </VStack>
            )}

            {editing && <ConfigDialog config={editing} onClose={() => setEditing(null)} />}
        </AdminPageLayout>
    );
};

export default LeaderboardManagementPage;

/* ------------------------------- Exclusions ------------------------------- */

const ExclusionsPanel: React.FC<{ leaderboardType: string; canManage: boolean }> = ({
    leaderboardType,
    canManage,
}) => {
    const { data, isLoading, error } = useLeaderboardExclusions({ leaderboardType });
    const del = useDeleteExclusion();
    const [adding, setAdding] = React.useState(false);

    const columns: DataColumn<AdminLeaderboardExclusionDto>[] = [
        {
            key: 'entity',
            header: 'Entity',
            render: (x) => (
                <VStack align="start" gap={0.5}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {x.entityId}
                    </Text>
                    <Text fontSize="10px" color="gray.500">
                        {x.entityType}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'reason',
            header: 'Reason',
            render: (x) => (
                <Text fontSize="11px" color="gray.600" lineClamp={2}>
                    {x.reason}
                </Text>
            ),
        },
        {
            key: 'added',
            header: 'Added',
            render: (x) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDate(x.createdAt)}
                </Text>
            ),
        },
    ];

    if (canManage) {
        columns.push({
            key: 'actions',
            header: '',
            align: 'right',
            render: (x) => (
                <LinkBtn color="#E53E3E" onClick={() => del.mutate(x.id)}>
                    Remove
                </LinkBtn>
            ),
        });
    }

    return (
        <SectionCard
            title="Exclusions"
            action={
                canManage ? (
                    <Button
                        size="xs"
                        fontSize="11px"
                        variant="outline"
                        borderColor="gray.300"
                        color="gray.700"
                        borderRadius="8px"
                        onClick={() => setAdding(true)}
                    >
                        Add exclusion
                    </Button>
                ) : undefined
            }
        >
            {error ? (
                <AdminError error={error} message="Could not load exclusions." />
            ) : isLoading && !data ? (
                <AdminLoading />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data ?? []}
                    rowKey={(x) => x.id}
                    emptyIcon={FiSlash}
                    emptyTitle="No exclusions"
                    emptyDescription="Everyone is eligible for this leaderboard."
                />
            )}

            {adding && (
                <AddExclusionDialog leaderboardType={leaderboardType} onClose={() => setAdding(false)} />
            )}
        </SectionCard>
    );
};

const ENTITY_TYPE_OPTIONS = ['User', 'Artist', 'RecordLabel'];

const AddExclusionDialog: React.FC<{ leaderboardType: string; onClose: () => void }> = ({
    leaderboardType,
    onClose,
}) => {
    const create = useCreateExclusion();
    const toast = useChakraToast();
    const [entityId, setEntityId] = React.useState('');
    const [entityType, setEntityType] = React.useState('User');
    const [reason, setReason] = React.useState('');

    const valid = entityId.trim().length > 0 && reason.trim().length >= 10;

    const submit = () => {
        if (!valid) {
            toast.error('Missing fields', 'An entity ID and a 10+ character reason are required.');
            return;
        }
        create.mutate(
            {
                leaderboardType,
                entityId: entityId.trim(),
                entityType,
                reason: reason.trim(),
            },
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
                            Add a leaderboard exclusion
                        </Text>
                        <VStack align="stretch" gap={3}>
                            <SimpleGrid columns={2} gap={3}>
                                <Field label="Entity type">
                                    <NativeSelect
                                        value={entityType}
                                        onChange={setEntityType}
                                        options={ENTITY_TYPE_OPTIONS}
                                    />
                                </Field>
                                <Field label="Entity ID">
                                    <Input
                                        value={entityId}
                                        onChange={(e) => setEntityId(e.target.value)}
                                        size="sm"
                                        placeholder="GUID"
                                    />
                                </Field>
                            </SimpleGrid>
                            <Field label="Reason">
                                <Textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    fontSize="xs"
                                    resize="none"
                                    placeholder="Explain why — recorded in the audit log."
                                />
                            </Field>
                            <HStack gap={3} justify="flex-end" pt={1}>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    borderColor="gray.300"
                                    color="gray.700"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={create.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submit}
                                    bg="#E53E3E"
                                    color="white"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={!valid || create.isPending}
                                    _hover={{ bg: '#C53030' }}
                                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                >
                                    {create.isPending ? <Spinner size="xs" color="white" /> : 'Add exclusion'}
                                </Button>
                            </HStack>
                        </VStack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

/* -------------------------------- Preview --------------------------------- */

const PreviewPanel: React.FC<{ leaderboardType: string }> = ({ leaderboardType }) => {
    const [period, setPeriod] = React.useState('Week');
    const { data, isLoading, error } = useLeaderboardPreview(leaderboardType, { period, take: 25 });

    // The preview returns the raw feed/leaderboard rows: top-gifters carry
    // userId/displayName, most-gifted-artists carry id/name. Model loosely.
    const rows = (data ?? []) as PreviewRow[];

    return (
        <SectionCard title="Live preview">
            <FilterBar
                filters={[
                    {
                        key: 'period',
                        value: period,
                        onChange: setPeriod,
                        options: DISCOVERY_PERIOD_OPTIONS,
                    },
                ]}
            />
            <Box mt={3}>
                {error ? (
                    <AdminError error={error} message="Could not load the preview." />
                ) : isLoading && !data ? (
                    <AdminLoading />
                ) : rows.length === 0 ? (
                    <AdminEmptyState
                        icon={FiAward}
                        title="No ranked entries"
                        description="There is no data for this leaderboard in the selected period."
                    />
                ) : (
                    <VStack align="stretch" gap={1.5}>
                        {rows.map((r, i) => (
                            <HStack
                                key={r.userId ?? r.id ?? i}
                                justify="space-between"
                                px={3}
                                py={2}
                                borderRadius="lg"
                                bg="gray.50"
                            >
                                <HStack gap={3} minW={0}>
                                    <Text fontSize="xs" fontWeight="bold" color="gray.500" w="22px">
                                        {r.rank ?? i + 1}
                                    </Text>
                                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                                        {r.displayName ?? r.name ?? r.userId ?? r.id}
                                    </Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.600" flexShrink={0}>
                                    {formatCount(r.totalGiftValue)}
                                </Text>
                            </HStack>
                        ))}
                    </VStack>
                )}
            </Box>
        </SectionCard>
    );
};

/* ----------------------------- Config edit dialog ------------------------- */

const ConfigDialog: React.FC<{ config: AdminLeaderboardConfigDto; onClose: () => void }> = ({
    config,
    onClose,
}) => {
    const update = useUpdateLeaderboardConfig();
    const toast = useChakraToast();

    const [displayName, setDisplayName] = React.useState(config.displayName);
    const [eligibilityPeriod, setEligibilityPeriod] = React.useState(config.eligibilityPeriod);
    const [mode, setMode] = React.useState(config.mode);
    const [isEnabled, setIsEnabled] = React.useState(config.isEnabled);

    const valid = displayName.trim().length > 0;

    const submit = () => {
        if (!valid) {
            toast.error('Missing fields', 'A display name is required.');
            return;
        }
        const payload: UpsertLeaderboardConfigRequest = {
            displayName: displayName.trim(),
            isEnabled,
            eligibilityPeriod,
            mode,
        };
        update.mutate(
            { leaderboardType: config.leaderboardType, payload },
            { onSuccess: onClose },
        );
    };

    return (
        <Dialog.Root open onOpenChange={(e) => !e.open && onClose()} placement="center">
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content maxW="480px" p={6} borderRadius="20px" position="relative">
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
                            Edit {config.leaderboardType}
                        </Text>
                        <VStack align="stretch" gap={3}>
                            <Field label="Display name">
                                <Input
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    size="sm"
                                />
                            </Field>
                            <SimpleGrid columns={2} gap={3}>
                                <Field label="Eligibility period">
                                    <NativeSelect
                                        value={eligibilityPeriod}
                                        onChange={setEligibilityPeriod}
                                        options={ELIGIBILITY_OPTIONS}
                                    />
                                </Field>
                                <Field label="Mode">
                                    <NativeSelect value={mode} onChange={setMode} options={MODE_OPTIONS} />
                                </Field>
                            </SimpleGrid>
                            <HStack gap={2} as="label" cursor="pointer">
                                <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={(e) => setIsEnabled(e.target.checked)}
                                />
                                <Text fontSize="xs" color="gray.700">
                                    Enabled (visible to users)
                                </Text>
                            </HStack>
                            <HStack gap={3} justify="flex-end" pt={1}>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    borderColor="gray.300"
                                    color="gray.700"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={update.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submit}
                                    bg={ACCENT}
                                    color="white"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={!valid || update.isPending}
                                    _hover={{ bg: '#E61E45' }}
                                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                >
                                    {update.isPending ? <Spinner size="xs" color="white" /> : 'Save'}
                                </Button>
                            </HStack>
                        </VStack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

/* ------------------------------- Small pieces ----------------------------- */

const SectionCard: React.FC<{
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}> = ({ title, action, children }) => (
    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={4}>
        <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                {title}
            </Text>
            {action}
        </HStack>
        {children}
    </Box>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <Box>
        <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
            {label}
        </Text>
        {children}
    </Box>
);

const NativeSelect: React.FC<{
    value: string;
    onChange: (v: string) => void;
    options: string[];
}> = ({ value, onChange, options }) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
            fontSize: '12px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            background: 'white',
            width: '100%',
        }}
    >
        {options.map((o) => (
            <option key={o} value={o}>
                {o}
            </option>
        ))}
    </select>
);
