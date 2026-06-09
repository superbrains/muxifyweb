import React from 'react';
import { Box, Button, HStack, Input, Switch, Text } from '@chakra-ui/react';
import { FiEdit2 } from 'react-icons/fi';
import {
    AdminEmptyState,
    AdminError,
    AdminLoading,
    AdminPageLayout,
} from '../../components/ui';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { usePlatformSettings, useUpdateSetting } from '../../hooks/usePlatform';
import type { PlatformSetting } from '../../types/platform';

const isBoolType = (t: string) => t.toLowerCase() === 'bool' || t.toLowerCase() === 'boolean';

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

/** Payout-category platform settings — inline-editable (mirrors Monetization Settings). */
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

    return (
        <AdminPageLayout
            title="Payout Settings"
            subtitle="Payout-category platform settings — limits, fees and processing toggles."
            breadcrumbs={[{ label: 'Payouts' }, { label: 'Settings' }]}
        >
            {error ? (
                <AdminError error={error} message="Could not load payout settings." />
            ) : isLoading && !data ? (
                <AdminLoading />
            ) : payouts.length === 0 ? (
                <SettingsCard title="Payout platform settings">
                    <Box px={4} py={6}>
                        <AdminEmptyState
                            title="No payout settings"
                            description="There are no Payouts-category platform settings configured yet."
                        />
                    </Box>
                </SettingsCard>
            ) : (
                <SettingsCard title="Payout platform settings">
                    {payouts.map((s) => (
                        <PlatformSettingRow
                            key={s.key}
                            setting={s}
                            canEdit={canEdit}
                            isSaving={savingKey === s.key}
                            onSave={handleSave}
                        />
                    ))}
                </SettingsCard>
            )}
        </AdminPageLayout>
    );
};

export default SettingsPage;
