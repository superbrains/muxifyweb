import React from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Icon,
    IconButton,
    Portal,
    SimpleGrid,
    Spinner,
    Text,
    Input,
    VStack,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminError, AdminLoading } from '@shared/console/components/AdminStateBlock';
import { AdminTable, type AdminTableColumn } from '../components/AdminTable';
import { ConfirmModal } from '@shared/components';
import {
    useCoinEconomySettings,
    useCoinPackages,
    useCreateCoinPackage,
    useSetCoinPackageActive,
    useUpdateCoinEconomySettings,
    useUpdateCoinPackage,
} from '../hooks/useCoinEconomy';
import type {
    AdminCoinPackage,
    UpsertCoinPackageRequest,
} from '../types/coinEconomy';

type TabKey = 'rate' | 'packages';

const ACCENT = '#f94444';
const nf = new Intl.NumberFormat('en-NG');

const naira = (kobo: number) => `₦${nf.format(Math.round(kobo) / 100)}`;

/* ===================================================================== */
/* Page                                                                  */
/* ===================================================================== */

const CoinEconomyPage: React.FC = () => {
    const [tab, setTab] = React.useState<TabKey>('rate');
    const navigate = useNavigate();

    return (
        <VStack
            gap={{ base: 3, lg: 4 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <AdminPageHeader
                title="Coin Economy"
                subtitle="Set the coin↔Naira rate, the platform fee and top-up packages"
            />

            <HStack gap={2} flexWrap="wrap">
                {([
                    ['rate', 'Conversion & Fee'],
                    ['packages', 'Coin Packages'],
                ] as [TabKey, string][]).map(([key, label]) => (
                    <Button
                        key={key}
                        size="sm"
                        fontSize="xs"
                        borderRadius="999px"
                        onClick={() => setTab(key)}
                        bg={tab === key ? ACCENT : 'white'}
                        color={tab === key ? 'white' : 'gray.700'}
                        border="1px solid"
                        borderColor={tab === key ? ACCENT : 'gray.200'}
                        _hover={{ bg: tab === key ? '#e53939' : 'gray.50' }}
                    >
                        {label}
                    </Button>
                ))}
                <Button
                    size="sm"
                    fontSize="xs"
                    borderRadius="999px"
                    variant="outline"
                    borderColor="gray.200"
                    color="gray.600"
                    ml={{ base: 0, sm: 'auto' }}
                    onClick={() => navigate('/admin/monetization/gifts')}
                    _hover={{ bg: 'gray.50' }}
                >
                    Manage gifts →
                </Button>
            </HStack>

            {tab === 'rate' && <ConversionTab />}
            {tab === 'packages' && <PackagesTab />}
        </VStack>
    );
};

export default CoinEconomyPage;

/* ===================================================================== */
/* Tab 1 — Conversion & Fee                                              */
/* ===================================================================== */

const ConversionTab: React.FC = () => {
    const { data, isLoading, error } = useCoinEconomySettings();
    const update = useUpdateCoinEconomySettings();

    const [rate, setRate] = React.useState('10');
    const [currency, setCurrency] = React.useState('NGN');
    const [fee, setFee] = React.useState('20');
    const [confirm, setConfirm] = React.useState(false);
    const [calcNaira, setCalcNaira] = React.useState('1000');

    React.useEffect(() => {
        if (data) {
            setRate(String(data.coinsPerNairaMajor));
            setCurrency(data.currency);
            setFee(String(data.platformFeePercent));
        }
    }, [data]);

    if (isLoading && !data) return <AdminLoading />;
    if (error) return <AdminError error={error} message="Could not load coin economy settings." />;

    const rateNum = Number(rate) || 0;
    const feeNum = Number(fee) || 0;
    const calcNairaNum = Number(calcNaira) || 0;
    const valid = rateNum > 0 && feeNum >= 0 && feeNum <= 100 && currency.trim().length === 3;

    return (
        <>
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
                <Card title="Conversion rate & platform fee">
                    <VStack align="stretch" gap={4}>
                        <FieldRow label="Coins per ₦1">
                            <Input
                                type="number"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                size="sm"
                            />
                        </FieldRow>
                        <FieldRow label="Currency (ISO code)">
                            <Input
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                                maxLength={3}
                                size="sm"
                            />
                        </FieldRow>
                        <FieldRow label="Platform fee (%)">
                            <Input
                                type="number"
                                value={fee}
                                onChange={(e) => setFee(e.target.value)}
                                size="sm"
                            />
                        </FieldRow>
                        <Button
                            alignSelf="flex-start"
                            size="sm"
                            fontSize="xs"
                            bg={ACCENT}
                            color="white"
                            _hover={{ bg: '#e53939' }}
                            disabled={!valid || update.isPending}
                            onClick={() => setConfirm(true)}
                        >
                            Save changes
                        </Button>
                    </VStack>
                </Card>

                <Card title="Live preview">
                    <VStack align="stretch" gap={2.5}>
                        <PreviewLine label="₦1" value={`${nf.format(rateNum)} coins`} />
                        <PreviewLine label="₦1,000" value={`${nf.format(rateNum * 1000)} coins`} />
                        <PreviewLine
                            label="1,000 coins"
                            value={rateNum > 0 ? `≈ ₦${nf.format(1000 / rateNum)}` : '—'}
                        />
                        <Box h="1px" bg="gray.100" my={1} />
                        <Text fontSize="11px" fontWeight="semibold" color="gray.700">
                            Quick calculator
                        </Text>
                        <FieldRow label="Amount in ₦">
                            <Input
                                type="number"
                                value={calcNaira}
                                onChange={(e) => setCalcNaira(e.target.value)}
                                size="sm"
                            />
                        </FieldRow>
                        <PreviewLine
                            label={`₦${nf.format(calcNairaNum)} buys`}
                            value={`${nf.format(calcNairaNum * rateNum)} coins`}
                        />
                        <Text fontSize="10px" color="gray.500">
                            Artists earn the gift/unlock coin value converted at this rate, minus the
                            {` ${feeNum}%`} platform fee.
                        </Text>
                    </VStack>
                </Card>
            </SimpleGrid>

            <ConfirmModal
                isOpen={confirm}
                onClose={() => setConfirm(false)}
                onConfirm={() => {
                    update.mutate(
                        {
                            coinsPerNairaMajor: rateNum,
                            currency: currency.trim().toUpperCase(),
                            platformFeePercent: feeNum,
                        },
                        { onSuccess: () => setConfirm(false) },
                    );
                }}
                title="Update coin economy?"
                message="This changes the coin↔Naira value shown to fans and the Naira value of future artist earnings. Existing records are not changed."
                confirmText="Save changes"
                confirmColor="blue"
                isLoading={update.isPending}
            />
        </>
    );
};

/* ===================================================================== */
/* Tab 2 — Coin packages                                                 */
/* ===================================================================== */

const PackagesTab: React.FC = () => {
    const { data: settings } = useCoinEconomySettings();
    const { data, isLoading, error } = useCoinPackages();
    const setActive = useSetCoinPackageActive();
    const [editing, setEditing] = React.useState<AdminCoinPackage | null>(null);
    const [creating, setCreating] = React.useState(false);
    const [toggle, setToggle] = React.useState<AdminCoinPackage | null>(null);

    const rate = settings?.coinsPerNairaMajor ?? 10;

    const columns: AdminTableColumn<AdminCoinPackage>[] = [
        {
            key: 'name',
            header: 'Package',
            render: (p) => (
                <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                        {p.name}
                        {p.isFeatured && (
                            <Text as="span" color={ACCENT} ml={1} fontSize="10px">
                                ★
                            </Text>
                        )}
                    </Text>
                    {p.promoTag && (
                        <Text fontSize="10px" color="gray.500">
                            {p.promoTag}
                        </Text>
                    )}
                </Box>
            ),
        },
        {
            key: 'coins',
            header: 'Coins',
            render: (p) => (
                <Text fontSize="xs" color="gray.700">
                    {nf.format(p.coinAmount)}
                    {p.bonusCoins > 0 && (
                        <Text as="span" color="green.600">{` +${nf.format(p.bonusCoins)}`}</Text>
                    )}
                </Text>
            ),
        },
        {
            key: 'price',
            header: 'Price',
            render: (p) => (
                <Text fontSize="xs" color="gray.700">
                    {naira(p.priceInSmallestUnit)}
                </Text>
            ),
        },
        {
            key: 'impliedRate',
            header: 'Coins / ₦',
            render: (p) => {
                const implied = p.priceInSmallestUnit > 0
                    ? (p.coinAmount + p.bonusCoins) / (p.priceInSmallestUnit / 100)
                    : 0;
                const off = Math.abs(implied - rate) / rate > 0.01;
                return (
                    <Text fontSize="xs" color={off ? '#C53030' : 'gray.500'}>
                        {nf.format(Math.round(implied))}
                        {off ? ' ⚠' : ''}
                    </Text>
                );
            },
        },
        {
            key: 'active',
            header: 'Status',
            render: (p) => (
                <Text fontSize="xs" color={p.isActive ? 'green.600' : 'gray.400'}>
                    {p.isActive ? 'Active' : 'Inactive'}
                </Text>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (p) => (
                <HStack gap={2} justify="flex-end" onClick={(e) => e.stopPropagation()}>
                    <LinkBtn onClick={() => setEditing(p)}>Edit</LinkBtn>
                    <LinkBtn color={p.isActive ? '#C53030' : 'green.600'} onClick={() => setToggle(p)}>
                        {p.isActive ? 'Deactivate' : 'Activate'}
                    </LinkBtn>
                </HStack>
            ),
        },
    ];

    return (
        <>
            <HStack justify="flex-end">
                <Button
                    size="sm"
                    fontSize="xs"
                    bg={ACCENT}
                    color="white"
                    _hover={{ bg: '#e53939' }}
                    onClick={() => setCreating(true)}
                >
                    + Add package
                </Button>
            </HStack>

            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message="Could not load coin packages." />
            ) : (
                <AdminTable
                    columns={columns}
                    rows={data ?? []}
                    rowKey={(p) => p.id}
                    emptyTitle="No coin packages yet"
                    emptyDescription="Create the first top-up package fans can buy."
                />
            )}

            {(creating || editing) && (
                <PackageDialog
                    rate={rate}
                    pkg={editing}
                    onClose={() => {
                        setCreating(false);
                        setEditing(null);
                    }}
                />
            )}

            <ConfirmModal
                isOpen={toggle !== null}
                onClose={() => setToggle(null)}
                onConfirm={() => {
                    if (!toggle) return;
                    setActive.mutate(
                        { id: toggle.id, active: !toggle.isActive },
                        { onSuccess: () => setToggle(null) },
                    );
                }}
                title={toggle?.isActive ? 'Deactivate package?' : 'Activate package?'}
                message={
                    toggle?.isActive
                        ? `${toggle?.name} will be hidden from the top-up screen.`
                        : `${toggle?.name ?? 'This package'} will become buyable again.`
                }
                confirmText={toggle?.isActive ? 'Deactivate' : 'Activate'}
                confirmColor={toggle?.isActive ? 'red' : 'blue'}
                isLoading={setActive.isPending}
            />
        </>
    );
};

const PackageDialog: React.FC<{
    rate: number;
    pkg: AdminCoinPackage | null;
    onClose: () => void;
}> = ({ rate, pkg, onClose }) => {
    const create = useCreateCoinPackage();
    const update = useUpdateCoinPackage();
    const isEdit = pkg !== null;

    const [name, setName] = React.useState(pkg?.name ?? '');
    const [description, setDescription] = React.useState(pkg?.description ?? '');
    const [coinAmount, setCoinAmount] = React.useState(String(pkg?.coinAmount ?? ''));
    const [bonusCoins, setBonusCoins] = React.useState(String(pkg?.bonusCoins ?? 0));
    const [priceNaira, setPriceNaira] = React.useState(
        pkg ? String(pkg.priceInSmallestUnit / 100) : '',
    );
    const [displayOrder, setDisplayOrder] = React.useState(String(pkg?.displayOrder ?? 0));
    const [isFeatured, setIsFeatured] = React.useState(pkg?.isFeatured ?? false);
    const [badgeIcon, setBadgeIcon] = React.useState(pkg?.badgeIcon ?? '');
    const [promoTag, setPromoTag] = React.useState(pkg?.promoTag ?? '');

    const coinsNum = Number(coinAmount) || 0;
    const bonusNum = Number(bonusCoins) || 0;
    const priceNum = Number(priceNaira) || 0;
    const implied = priceNum > 0 ? (coinsNum + bonusNum) / priceNum : 0;
    const valid = name.trim() && coinsNum > 0 && priceNum > 0 && bonusNum >= 0;
    const pending = create.isPending || update.isPending;

    const submit = () => {
        const payload: UpsertCoinPackageRequest = {
            name: name.trim(),
            description: description.trim() || null,
            coinAmount: coinsNum,
            bonusCoins: bonusNum,
            priceInSmallestUnit: Math.round(priceNum * 100),
            displayOrder: Number(displayOrder) || 0,
            isFeatured,
            badgeIcon: badgeIcon.trim() || null,
            promoTag: promoTag.trim() || null,
        };
        const opts = { onSuccess: onClose };
        if (isEdit && pkg) update.mutate({ id: pkg.id, payload }, opts);
        else create.mutate(payload, opts);
    };

    return (
        <DialogShell title={isEdit ? 'Edit coin package' : 'New coin package'} onClose={onClose}>
            <VStack align="stretch" gap={3}>
                <FieldRow label="Name">
                    <Input value={name} onChange={(e) => setName(e.target.value)} size="sm" />
                </FieldRow>
                <FieldRow label="Description (optional)">
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} size="sm" />
                </FieldRow>
                <SimpleGrid columns={2} gap={3}>
                    <FieldRow label="Coins">
                        <Input type="number" value={coinAmount} onChange={(e) => setCoinAmount(e.target.value)} size="sm" />
                    </FieldRow>
                    <FieldRow label="Bonus coins">
                        <Input type="number" value={bonusCoins} onChange={(e) => setBonusCoins(e.target.value)} size="sm" />
                    </FieldRow>
                    <FieldRow label="Price (₦)">
                        <Input type="number" value={priceNaira} onChange={(e) => setPriceNaira(e.target.value)} size="sm" />
                    </FieldRow>
                    <FieldRow label="Display order">
                        <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} size="sm" />
                    </FieldRow>
                    <FieldRow label="Badge icon (optional)">
                        <Input value={badgeIcon} onChange={(e) => setBadgeIcon(e.target.value)} size="sm" />
                    </FieldRow>
                    <FieldRow label="Promo tag (optional)">
                        <Input value={promoTag} onChange={(e) => setPromoTag(e.target.value)} size="sm" />
                    </FieldRow>
                </SimpleGrid>
                <Checkbox checked={isFeatured} onChange={setIsFeatured} label="Featured (highlighted on the top-up screen)" />
                <Box bg="gray.50" borderRadius="md" p={2.5}>
                    <Text fontSize="11px" color="gray.600">
                        {priceNum > 0 && coinsNum > 0
                            ? `₦${nf.format(priceNum)} → ${nf.format(coinsNum + bonusNum)} coins = ${nf.format(
                                  Math.round(implied),
                              )} coins/₦`
                            : 'Enter coins and price to preview the implied rate.'}
                        {priceNum > 0 && coinsNum > 0 && Math.abs(implied - rate) / rate > 0.01
                            ? ` — differs from the global ${rate} coins/₦`
                            : ''}
                    </Text>
                </Box>
                <DialogActions onClose={onClose} onConfirm={submit} disabled={!valid} loading={pending} />
            </VStack>
        </DialogShell>
    );
};

