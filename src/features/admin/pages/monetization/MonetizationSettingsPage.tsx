import React from 'react';
import { Box, Button, HStack, Input, Switch, Text, VStack } from '@chakra-ui/react';
import { FiEdit2 } from 'react-icons/fi';
import {
    AdminEmptyState,
    AdminError,
    AdminLoading,
    AdminPageLayout,
} from '../../components/ui';
import { useChakraToast } from '@shared/hooks';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useCoinEconomySettings, useUpdateCoinEconomySettings } from '../../hooks/useCoinEconomy';
import { usePlatformSettings, useUpdateSetting } from '../../hooks/usePlatform';
import type { PlatformSetting } from '../../types/platform';

const isBoolType = (t: string) => t.toLowerCase() === 'bool' || t.toLowerCase() === 'boolean';

/** Card shell shared by both settings blocks. */
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

/* ----------------------- Coin economy (rate / fee) ------------------------ */

const CoinEconomyBlock: React.FC = () => {
    const canEdit = useHasPermission('CoinEconomyManage');
    const { data, isLoading, error } = useCoinEconomySettings();
    const update = useUpdateCoinEconomySettings();
    const toast = useChakraToast();

    const [editing, setEditing] = React.useState(false);
    const [rate, setRate] = React.useState('');
    const [fee, setFee] = React.useState('');
    const [currency, setCurrency] = React.useState('');

    React.useEffect(() => {
        if (data) {
            setRate(String(data.coinsPerNairaMajor));
            setFee(String(data.platformFeePercent));
            setCurrency(data.currency);
        }
    }, [data]);

    const save = () => {
        const rateNum = parseFloat(rate);
        const feeNum = parseFloat(fee);
        if (!Number.isFinite(rateNum) || rateNum <= 0 || !Number.isFinite(feeNum) || feeNum < 0) {
            toast.error('Invalid values', 'Rate must be positive and fee non-negative.');
            return;
        }
        update.mutate(
            { coinsPerNairaMajor: rateNum, platformFeePercent: feeNum, currency: currency.trim() || 'NGN' },
            { onSuccess: () => setEditing(false) },
        );
    };

    if (error) return <AdminError error={error} message="Could not load coin economy settings." />;
    if (isLoading && !data) return <AdminLoading />;

    return (
        <SettingsCard title="Coin economy">
            <VStack align="stretch" gap={0}>
                {editing ? (
                    <Box px={4} py={4}>
                        <VStack align="stretch" gap={3}>
                            <Field label="Coins per Naira">
                                <Input
                                    type="number"
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                    size="sm"
                                    w="200px"
                                />
                            </Field>
                            <Field label="Platform fee (%)">
                                <Input
                                    type="number"
                                    value={fee}
                                    onChange={(e) => setFee(e.target.value)}
                                    size="sm"
                                    w="200px"
                                />
                            </Field>
                            <Field label="Currency">
                                <Input
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    size="sm"
                                    w="200px"
                                />
                            </Field>
                            <HStack gap={2}>
                                <Button
                                    size="sm"
                                    fontSize="xs"
                                    bg="primary.500"
                                    color="white"
                                    borderRadius="lg"
                                    loading={update.isPending}
                                    onClick={save}
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
                        </VStack>
                    </Box>
                ) : (
                    <>
                        <ReadRow label="Coins per Naira" value={String(data?.coinsPerNairaMajor ?? '—')} />
                        <ReadRow label="Platform fee" value={`${data?.platformFeePercent ?? '—'}%`} />
                        <ReadRow
                            label="Currency"
                            value={data?.currency ?? '—'}
                            action={
                                canEdit ? (
                                    <Button
                                        size="xs"
                                        variant="ghost"
                                        color="gray.500"
                                        onClick={() => setEditing(true)}
                                        _hover={{ color: 'primary.500' }}
                                    >
                                        <FiEdit2 />
                                    </Button>
                                ) : undefined
                            }
                        />
                    </>
                )}
            </VStack>
        </SettingsCard>
    );
};

