import React from 'react';
import { Box, Button, HStack, Input, Switch, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import {
    FiActivity,
    FiCheckSquare,
    FiChevronRight,
    FiClock,
    FiCreditCard,
    FiEdit2,
    FiList,
    FiPercent,
} from 'react-icons/fi';
import {
    AdminEmptyState,
    AdminError,
    AdminLoading,
    AdminPageLayout,
} from '@shared/console';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { usePlatformSettings, useUpdateSetting } from '../../hooks/usePlatform';
import { adminRelative, formatMinorAmount } from '@shared/console/lib/format';
import type { PlatformSetting } from '../../types/platform';

/* -------------------------------------------------------------------------- */
/* Field metadata — turns raw setting keys into a typed, humanised editor.     */
/* Unknown Payouts-category keys fall through to a generic editor so the page  */
/* never hides a setting it doesn't recognise.                                */
/* -------------------------------------------------------------------------- */

type Unit = 'naira' | 'bps' | 'days';
type GroupId = 'limits' | 'fees' | 'settlement';

interface FieldMeta {
    key: string;
    label: string;
    group: GroupId;
    unit: Unit;
    /** Label shown when the stored value is 0 (e.g. "No limit"). */
    zeroLabel?: string;
}

// Order here drives the order within each group.
const FIELDS: FieldMeta[] = [
    { key: 'min_withdrawal_minor', label: 'Minimum withdrawal', group: 'limits', unit: 'naira' },
    { key: 'max_withdrawal_minor', label: 'Maximum withdrawal', group: 'limits', unit: 'naira', zeroLabel: 'No limit' },
    { key: 'withdrawal_fee_bps', label: 'Withdrawal fee', group: 'fees', unit: 'bps' },
    { key: 'label_payout_fee_bps', label: 'Label payout fee', group: 'fees', unit: 'bps' },
    { key: 'settlement_delay_days', label: 'Settlement delay', group: 'settlement', unit: 'days' },
    { key: 'min_payout_minor', label: 'Minimum payout leg', group: 'settlement', unit: 'naira' },
];

const META: Record<string, FieldMeta> = Object.fromEntries(FIELDS.map((f) => [f.key, f]));
const orderIndex = (key: string) => {
    const i = FIELDS.findIndex((f) => f.key === key);
    return i < 0 ? 999 : i;
};

const GROUPS: { id: GroupId; title: string }[] = [
    { id: 'limits', title: 'Withdrawal limits' },
    { id: 'fees', title: 'Fees' },
    { id: 'settlement', title: 'Settlement' },
];

const UNIT_SUFFIX: Record<Unit, string> = { naira: '₦', bps: 'bps', days: 'days' };

const isBoolType = (t: string) => t.toLowerCase() === 'bool' || t.toLowerCase() === 'boolean';

/** Human-readable rendering of a stored value for its unit. */
const formatStored = (meta: FieldMeta, raw: string): string => {
    const n = Number(raw);
    if (meta.unit === 'naira') {
        if (meta.zeroLabel && n === 0) return meta.zeroLabel;
        return formatMinorAmount(n);
    }
    if (meta.unit === 'bps') return `${(n / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
    return `${n} ${n === 1 ? 'day' : 'days'}`;
};

/** Convert a stored value into the value shown in the input box. */
const toInput = (meta: FieldMeta, raw: string): string =>
    meta.unit === 'naira' ? String((Number(raw) || 0) / 100) : raw;

/** Validate + convert an input box value back into the stored representation. */
const parseInput = (meta: FieldMeta, input: string): { value?: string; error?: string } => {
    const t = input.trim();
    if (t === '') return { error: 'A value is required.' };
    const n = Number(t);
    if (meta.unit === 'naira') {
        if (!Number.isFinite(n) || n < 0) return { error: 'Enter an amount of ₦0 or more.' };
        return { value: String(Math.round(n * 100)) };
    }
    if (meta.unit === 'bps') {
        if (!Number.isInteger(n) || n < 0 || n > 10000)
            return { error: 'Enter basis points 0–10000 (10000 = 100%).' };
        return { value: String(n) };
    }
    if (!Number.isInteger(n) || n < 0) return { error: 'Enter a whole number of days (0 or more).' };
    return { value: String(n) };
};

/* -------------------------------------------------------------------------- */

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" overflow="hidden">
        <Text
            fontSize="11px"
            fontWeight="semibold"
            color="#7B91B0"
            textTransform="uppercase"
            letterSpacing="0.4px"
            px={4}
            py={3}
            borderBottom="1px solid"
            borderColor="gray.100"
        >
            {title}
        </Text>
        {children}
    </Box>
);

const RowShell: React.FC<{
    setting: PlatformSetting;
    label: string;
    right: React.ReactNode;
}> = ({ setting, label, right }) => (
    <HStack
        justify="space-between"
        align="flex-start"
        gap={4}
        py={3.5}
        px={4}
        borderBottom="1px solid"
        borderColor="gray.50"
        _last={{ borderBottom: 'none' }}
    >
        <Box minW={0}>
            <HStack gap={2} flexWrap="wrap">
                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                    {label}
                </Text>
                <Text fontSize="10px" color="gray.400" fontFamily="mono">
                    {setting.key}
                </Text>
            </HStack>
            {setting.description && (
                <Text fontSize="11px" color="gray.500" mt={0.5}>
                    {setting.description}
                </Text>
            )}
            <Text fontSize="10px" color="gray.400" mt={1}>
                Updated {adminRelative(setting.updatedAt)}
            </Text>
        </Box>
        <Box flexShrink={0} minW="240px" textAlign="right">
            {right}
        </Box>
    </HStack>
);

/** Typed, unit-aware row for a recognised payout setting. */
const TypedRow: React.FC<{
    setting: PlatformSetting;
    meta: FieldMeta;
    canEdit: boolean;
    isSaving: boolean;
    onSave: (key: string, value: string) => void;
}> = ({ setting, meta, canEdit, isSaving, onSave }) => {
    const [editing, setEditing] = React.useState(false);
    const [draft, setDraft] = React.useState(() => toInput(meta, setting.value));

    React.useEffect(() => {
        if (!editing) setDraft(toInput(meta, setting.value));
    }, [setting.value, editing, meta]);

    const parsed = parseInput(meta, draft);

    const commit = () => {
        if (!parsed.value) return;
        onSave(setting.key, parsed.value);
        setEditing(false);
    };

    if (!editing) {
        return (
            <RowShell
                setting={setting}
                label={meta.label}
                right={
                    <HStack gap={2} justify="flex-end">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                            {formatStored(meta, setting.value)}
                        </Text>
                        {canEdit && (
                            <Button
                                size="xs"
                                variant="ghost"
                                color="gray.500"
                                onClick={() => {
                                    setDraft(toInput(meta, setting.value));
                                    setEditing(true);
                                }}
                                _hover={{ color: 'primary.500' }}
                                aria-label={`Edit ${meta.label}`}
                            >
                                <FiEdit2 />
                            </Button>
                        )}
                    </HStack>
                }
            />
        );
    }

    return (
        <RowShell
            setting={setting}
            label={meta.label}
            right={
                <VStack gap={1.5} align="stretch">
                    <HStack gap={2} justify="flex-end">
                        <HStack
                            gap={1}
                            px={2}
                            borderWidth="1px"
                            borderColor={parsed.error ? 'red.300' : 'gray.200'}
                            borderRadius="lg"
                            bg="white"
                            w="170px"
                        >
                            {meta.unit === 'naira' && (
                                <Text fontSize="xs" color="gray.500">
                                    ₦
                                </Text>
                            )}
                            <Input
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                size="sm"
                                fontSize="xs"
                                border="none"
                                px={0}
                                _focus={{ boxShadow: 'none' }}
                                inputMode="decimal"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && parsed.value) commit();
                                    if (e.key === 'Escape') setEditing(false);
                                }}
                            />
                            {meta.unit !== 'naira' && (
                                <Text fontSize="10px" color="gray.400">
                                    {UNIT_SUFFIX[meta.unit]}
                                </Text>
                            )}
                        </HStack>
                        <Button
                            size="sm"
                            fontSize="xs"
                            bg="primary.500"
                            color="white"
                            borderRadius="lg"
                            loading={isSaving}
                            disabled={!parsed.value}
                            onClick={commit}
                            _hover={{ bg: '#E61E45' }}
                        >
                            Save
                        </Button>
                        <Button
                            size="sm"
                            fontSize="xs"
                            variant="outline"
                            borderColor="gray.200"
                            borderRadius="lg"
                            onClick={() => setEditing(false)}
                        >
                            Cancel
                        </Button>
                    </HStack>
                    <Text fontSize="10px" color={parsed.error ? 'red.500' : 'gray.500'} textAlign="right">
                        {parsed.error ?? `= ${formatStored(meta, parsed.value!)}`}
                    </Text>
                </VStack>
            }
        />
    );
};

/** Generic fallback row for unrecognised payout keys (bool toggle / raw text). */
const GenericRow: React.FC<{
    setting: PlatformSetting;
    canEdit: boolean;
    isSaving: boolean;
    onSave: (key: string, value: string) => void;
}> = ({ setting, canEdit, isSaving, onSave }) => {
    const [editing, setEditing] = React.useState(false);
    const [draft, setDraft] = React.useState(setting.value);

    React.useEffect(() => {
        if (!editing) setDraft(setting.value);
    }, [setting.value, editing]);

    const right = isBoolType(setting.valueType) ? (
        <Switch.Root
            checked={setting.value === 'true'}
            disabled={!canEdit || isSaving}
            onCheckedChange={(e) => onSave(setting.key, e.checked ? 'true' : 'false')}
        >
            <Switch.HiddenInput />
            <Switch.Control>
                <Switch.Thumb />
            </Switch.Control>
        </Switch.Root>
    ) : editing ? (
        <HStack gap={2} justify="flex-end">
            <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                size="sm"
                fontSize="xs"
                w="160px"
                borderColor="gray.200"
                borderRadius="lg"
                autoFocus
            />
            <Button
                size="sm"
                fontSize="xs"
                bg="primary.500"
                color="white"
                borderRadius="lg"
                loading={isSaving}
                onClick={() => {
                    onSave(setting.key, draft.trim());
                    setEditing(false);
                }}
                _hover={{ bg: '#E61E45' }}
            >
                Save
            </Button>
            <Button
                size="sm"
                fontSize="xs"
                variant="outline"
                borderColor="gray.200"
                borderRadius="lg"
                onClick={() => setEditing(false)}
            >
                Cancel
            </Button>
        </HStack>
    ) : (
        <HStack gap={2} justify="flex-end">
            <Text fontSize="xs" color="gray.800" fontFamily="mono" wordBreak="break-all">
                {setting.value || '—'}
            </Text>
            {canEdit && (
                <Button
                    size="xs"
                    variant="ghost"
                    color="gray.500"
                    onClick={() => setEditing(true)}
                    _hover={{ color: 'primary.500' }}
                    aria-label={`Edit ${setting.key}`}
                >
                    <FiEdit2 />
                </Button>
            )}
        </HStack>
    );

    return <RowShell setting={setting} label={setting.key} right={right} />;
};

/* ----------------------------- Related controls --------------------------- */

const RELATED: { to: string; icon: React.ElementType; label: string; desc: string }[] = [
    { to: '/admin/payouts/requests', icon: FiList, label: 'Payout Requests', desc: 'Review and action withdrawal requests' },
    { to: '/admin/payouts/accounts', icon: FiCreditCard, label: 'Payout Accounts', desc: 'Verify and manage saved bank accounts' },
    { to: '/admin/payouts/history', icon: FiClock, label: 'Payout History', desc: 'Browse completed and failed payouts' },
    { to: '/admin/payouts/audit', icon: FiActivity, label: 'Payout Audit Trail', desc: 'Every payout-related admin action' },
    { to: '/admin/monetization/commission', icon: FiPercent, label: 'Commission & Royalties', desc: 'Platform commission and royalty splits' },
    { to: '/admin/finance/approvals', icon: FiCheckSquare, label: 'Approvals queue', desc: 'Second-reviewer (maker-checker) approvals' },
];

const RelatedControls: React.FC = () => (
    <SettingsCard title="Related payout controls">
        {RELATED.map((r) => (
            <HStack
                key={r.to}
                as={Link}
                {...{ to: r.to }}
                gap={3}
                py={3}
                px={4}
                borderBottom="1px solid"
                borderColor="gray.50"
                _last={{ borderBottom: 'none' }}
                _hover={{ bg: 'gray.50' }}
                role="group"
            >
                <Box
                    boxSize="32px"
                    borderRadius="8px"
                    bg="#FFF5F6"
                    color="primary.500"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                >
                    <r.icon />
                </Box>
                <Box minW={0} flex="1">
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                        {r.label}
                    </Text>
                    <Text fontSize="11px" color="gray.500">
                        {r.desc}
                    </Text>
                </Box>
                <Box color="gray.300" _groupHover={{ color: 'primary.500' }}>
                    <FiChevronRight />
                </Box>
            </HStack>
        ))}
    </SettingsCard>
);

/* --------------------------------- Page ----------------------------------- */

/** Payout-category platform settings — typed, grouped and unit-aware. */
const SettingsPage: React.FC = () => {
    const { data, isLoading, error } = usePlatformSettings();
    const canEdit = useHasPermission('SettingsManage');
    const update = useUpdateSetting();
    const [savingKey, setSavingKey] = React.useState<string | null>(null);

    const payouts = React.useMemo(
        () => (data ?? []).filter((s) => (s.category || '').toLowerCase() === 'payouts'),
        [data],
    );

    const handleSave = (key: string, value: string) => {
        setSavingKey(key);
        update.mutate({ key, value }, { onSettled: () => setSavingKey(null) });
    };

    const grouped = React.useMemo(() => {
        const byGroup: Record<string, PlatformSetting[]> = {};
        const others: PlatformSetting[] = [];
        for (const s of payouts) {
            const meta = META[s.key];
            if (meta) (byGroup[meta.group] ??= []).push(s);
            else others.push(s);
        }
        Object.values(byGroup).forEach((arr) => arr.sort((a, b) => orderIndex(a.key) - orderIndex(b.key)));
        return { byGroup, others };
    }, [payouts]);

    return (
        <AdminPageLayout
            title="Payout Settings"
            subtitle="Limits, fees and processing controls that govern withdrawals and label payouts."
            breadcrumbs={[{ label: 'Payouts' }, { label: 'Settings' }]}
        >
            {error ? (
                <AdminError error={error} message="Could not load payout settings." />
            ) : isLoading && !data ? (
                <AdminLoading />
            ) : payouts.length === 0 ? (
                <VStack align="stretch" gap={4}>
                    <SettingsCard title="Payout platform settings">
                        <Box px={4} py={6}>
                            <AdminEmptyState
                                title="No payout settings"
                                description="There are no Payouts-category platform settings configured yet."
                            />
                        </Box>
                    </SettingsCard>
                    <RelatedControls />
                </VStack>
            ) : (
                <VStack align="stretch" gap={4}>
                    {GROUPS.map((g) => {
                        const items = grouped.byGroup[g.id] ?? [];
                        if (items.length === 0) return null;
                        return (
                            <SettingsCard key={g.id} title={g.title}>
                                {items.map((s) => (
                                    <TypedRow
                                        key={s.key}
                                        setting={s}
                                        meta={META[s.key]}
                                        canEdit={canEdit}
                                        isSaving={savingKey === s.key}
                                        onSave={handleSave}
                                    />
                                ))}
                            </SettingsCard>
                        );
                    })}

                    {grouped.others.length > 0 && (
                        <SettingsCard title="Other settings">
                            {grouped.others.map((s) => (
                                <GenericRow
                                    key={s.key}
                                    setting={s}
                                    canEdit={canEdit}
                                    isSaving={savingKey === s.key}
                                    onSave={handleSave}
                                />
                            ))}
                        </SettingsCard>
                    )}

                    <RelatedControls />
                </VStack>
            )}
        </AdminPageLayout>
    );
};

export default SettingsPage;