/* ===================================================================== */
/* Small shared pieces                                                   */
/* ===================================================================== */

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={5}>
        <Text fontSize="xs" fontWeight="semibold" color="gray.800" mb={4}>
            {title}
        </Text>
        {children}
    </Box>
);

const FieldRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <Box>
        <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
            {label}
        </Text>
        {children}
    </Box>
);

const PreviewLine: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <HStack justify="space-between">
        <Text fontSize="xs" color="gray.500">
            {label}
        </Text>
        <Text fontSize="xs" fontWeight="semibold" color="gray.800">
            {value}
        </Text>
    </HStack>
);

const LinkBtn: React.FC<{ color?: string; onClick: () => void; children: React.ReactNode }> = ({
    color = ACCENT,
    onClick,
    children,
}) => (
    <Text as="button" fontSize="xs" fontWeight="medium" color={color} onClick={onClick} _hover={{ textDecoration: 'underline' }}>
        {children}
    </Text>
);

const Checkbox: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({
    checked,
    onChange,
    label,
}) => (
    <HStack gap={2} as="label" cursor="pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <Text fontSize="xs" color="gray.700">
            {label}
        </Text>
    </HStack>
);

const DialogShell: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
    title,
    onClose,
    children,
}) => (
    <Dialog.Root open onOpenChange={(e) => !e.open && onClose()} placement="center">
        <Portal>
            <Dialog.Backdrop bg="blackAlpha.500" />
            <Dialog.Positioner>
                <Dialog.Content maxW="560px" p={6} borderRadius="20px" position="relative">
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
                        {title}
                    </Text>
                    {children}
                </Dialog.Content>
            </Dialog.Positioner>
        </Portal>
    </Dialog.Root>
);

const DialogActions: React.FC<{
    onClose: () => void;
    onConfirm: () => void;
    disabled: boolean;
    loading: boolean;
}> = ({ onClose, onConfirm, disabled, loading }) => (
    <HStack gap={3} justify="flex-end" pt={1}>
        <Button onClick={onClose} variant="outline" borderColor="gray.300" color="gray.700" size="sm" fontSize="xs" borderRadius="10px" disabled={loading}>
            Cancel
        </Button>
        <Button
            onClick={onConfirm}
            bg={ACCENT}
            color="white"
            size="sm"
            fontSize="xs"
            borderRadius="10px"
            disabled={disabled || loading}
            _hover={{ bg: '#e53939' }}
            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
        >
            {loading ? <Spinner size="xs" color="white" /> : 'Save'}
        </Button>
    </HStack>
);