const ReadRow: React.FC<{ label: string; value: string; action?: React.ReactNode }> = ({
    label,
    value,
    action,
}) => (
    <HStack
        justify="space-between"
        align="center"
        gap={4}
        py={3.5}
        px={4}
        borderBottom="1px solid"
        borderColor="gray.50"
    >
        <Text fontSize="xs" fontWeight="semibold" color="gray.900">
            {label}
        </Text>
        <HStack gap={2}>
            <Text fontSize="xs" color="gray.800" fontFamily="mono">
                {value}
            </Text>
            {action}
        </HStack>
    </HStack>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <Box>
        <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
            {label}
        </Text>
        {children}
    </Box>
);

/* ---------------- Monetization-category platform settings ----------------- */

const PlatformSettingRow: React.FC<{
    setting: PlatformSetting;
    canEdit: boolean;
    isSaving: boolean;
    onSave: (key: string, value: string) => void;
}> = ({ setting, canEdit, isSaving, onSave }) => {
    const [editing, setEditing] = React.useState(false);
    const [draft, setDraft] = React.useState(setting.value);

    React.useEffect(() => {
        setDraft(setting.value);
    }, [setting.value]);

    const commit = (value: string) => {
        onSave(setting.key, value);
        setEditing(false);
    };

    return (
        <HStack
            justify="space-between"
            align="flex-start"
            gap={4}
            py={3.5}
            px={4}
            borderBottom="1px solid"
            borderColor="gray.50"
        >
            <Box minW={0}>
                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                    {setting.key}
                </Text>
                {setting.description && (
                    <Text fontSize="11px" color="gray.500" mt={0.5}>
                        {setting.description}
                    </Text>
                )}
            </Box>
            <Box flexShrink={0} minW="220px" textAlign="right">
                {isBoolType(setting.valueType) ? (
                    <Switch.Root
                        checked={setting.value === 'true'}
                        disabled={!canEdit || isSaving}
                        onCheckedChange={(e) => commit(e.checked ? 'true' : 'false')}
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
                            onClick={() => commit(draft.trim())}
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
                            onClick={() => {
                                setDraft(setting.value);
                                setEditing(false);
                            }}
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
                            >
                                <FiEdit2 />
                            </Button>
                        )}
                    </HStack>
                )}
            </Box>
        </HStack>
    );
};

const MonetizationPlatformBlock: React.FC = () => {
    const { data, isLoading, error } = usePlatformSettings();
    const canEdit = useHasPermission('SettingsManage');
    const update = useUpdateSetting();
    const [savingKey, setSavingKey] = React.useState<string | null>(null);

    const monetization = React.useMemo(
        () => (data ?? []).filter((s) => (s.category || '').toLowerCase() === 'monetization'),
        [data],
    );

    const handleSave = (key: string, value: string) => {
        setSavingKey(key);
        update.mutate({ key, value }, { onSettled: () => setSavingKey(null) });
    };

    if (error) return <AdminError error={error} message="Could not load platform settings." />;
    if (isLoading && !data) return <AdminLoading />;
    if (monetization.length === 0)
        return (
            <SettingsCard title="Monetization platform settings">
                <Box px={4} py={6}>
                    <AdminEmptyState
                        title="No monetization settings"
                        description="There are no Monetization-category platform settings configured yet."
                    />
                </Box>
            </SettingsCard>
        );

    return (
        <SettingsCard title="Monetization platform settings">
            {monetization.map((s) => (
                <PlatformSettingRow
                    key={s.key}
                    setting={s}
                    canEdit={canEdit}
                    isSaving={savingKey === s.key}
                    onSave={handleSave}
                />
            ))}
        </SettingsCard>
    );
};

/** Monetization settings — coin economy (rate/fee) plus Monetization-category platform settings. */
const MonetizationSettingsPage: React.FC = () => (
    <AdminPageLayout
        title="Monetization Settings"
        subtitle="Coin conversion rate, platform fee and the Monetization-category platform settings."
        breadcrumbs={[{ label: 'Monetization' }, { label: 'Settings' }]}
    >
        <VStack align="stretch" gap={4}>
            <CoinEconomyBlock />
            <MonetizationPlatformBlock />
        </VStack>
    </AdminPageLayout>
);

export default MonetizationSettingsPage;
