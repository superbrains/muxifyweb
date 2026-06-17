import React from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Icon,
    IconButton,
    Image,
    Portal,
    SimpleGrid,
    Spinner,
    Text,
    Input,
    VStack,
} from '@chakra-ui/react';
import { MdClose, MdAddPhotoAlternate } from 'react-icons/md';
import { FiGift, FiPlus } from 'react-icons/fi';
import {
    AdminError,
    ConfirmActionModal,
    DataTable,
    KpiStrip,
    StatusBadge,
} from '../../../components/ui';
import type { DataColumn, KpiItem } from '../../../components/ui';
import { useChakraToast } from '@shared/hooks';
import { useAuthedImageSrc } from '@/shared/hooks/useAuthedImageSrc';
import { compressImage } from '@/shared/lib/fileUtils';
import { coinEconomyService } from '../../../services/coinEconomyService';
import {
    useAvailableGiftTypes,
    useCoinEconomySettings,
    useCreateGiftType,
    useGiftTypes,
    useSetGiftTypeActive,
    useUpdateGiftType,
} from '../../../hooks/useCoinEconomy';
import type { AdminGiftType, UpsertGiftTypeRequest } from '../../../types/coinEconomy';

const ACCENT = '#f94444';
const nf = new Intl.NumberFormat('en-NG');

/**
 * Gift catalog management — create / edit / activate / deactivate the gifts fans
 * can send, including image upload, premium flag, display order and min level.
 * This is the single source for gift-type configuration (the Coin Economy page
 * links here). Reuses the existing coin-economy gift hooks + image upload.
 */
const GiftCatalog: React.FC = () => {
    const { data: settings } = useCoinEconomySettings();
    const { data, isLoading, error } = useGiftTypes();
    const setActive = useSetGiftTypeActive();
    const [editing, setEditing] = React.useState<AdminGiftType | null>(null);
    const [creating, setCreating] = React.useState(false);
    const [toggle, setToggle] = React.useState<AdminGiftType | null>(null);

    const rate = settings?.coinsPerNairaMajor ?? 50;
    const gifts = data ?? [];

    const kpis: KpiItem[] = [
        { label: 'Gift types', value: gifts.length },
        { label: 'Active', value: gifts.filter((g) => g.isActive).length, tone: 'success' },
        { label: 'Inactive', value: gifts.filter((g) => !g.isActive).length, tone: 'neutral' },
        { label: 'Premium', value: gifts.filter((g) => g.isPremium).length, tone: 'warning' },
    ];

    const columns: DataColumn<AdminGiftType>[] = [
        {
            key: 'gift',
            header: 'Gift',
            render: (g) => (
                <HStack gap={2.5}>
                    <GiftImage icon={g.icon} />
                    <Box minW={0}>
                        <HStack gap={1.5}>
                            <Text fontSize="xs" fontWeight="semibold" color="gray.800" lineClamp={1}>
                                {g.name}
                            </Text>
                            {g.isPremium && (
                                <Box
                                    px={1.5}
                                    py="1px"
                                    borderRadius="full"
                                    bg="#FFF4D6"
                                    color="#B7791F"
                                    fontSize="9px"
                                    fontWeight="bold"
                                    letterSpacing="0.4px"
                                >
                                    PREMIUM
                                </Box>
                            )}
                        </HStack>
                        <Text fontSize="10px" color="gray.500">
                            {g.giftType}
                            {g.minLevelRequired != null ? ` · min level ${g.minLevelRequired}` : ''}
                        </Text>
                    </Box>
                </HStack>
            ),
        },
        {
            key: 'cost',
            header: 'Coin cost',
            align: 'right',
            render: (g) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                    {nf.format(g.coinCost)}
                </Text>
            ),
        },
        {
            key: 'naira',
            header: 'Artist value',
            align: 'right',
            render: (g) => (
                <Text fontSize="xs" color="gray.500">
                    {rate > 0 ? `≈ ₦${nf.format(g.coinCost / rate)}` : '—'}
                </Text>
            ),
        },
        {
            key: 'order',
            header: 'Order',
            align: 'right',
            render: (g) => (
                <Text fontSize="xs" color="gray.500">
                    {g.displayOrder}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (g) => <StatusBadge status={g.isActive ? 'Active' : 'Inactive'} />,
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (g) => (
                <HStack gap={2} justify="flex-end" onClick={(e) => e.stopPropagation()}>
                    <LinkBtn onClick={() => setEditing(g)}>Edit</LinkBtn>
                    <LinkBtn color={g.isActive ? '#C53030' : 'green.600'} onClick={() => setToggle(g)}>
                        {g.isActive ? 'Deactivate' : 'Activate'}
                    </LinkBtn>
                </HStack>
            ),
        },
    ];

    return (
        <VStack align="stretch" gap={{ base: 3, lg: 4 }}>
            <KpiStrip items={kpis} columns={{ base: 2, md: 4, xl: 4 }} />

            <HStack justify="space-between" align="center">
                <Text fontSize="xs" color="gray.500">
                    Gifts fans can send to creators. Ordering controls how they appear in the app.
                </Text>
                <Button
                    size="sm"
                    fontSize="xs"
                    bg={ACCENT}
                    color="white"
                    _hover={{ bg: '#e53939' }}
                    onClick={() => setCreating(true)}
                >
                    <Icon as={FiPlus} mr={1} /> Add gift
                </Button>
            </HStack>

            {error ? (
                <AdminError error={error} message="Could not load gifts." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={gifts}
                    rowKey={(g) => g.id}
                    loading={isLoading && !data}
                    emptyIcon={FiGift}
                    emptyTitle="No gifts configured"
                    emptyDescription="Add the gifts fans can send to creators."
                />
            )}

            {(creating || editing) && (
                <GiftDialog
                    rate={rate}
                    gift={editing}
                    onClose={() => {
                        setCreating(false);
                        setEditing(null);
                    }}
                />
            )}

            <ConfirmActionModal
                isOpen={toggle !== null}
                onClose={() => setToggle(null)}
                requireReason={false}
                onConfirm={() => {
                    if (!toggle) return;
                    setActive.mutate(
                        { id: toggle.id, active: !toggle.isActive },
                        { onSuccess: () => setToggle(null) },
                    );
                }}
                title={toggle?.isActive ? 'Deactivate gift?' : 'Activate gift?'}
                message={
                    toggle?.isActive
                        ? `${toggle?.name} will no longer be sendable by fans.`
                        : `${toggle?.name ?? 'This gift'} will become sendable again.`
                }
                confirmText={toggle?.isActive ? 'Deactivate' : 'Activate'}
                tone={toggle?.isActive ? 'danger' : 'primary'}
                isLoading={setActive.isPending}
            />
        </VStack>
    );
};

