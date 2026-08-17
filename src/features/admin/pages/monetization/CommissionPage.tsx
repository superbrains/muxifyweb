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
    VStack,
} from '@chakra-ui/react';
import { FiDownload, FiPercent, FiPlus } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';
import { ConfirmModal } from '@shared/components';
import { useChakraToast } from '@shared/hooks';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    IdentityCell,
    KpiStrip,
    StatusBadge,
} from '@shared/console';
import type { KpiItem } from '@shared/console';
import { adminDate, formatCount, formatMinorAmount } from '@shared/console/lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useCommission,
    useCommissionSettings,
    useCommissionWaivers,
    useCreateWaiver,
    useDeactivateWaiver,
    useUpdateCommissionSettings,
    useUpdateWaiver,
} from '../../hooks/useMonetization';
import { monetizationService } from '../../services/monetizationService';
import type {
    CommissionWaiverDto,
    DateRangeQuery,
} from '../../types/monetization';
import { RANGE_OPTIONS, rangeFor } from './rangeFilter';

const ACCENT = '#f94444';
const nf = new Intl.NumberFormat('en-NG');

/** Bar visualising a row's share of the whole, with a soft track. */
const ShareBar: React.FC<{ pct: number; color?: string }> = ({ pct, color = ACCENT }) => (
    <Box bg="gray.100" borderRadius="full" h="6px" w="full" overflow="hidden" minW="60px">
        <Box bg={color} h="full" w={`${Math.max(2, Math.min(100, pct))}%`} borderRadius="full" />
    </Box>
);

const Card: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({
    title,
    action,
    children,
}) => (
    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={5}>
        <HStack justify="space-between" mb={4}>
            <Text fontSize="xs" fontWeight="semibold" color="gray.800" fontFamily="Poppins">
                {title}
            </Text>
            {action}
        </HStack>
        {children}
    </Box>
);

const FieldRow: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({
    label,
    hint,
    children,
}) => (
    <Box>
        <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
            {label}
        </Text>
        {children}
        {hint && (
            <Text fontSize="10px" color="gray.400" mt={1}>
                {hint}
            </Text>
        )}
    </Box>
);