export default GiftCatalog;

/* ===================================================================== */
/* Gift image rendering + upload                                          */
/* ===================================================================== */

/** True when an icon value is an uploaded image (URL/proxy path) rather than a legacy emoji. */
const isGiftImageUrl = (icon?: string | null): boolean =>
    typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('/'));

/** Renders a gift's icon: an uploaded image (via the JWT media proxy) or a legacy emoji fallback. */
const GiftImage: React.FC<{ icon?: string | null; size?: number }> = ({ icon, size = 32 }) => {
    const resolved = useAuthedImageSrc(isGiftImageUrl(icon) ? (icon as string) : undefined);
    if (isGiftImageUrl(icon)) {
        return (
            <Box
                w={`${size}px`}
                h={`${size}px`}
                borderRadius="lg"
                overflow="hidden"
                bg="gray.100"
                flexShrink={0}
            >
                {resolved && <Image src={resolved} alt="gift" w="full" h="full" objectFit="cover" />}
            </Box>
        );
    }
    return <Text fontSize="lg">{icon}</Text>;
};

/** Click-to-upload gift image field with preview. Stores the returned media-proxy URL in `value`. */
const GiftImageField: React.FC<{ value: string; onChange: (url: string) => void }> = ({ value, onChange }) => {
    const toast = useChakraToast();
    const fileRef = React.useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = React.useState(false);
    const [localPreview, setLocalPreview] = React.useState<string | null>(null);
    const resolved = useAuthedImageSrc(isGiftImageUrl(value) ? value : undefined);
    const isLegacyEmoji = !!value && !isGiftImageUrl(value);
    const previewSrc = localPreview ?? (isGiftImageUrl(value) ? resolved : undefined);

    const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Invalid file type', 'Please select an image file.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File too large', 'Please select an image smaller than 2MB.');
            return;
        }
        try {
            setLocalPreview(await compressImage(file, 256, 256, 0.8));
        } catch {
            /* preview is best-effort */
        }
        setUploading(true);
        try {
            const { imageUrl } = await coinEconomyService.uploadGiftImage(file);
            onChange(imageUrl);
        } catch {
            toast.error('Upload failed', 'Could not upload the gift image. Please try again.');
            setLocalPreview(null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <HStack gap={3} align="center">
            <Box
                position="relative"
                w="64px"
                h="64px"
                borderRadius="md"
                border="1px dashed"
                borderColor="gray.300"
                bg="gray.50"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                overflow="hidden"
                flexShrink={0}
                onClick={() => fileRef.current?.click()}
            >
                {uploading ? (
                    <Spinner size="sm" color={ACCENT} />
                ) : previewSrc ? (
                    <Image src={previewSrc} alt="gift" w="full" h="full" objectFit="cover" />
                ) : isLegacyEmoji ? (
                    <Text fontSize="2xl">{value}</Text>
                ) : (
                    <Icon as={MdAddPhotoAlternate} boxSize={6} color="gray.400" />
                )}
            </Box>
            <VStack align="start" gap={0.5}>
                <Button size="xs" variant="outline" onClick={() => fileRef.current?.click()} loading={uploading}>
                    {isGiftImageUrl(value) || isLegacyEmoji ? 'Change image' : 'Upload image'}
                </Button>
                <Text fontSize="10px" color="gray.500">
                    PNG, JPG or WebP · ≤ 2MB
                </Text>
            </VStack>
            <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: 'none' }}
                onChange={onFile}
            />
        </HStack>
    );
};