/** Commission — editable platform fee (single source), commission analytics and per-artist overrides. */
const CommissionPage: React.FC = () => {
    const canManage = useHasPermission('FinanceManage');
    const [preset, setPreset] = React.useState('30d');
    const range: DateRangeQuery = React.useMemo(() => rangeFor(preset), [preset]);
    const { data, isLoading, error } = useCommission(range);
    const { data: settings } = useCommissionSettings();
    const [exporting, setExporting] = React.useState(false);
    const toast = useChakraToast();

    const currency = data?.currency ?? 'NGN';
    const totalMinor = data?.totalCommissionMinor ?? 0;

    const kpis: KpiItem[] = [
        { label: 'Commission value', value: formatMinorAmount(totalMinor, currency), tone: 'success' },
        { label: 'Commission coins', value: formatCount(data?.totalCommissionCoins) },
        { label: 'Earnings counted', value: formatCount(data?.earningCount) },
        {
            label: 'Default fee',
            value: settings ? `${settings.platformFeePercent}%` : '—',
            tone: 'info',
            sub: 'platform commission',
        },
    ];

    const exportCsv = async () => {
        setExporting(true);
        try {
            await monetizationService.downloadCoinReport(range);
        } catch {
            toast.error('Export failed', 'Could not download the coin report.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <AdminPageLayout
            title="Commission"
            subtitle="Platform commission earned from creator earnings — configure the rate and review the breakdown."
            breadcrumbs={[{ label: 'Monetization' }, { label: 'Commission' }]}
        >
            {/* Toolbar */}
            <HStack
                bg="white"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.100"
                px={4}
                py={3}
                justify="space-between"
                flexWrap="wrap"
                gap={2}
            >
                <HStack gap={2} flexWrap="wrap">
                    {RANGE_OPTIONS.map((o) => (
                        <Button
                            key={o.value}
                            size="xs"
                            fontSize="11px"
                            borderRadius="999px"
                            onClick={() => setPreset(o.value)}
                            bg={preset === o.value ? ACCENT : 'gray.50'}
                            color={preset === o.value ? 'white' : 'gray.600'}
                            border="1px solid"
                            borderColor={preset === o.value ? ACCENT : 'gray.200'}
                            _hover={{ bg: preset === o.value ? '#e53939' : 'gray.100' }}
                        >
                            {o.label}
                        </Button>
                    ))}
                </HStack>
                <Button
                    size="sm"
                    fontSize="xs"
                    variant="outline"
                    borderColor="gray.300"
                    color="gray.700"
                    borderRadius="10px"
                    onClick={exportCsv}
                    loading={exporting}
                >
                    <FiDownload /> Export CSV
                </Button>
            </HStack>

            {error ? (
                <AdminError error={error} message="Could not load commission." />
            ) : isLoading && !data ? (
                <AdminLoading />
            ) : (
                <>
                    <KpiStrip items={kpis} />

                    <SimpleGrid columns={{ base: 1, xl: 2 }} gap={4}>
                        <CommissionSettingsCard canManage={canManage} />
                        <ByTypeCard
                            currency={currency}
                            totalMinor={totalMinor}
                            rows={data?.byType ?? []}
                        />
                    </SimpleGrid>

                    <WaiversCard canManage={canManage} />
                </>
            )}
        </AdminPageLayout>
    );
};

export default CommissionPage;

/* ===================================================================== */
/* Settings card — the editable single source for the platform fee        */
/* ===================================================================== */

const CommissionSettingsCard: React.FC<{ canManage: boolean }> = ({ canManage }) => {
    const { data, isLoading, error } = useCommissionSettings();
    const update = useUpdateCommissionSettings();

    const [fee, setFee] = React.useState('20');
    const [giftOn, setGiftOn] = React.useState(false);
    const [giftFee, setGiftFee] = React.useState('20');
    const [unlockOn, setUnlockOn] = React.useState(false);
    const [unlockFee, setUnlockFee] = React.useState('20');
    const [confirm, setConfirm] = React.useState(false);

    React.useEffect(() => {
        if (data) {
            setFee(String(data.platformFeePercent));
            setGiftOn(data.giftFeePercent != null);
            setGiftFee(String(data.giftFeePercent ?? data.platformFeePercent));
            setUnlockOn(data.contentUnlockFeePercent != null);
            setUnlockFee(String(data.contentUnlockFeePercent ?? data.platformFeePercent));
        }
    }, [data]);

    if (isLoading && !data) return <Card title="Commission rate"><AdminLoading /></Card>;
    if (error) return <Card title="Commission rate"><AdminError error={error} message="Could not load settings." /></Card>;

    const feeNum = Number(fee) || 0;
    const giftNum = giftOn ? Number(giftFee) || 0 : feeNum;
    const unlockNum = unlockOn ? Number(unlockFee) || 0 : feeNum;
    const inRange = (n: number) => n >= 0 && n <= 100;
    const valid = inRange(feeNum) && inRange(giftNum) && inRange(unlockNum);

    const example = (rate: number) => {
        const kept = Math.round(1000 * (rate / 100));
        return `Platform keeps ${nf.format(kept)} coins · artist nets ${nf.format(1000 - kept)} coins`;
    };

    return (
        <>
            <Card
                title="Commission rate"
                action={
                    <StatusBadge status={giftOn || unlockOn ? 'Custom' : 'Uniform'} />
                }
            >
                <VStack align="stretch" gap={4}>
                    <FieldRow
                        label="Default platform fee (%)"
                        hint="Applied to all earning types unless a per-type override is set below."
                    >
                        <Input
                            type="number"
                            value={fee}
                            onChange={(e) => setFee(e.target.value)}
                            size="sm"
                            disabled={!canManage}
                            maxW="140px"
                        />
                    </FieldRow>

                    <Box h="1px" bg="gray.100" />

                    <OverrideRow
                        label="Gift earnings override"
                        enabled={giftOn}
                        onToggle={setGiftOn}
                        value={giftFee}
                        onValue={setGiftFee}
                        canManage={canManage}
                        inheritPct={feeNum}
                    />
                    <OverrideRow
                        label="Content-unlock override"
                        enabled={unlockOn}
                        onToggle={setUnlockOn}
                        value={unlockFee}
                        onValue={setUnlockFee}
                        canManage={canManage}
                        inheritPct={feeNum}
                    />

                    <Box bg="gray.50" borderRadius="lg" p={3}>
                        <Text fontSize="10px" fontWeight="600" color="gray.400" textTransform="uppercase" mb={1.5}>
                            Live preview · on a 1,000-coin earning
                        </Text>
                        <VStack align="stretch" gap={1}>
                            <PreviewLine label="Gift" text={example(giftNum)} />
                            <PreviewLine label="Unlock" text={example(unlockNum)} />
                        </VStack>
                    </Box>

                    {canManage ? (
                        <Button
                            alignSelf="flex-start"
                            size="sm"
                            fontSize="xs"
                            bg={ACCENT}
                            color="white"
                            borderRadius="10px"
                            _hover={{ bg: '#e53939' }}
                            disabled={!valid || update.isPending}
                            onClick={() => setConfirm(true)}
                        >
                            Save commission rate
                        </Button>
                    ) : (
                        <Text fontSize="10px" color="gray.400">
                            You have read-only access to commission settings.
                        </Text>
                    )}

                    <Text fontSize="10px" color="gray.400">
                        This is the same platform fee shown on the Coin Economy page — one shared value.
                    </Text>
                </VStack>
            </Card>

            <ConfirmModal
                isOpen={confirm}
                onClose={() => setConfirm(false)}
                onConfirm={() =>
                    update.mutate(
                        {
                            platformFeePercent: feeNum,
                            giftFeePercent: giftOn ? giftNum : null,
                            contentUnlockFeePercent: unlockOn ? unlockNum : null,
                        },
                        { onSuccess: () => setConfirm(false) },
                    )
                }
                title="Update commission rate?"
                message="New earnings created from now on use this rate (within ~1 minute). Existing records are unchanged."
                confirmText="Save"
                confirmColor="red"
                isLoading={update.isPending}
            />
        </>
    );
};

const OverrideRow: React.FC<{
    label: string;
    enabled: boolean;
    onToggle: (v: boolean) => void;
    value: string;
    onValue: (v: string) => void;
    canManage: boolean;
    inheritPct: number;
}> = ({ label, enabled, onToggle, value, onValue, canManage, inheritPct }) => (
    <HStack justify="space-between" align="center">
        <HStack gap={2} as="label" cursor={canManage ? 'pointer' : 'default'}>
            <input
                type="checkbox"
                checked={enabled}
                disabled={!canManage}
                onChange={(e) => onToggle(e.target.checked)}
            />
            <Text fontSize="xs" color="gray.700">
                {label}
            </Text>
        </HStack>
        {enabled ? (
            <Input
                type="number"
                value={value}
                onChange={(e) => onValue(e.target.value)}
                size="sm"
                w="90px"
                textAlign="right"
                disabled={!canManage}
            />
        ) : (
            <Text fontSize="11px" color="gray.400">
                inherits {inheritPct}%
            </Text>
        )}
    </HStack>
);

const PreviewLine: React.FC<{ label: string; text: string }> = ({ label, text }) => (
    <HStack justify="space-between">
        <Text fontSize="11px" fontWeight="semibold" color="gray.600">
            {label}
        </Text>
        <Text fontSize="11px" color="gray.700">
            {text}
        </Text>
    </HStack>
);

/* ===================================================================== */
/* By-type breakdown with share bars                                      */
/* ===================================================================== */

const ByTypeCard: React.FC<{
    currency: string;
    totalMinor: number;
    rows: { earningType: string; commissionCoins: number; commissionMinor: number }[];
}> = ({ currency, totalMinor, rows }) => (
    <Card title="Commission by earning type">
        {rows.length === 0 ? (
            <Text fontSize="xs" color="gray.400" py={6} textAlign="center">
                No commissionable earnings in the selected window.
            </Text>
        ) : (
            <VStack align="stretch" gap={3.5}>
                {rows.map((r) => {
                    const pct = totalMinor > 0 ? (r.commissionMinor / totalMinor) * 100 : 0;
                    return (
                        <Box key={r.earningType}>
                            <HStack justify="space-between" mb={1.5}>
                                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                                    {r.earningType}
                                </Text>
                                <HStack gap={3}>
                                    <Text fontSize="11px" color="gray.400">
                                        {formatCount(r.commissionCoins)} coins
                                    </Text>
                                    <Text fontSize="xs" fontWeight="semibold" color="gray.800" minW="80px" textAlign="right">
                                        {formatMinorAmount(r.commissionMinor, currency)}
                                    </Text>
                                </HStack>
                            </HStack>
                            <HStack gap={2}>
                                <ShareBar pct={pct} />
                                <Text fontSize="10px" color="gray.400" minW="34px" textAlign="right">
                                    {pct.toFixed(0)}%
                                </Text>
                            </HStack>
                        </Box>
                    );
                })}
            </VStack>
        )}
    </Card>
);

/* ===================================================================== */
/* Per-artist commission waivers / discounts                              */
/* ===================================================================== */

const WaiversCard: React.FC<{ canManage: boolean }> = ({ canManage }) => {
    const { data, isLoading, error } = useCommissionWaivers();
    const deactivate = useDeactivateWaiver();
    const [editing, setEditing] = React.useState<CommissionWaiverDto | null>(null);
    const [creating, setCreating] = React.useState(false);
    const [toDeactivate, setToDeactivate] = React.useState<CommissionWaiverDto | null>(null);

    return (
        <>
            <Card
                title="Commission overrides (waivers & discounts)"
                action={
                    canManage ? (
                        <Button
                            size="xs"
                            fontSize="11px"
                            bg={ACCENT}
                            color="white"
                            borderRadius="999px"
                            _hover={{ bg: '#e53939' }}
                            onClick={() => setCreating(true)}
                        >
                            <FiPlus /> New override
                        </Button>
                    ) : undefined
                }
            >
                {isLoading && !data ? (
                    <AdminLoading />
                ) : error ? (
                    <AdminError error={error} message="Could not load overrides." />
                ) : (data?.length ?? 0) === 0 ? (
                    <VStack py={8} gap={1}>
                        <Icon as={FiPercent} boxSize={6} color="gray.300" />
                        <Text fontSize="xs" color="gray.400">
                            No per-artist overrides. The default fee applies to everyone.
                        </Text>
                    </VStack>
                ) : (
                    <VStack align="stretch" gap={0}>
                        <HStack px={2} pb={2} borderBottom="1px solid" borderColor="gray.100">
                            <Text flex="1" fontSize="10px" fontWeight="600" color="gray.400" textTransform="uppercase">Artist</Text>
                            <Text w="70px" fontSize="10px" fontWeight="600" color="gray.400" textTransform="uppercase" textAlign="right">Fee</Text>
                            <Text flex="1" fontSize="10px" fontWeight="600" color="gray.400" textTransform="uppercase">Reason</Text>
                            <Text w="80px" fontSize="10px" fontWeight="600" color="gray.400" textTransform="uppercase">Status</Text>
                            <Box w={canManage ? '120px' : '0'} />
                        </HStack>
                        {data!.map((w) => (
                            <HStack key={w.id} px={2} py={2.5} borderBottom="1px solid" borderColor="gray.50">
                                <Box flex="1" minW={0}>
                                    <IdentityCell name={w.artistName} secondary={adminDate(w.effectiveFrom)} />
                                </Box>
                                <Text w="70px" fontSize="xs" fontWeight="semibold" color="gray.900" textAlign="right">
                                    {w.feePercent}%
                                </Text>
                                <Text flex="1" fontSize="11px" color="gray.600" lineClamp={2}>
                                    {w.reason}
                                </Text>
                                <Box w="80px">
                                    <StatusBadge status={w.isActive ? 'Active' : 'Inactive'} />
                                </Box>
                                {canManage && (
                                    <HStack w="120px" gap={2} justify="flex-end">
                                        <Text
                                            as="button"
                                            fontSize="11px"
                                            fontWeight="medium"
                                            color={ACCENT}
                                            onClick={() => setEditing(w)}
                                            _hover={{ textDecoration: 'underline' }}
                                        >
                                            Edit
                                        </Text>
                                        {w.isActive && (
                                            <Text
                                                as="button"
                                                fontSize="11px"
                                                fontWeight="medium"
                                                color="#C53030"
                                                onClick={() => setToDeactivate(w)}
                                                _hover={{ textDecoration: 'underline' }}
                                            >
                                                Deactivate
                                            </Text>
                                        )}
                                    </HStack>
                                )}
                            </HStack>
                        ))}
                    </VStack>
                )}
            </Card>

            {(creating || editing) && (
                <WaiverDialog waiver={editing} onClose={() => { setCreating(false); setEditing(null); }} />
            )}

            <ConfirmModal
                isOpen={toDeactivate !== null}
                onClose={() => setToDeactivate(null)}
                onConfirm={() =>
                    toDeactivate &&
                    deactivate.mutate(toDeactivate.id, { onSuccess: () => setToDeactivate(null) })
                }
                title="Deactivate override?"
                message={`${toDeactivate?.artistName ?? 'This artist'} will revert to the default platform fee on future earnings.`}
                confirmText="Deactivate"
                confirmColor="red"
                isLoading={deactivate.isPending}
            />
        </>
    );
};

const WaiverDialog: React.FC<{ waiver: CommissionWaiverDto | null; onClose: () => void }> = ({
    waiver,
    onClose,
}) => {
    const create = useCreateWaiver();
    const update = useUpdateWaiver();
    const isEdit = waiver !== null;

    const [artistId, setArtistId] = React.useState(waiver?.artistId ?? '');
    const [feePercent, setFeePercent] = React.useState(String(waiver?.feePercent ?? 0));
    const [reason, setReason] = React.useState(waiver?.reason ?? '');
    const [effectiveTo, setEffectiveTo] = React.useState(
        waiver?.effectiveTo ? waiver.effectiveTo.slice(0, 10) : '',
    );

    const feeNum = Number(feePercent) || 0;
    const valid =
        (isEdit || artistId.trim().length > 0) &&
        feeNum >= 0 &&
        feeNum <= 100 &&
        reason.trim().length > 0;
    const pending = create.isPending || update.isPending;

    const submit = () => {
        const payload = {
            artistId: artistId.trim(),
            feePercent: feeNum,
            reason: reason.trim(),
            effectiveTo: effectiveTo ? new Date(effectiveTo).toISOString() : null,
        };
        const opts = { onSuccess: onClose };
        if (isEdit && waiver) update.mutate({ id: waiver.id, payload }, opts);
        else create.mutate(payload, opts);
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
                        <Text fontSize="md" fontWeight="semibold" color="gray.900" fontFamily="Poppins" mb={4}>
                            {isEdit ? 'Edit commission override' : 'New commission override'}
                        </Text>
                        <VStack align="stretch" gap={3}>
                            <FieldRow label="Artist user ID" hint={isEdit ? undefined : 'The artist this override applies to.'}>
                                <Input
                                    value={artistId}
                                    onChange={(e) => setArtistId(e.target.value)}
                                    size="sm"
                                    fontSize="11px"
                                    disabled={isEdit}
                                    placeholder="00000000-0000-0000-0000-000000000000"
                                />
                            </FieldRow>
                            <SimpleGrid columns={2} gap={3}>
                                <FieldRow label="Fee (%)" hint="0 = full waiver">
                                    <Input
                                        type="number"
                                        value={feePercent}
                                        onChange={(e) => setFeePercent(e.target.value)}
                                        size="sm"
                                    />
                                </FieldRow>
                                <FieldRow label="Expires (optional)">
                                    <Input
                                        type="date"
                                        value={effectiveTo}
                                        onChange={(e) => setEffectiveTo(e.target.value)}
                                        size="sm"
                                    />
                                </FieldRow>
                            </SimpleGrid>
                            <FieldRow label="Reason">
                                <Input
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    size="sm"
                                    placeholder="e.g. launch promo for verified label"
                                />
                            </FieldRow>
                            <HStack gap={3} justify="flex-end" pt={1}>
                                <Button onClick={onClose} variant="outline" borderColor="gray.300" color="gray.700" size="sm" fontSize="xs" borderRadius="10px" disabled={pending}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submit}
                                    bg={ACCENT}
                                    color="white"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={!valid || pending}
                                    _hover={{ bg: '#e53939' }}
                                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                >
                                    {pending ? <Spinner size="xs" color="white" /> : 'Save'}
                                </Button>
                            </HStack>
                        </VStack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