/* ===================================================================== */
/* Gift create / edit dialog                                             */
/* ===================================================================== */

const GiftDialog: React.FC<{
    rate: number;
    gift: AdminGiftType | null;
    onClose: () => void;
}> = ({ rate, gift, onClose }) => {
    const create = useCreateGiftType();
    const update = useUpdateGiftType();
    const { data: available } = useAvailableGiftTypes();
    const isEdit = gift !== null;

    const [giftType, setGiftType] = React.useState(gift?.giftType ?? '');
    const [name, setName] = React.useState(gift?.name ?? '');
    const [description, setDescription] = React.useState(gift?.description ?? '');
    const [coinCost, setCoinCost] = React.useState(String(gift?.coinCost ?? ''));
    const [icon, setIcon] = React.useState(gift?.icon ?? '');
    const [animation, setAnimation] = React.useState(gift?.animation ?? '');
    const [displayOrder, setDisplayOrder] = React.useState(String(gift?.displayOrder ?? 0));
    const [isPremium, setIsPremium] = React.useState(gift?.isPremium ?? false);
    const [minLevel, setMinLevel] = React.useState(
        gift?.minLevelRequired != null ? String(gift.minLevelRequired) : '',
    );

    const options = React.useMemo(() => available ?? [], [available]);
    React.useEffect(() => {
        if (!isEdit && !giftType && options.length > 0) setGiftType(options[0].giftType);
    }, [isEdit, giftType, options]);

    const costNum = Number(coinCost) || 0;
    const valid = name.trim() && icon.trim() && costNum > 0 && (isEdit || giftType);
    const pending = create.isPending || update.isPending;

    const submit = () => {
        const payload: UpsertGiftTypeRequest = {
            giftType: isEdit && gift ? gift.giftType : giftType,
            name: name.trim(),
            description: description.trim() || null,
            coinCost: costNum,
            icon: icon.trim(),
            animation: animation.trim() || null,
            displayOrder: Number(displayOrder) || 0,
            isPremium,
            minLevelRequired: minLevel.trim() ? Number(minLevel) : null,
        };
        const opts = { onSuccess: onClose };
        if (isEdit && gift) update.mutate({ id: gift.id, payload }, opts);
        else create.mutate(payload, opts);
    };

    return (
        <DialogShell title={isEdit ? 'Edit gift' : 'New gift'} onClose={onClose}>
            <VStack align="stretch" gap={3}>
                <FieldRow label="Gift type">
                    {isEdit ? (
                        <Input value={giftType} disabled size="sm" />
                    ) : options.length === 0 ? (
                        <Text fontSize="xs" color="gray.500">
                            All gift types are already configured.
                        </Text>
                    ) : (
                        <select
                            value={giftType}
                            onChange={(e) => setGiftType(e.target.value)}
                            style={{
                                fontSize: '12px',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                                background: 'white',
                                width: '100%',
                            }}
                        >
                            {options.map((o) => (
                                <option key={o.giftType} value={o.giftType}>
                                    {o.giftType}
                                </option>
                            ))}
                        </select>
                    )}
                </FieldRow>
                <FieldRow label="Gift image">
                    <GiftImageField value={icon} onChange={setIcon} />
                </FieldRow>
                <SimpleGrid columns={2} gap={3}>
                    <FieldRow label="Name">
                        <Input value={name} onChange={(e) => setName(e.target.value)} size="sm" />
                    </FieldRow>
                    <FieldRow label="Coin cost">
                        <Input type="number" value={coinCost} onChange={(e) => setCoinCost(e.target.value)} size="sm" />
                    </FieldRow>
                    <FieldRow label="Display order">
                        <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} size="sm" />
                    </FieldRow>
                    <FieldRow label="Animation (optional)">
                        <Input value={animation} onChange={(e) => setAnimation(e.target.value)} size="sm" />
                    </FieldRow>
                    <FieldRow label="Min level (optional)">
                        <Input type="number" value={minLevel} onChange={(e) => setMinLevel(e.target.value)} size="sm" />
                    </FieldRow>
                </SimpleGrid>
                <FieldRow label="Description (optional)">
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} size="sm" />
                </FieldRow>
                <Checkbox checked={isPremium} onChange={setIsPremium} label="Premium gift" />
                <Box bg="gray.50" borderRadius="md" p={2.5}>
                    <Text fontSize="11px" color="gray.600">
                        {costNum > 0 && rate > 0
                            ? `Fan pays ${nf.format(costNum)} coins · artist value ≈ ₦${nf.format(costNum / rate)} (before fee)`
                            : 'Enter a coin cost to preview the Naira value.'}
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

const FieldRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <Box>
        <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
            {label}
        </Text>
        {children}
    </Box>
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
