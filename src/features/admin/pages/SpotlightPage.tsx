import React from 'react';
import {
    Badge,
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
import { FiStar } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    DataTable,
    KpiStrip,
    StatusBadge as KitStatusBadge,
} from '@shared/console';
import type { DataColumn, KpiItem } from '@shared/console';
import { ConfirmModal } from '@shared/components';
import { useChakraToast } from '@shared/hooks';
import { useAuthedImageSrc } from '@/shared/hooks/useAuthedImageSrc';
import { compressImage } from '@/shared/lib/fileUtils';
import { spotlightService } from '../services/spotlightService';
import { SpotlightEntityPicker } from '../components/SpotlightEntityPicker';
import {
    useSpotlights,
    useCreateSpotlight,
    useUpdateSpotlight,
    useSetSpotlightActive,
    useDeleteSpotlight,
} from '../hooks/useSpotlight';
import {
    SPOTLIGHT_TYPES,
    type AdminSpotlight,
    type SpotlightType,
    type UpsertSpotlightRequest,
} from '../types/spotlight';

const ACCENT = '#f94444';
const nf = new Intl.NumberFormat('en-NG');

/** Types that point at an internal entity (need a Content ID) vs. an external/banner promo. */
const CONTENT_TYPES: SpotlightType[] = ['Track', 'Album', 'Artist', 'Playlist', 'Video', 'NewRelease'];

/* ===================================================================== */
/* Page                                                                  */
/* ===================================================================== */

const SpotlightPage: React.FC = () => {
    const { data, isLoading, error } = useSpotlights();
    const setActive = useSetSpotlightActive();
    const del = useDeleteSpotlight();

    const [editing, setEditing] = React.useState<AdminSpotlight | null>(null);
    const [creating, setCreating] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<AdminSpotlight | null>(null);

    const rows = data ?? [];
    const kpis: KpiItem[] = [
        { label: 'Spotlights', value: rows.length, tone: 'info' },
        { label: 'Live', value: rows.filter((s) => spotlightStatus(s) === 'Live').length, tone: 'success' },
        { label: 'Scheduled', value: rows.filter((s) => spotlightStatus(s) === 'Scheduled').length, tone: 'warning' },
        { label: 'Inactive', value: rows.filter((s) => !s.isActive).length, tone: 'neutral' },
    ];

    const columns: DataColumn<AdminSpotlight>[] = [
        {
            key: 'item',
            header: 'Spotlight',
            render: (s) => (
                <HStack gap={3}>
                    <SpotlightThumb url={s.imageUrl} />
                    <Box minW={0}>
                        <Text fontSize="xs" fontWeight="semibold" color="gray.900" truncate>
                            {s.title}
                        </Text>
                        {s.subtitle && (
                            <Text fontSize="11px" color="gray.500" truncate>
                                {s.subtitle}
                            </Text>
                        )}
                    </Box>
                </HStack>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            render: (s) => (
                <Badge size="sm" colorPalette="purple" variant="subtle">
                    {s.type}
                </Badge>
            ),
        },
        { key: 'priority', header: 'Priority', align: 'center', render: (s) => s.priority },
        {
            key: 'status',
            header: 'Status',
            render: (s) => <KitStatusBadge status={spotlightStatus(s)} />,
        },
        {
            key: 'engagement',
            header: 'Engagement',
            render: (s) => (
                <Text fontSize="11px" color="gray.600">
                    {nf.format(s.clickCount)} taps · {nf.format(s.impressionCount)} views
                </Text>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (s) => (
                <HStack gap={3} justify="flex-end">
                    <LinkBtn onClick={() => setEditing(s)}>Edit</LinkBtn>
                    <LinkBtn
                        color={s.isActive ? 'gray.500' : '#1f9d55'}
                        onClick={() => setActive.mutate({ id: s.id, active: !s.isActive })}
                    >
                        {s.isActive ? 'Deactivate' : 'Activate'}
                    </LinkBtn>
                    <LinkBtn color="#d64545" onClick={() => setDeleteTarget(s)}>
                        Delete
                    </LinkBtn>
                </HStack>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Spotlight"
            subtitle="Curate the featured banners shown on the mobile home feed. Active, in-window items appear by priority."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Spotlight' }]}
            actions={
                <Button
                    size="sm"
                    fontSize="xs"
                    bg={ACCENT}
                    color="white"
                    borderRadius="10px"
                    _hover={{ bg: '#e53939' }}
                    onClick={() => setCreating(true)}
                >
                    New spotlight
                </Button>
            }
        >
            <VStack align="stretch" gap={4}>
                <KpiStrip items={kpis} columns={{ base: 2, md: 4, xl: 4 }} />

                {error ? (
                    <AdminError error={error} message="Could not load spotlight items." />
                ) : (
                    <DataTable
                        columns={columns}
                        rows={rows}
                        rowKey={(s) => s.id}
                        loading={isLoading && !data}
                        emptyIcon={FiStar}
                        emptyTitle="No spotlight items yet"
                        emptyDescription="Create one to feature it on the home feed."
                    />
                )}
            </VStack>

            {creating && <SpotlightDialog onClose={() => setCreating(false)} />}
            {editing && <SpotlightDialog item={editing} onClose={() => setEditing(null)} />}

            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && del.mutate(deleteTarget.id)}
                title="Delete spotlight"
                message={`Remove "${deleteTarget?.title}" from the home feed? This can't be undone.`}
                confirmText="Delete"
                isLoading={del.isPending}
            />
        </AdminPageLayout>
    );
};

export default SpotlightPage;

/* ===================================================================== */
/* Status                                                                */
/* ===================================================================== */

/** Derives the live/scheduled/expired/inactive status string for a spotlight. */
const spotlightStatus = (item: AdminSpotlight): string => {
    const now = Date.now();
    const start = new Date(item.startDate).getTime();
    const end = item.endDate ? new Date(item.endDate).getTime() : null;
    if (!item.isActive) return 'Inactive';
    if (start > now) return 'Scheduled';
    if (end !== null && end <= now) return 'Expired';
    return 'Live';
};

/* ===================================================================== */
/* Create / edit dialog                                                  */
/* ===================================================================== */

const SpotlightDialog: React.FC<{ item?: AdminSpotlight; onClose: () => void }> = ({ item, onClose }) => {
    const isEdit = !!item;
    const create = useCreateSpotlight();
    const update = useUpdateSpotlight();
    const toast = useChakraToast();

    const [title, setTitle] = React.useState(item?.title ?? '');
    const [subtitle, setSubtitle] = React.useState(item?.subtitle ?? '');
    const [type, setType] = React.useState<SpotlightType>(item?.type ?? 'Promotion');
    const [contentId, setContentId] = React.useState(item?.contentId ?? '');
    const [externalUrl, setExternalUrl] = React.useState(item?.externalUrl ?? '');
    const [imageUrl, setImageUrl] = React.useState(item?.imageUrl ?? '');
    const [priority, setPriority] = React.useState(String(item?.priority ?? 0));
    const [isActive, setIsActive] = React.useState(item?.isActive ?? true);
    const [startDate, setStartDate] = React.useState(toLocalInput(item?.startDate));
    const [endDate, setEndDate] = React.useState(toLocalInput(item?.endDate ?? undefined));

    const needsContentId = CONTENT_TYPES.includes(type);

    /** Switching type invalidates a previously chosen entity (a track id ≠ an album id). */
    const onTypeChange = (next: SpotlightType) => {
        if (next !== type) setContentId('');
        setType(next);
    };

    const valid =
        title.trim().length > 0 &&
        imageUrl.trim().length > 0 &&
        (!needsContentId || contentId.trim().length > 0);

    const pending = create.isPending || update.isPending;

    const submit = () => {
        if (!valid) {
            toast.error('Missing fields', 'Title, image and (for content types) a Content ID are required.');
            return;
        }
        const payload: UpsertSpotlightRequest = {
            title: title.trim(),
            subtitle: subtitle.trim() || null,
            type,
            contentId: needsContentId ? contentId.trim() : null,
            externalUrl: !needsContentId ? externalUrl.trim() || null : null,
            imageUrl: imageUrl.trim(),
            priority: Number(priority) || 0,
            isActive,
            startDate: startDate ? new Date(startDate).toISOString() : null,
            endDate: endDate ? new Date(endDate).toISOString() : null,
        };
        const onDone = { onSuccess: onClose };
        if (isEdit) update.mutate({ id: item!.id, payload }, onDone);
        else create.mutate(payload, onDone);
    };

    return (
        <DialogShell title={isEdit ? 'Edit spotlight' : 'New spotlight'} onClose={onClose}>
            <VStack align="stretch" gap={3}>
                <FieldRow label="Banner image">
                    <SpotlightImageField value={imageUrl} onChange={setImageUrl} />
                </FieldRow>
                <FieldRow label="Title">
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} size="sm" placeholder="e.g. Summer Anthems" />
                </FieldRow>
                <FieldRow label="Subtitle (optional)">
                    <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} size="sm" />
                </FieldRow>
                <SimpleGrid columns={2} gap={3}>
                    <FieldRow label="Type">
                        <select
                            value={type}
                            onChange={(e) => onTypeChange(e.target.value as SpotlightType)}
                            style={{
                                fontSize: '12px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #E2E8F0',
                                background: 'white',
                                width: '100%',
                            }}
                        >
                            {SPOTLIGHT_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </FieldRow>
                    <FieldRow label="Priority (higher first)">
                        <Input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} size="sm" />
                    </FieldRow>
                </SimpleGrid>
                {needsContentId ? (
                    <FieldRow label={`Featured ${type === 'NewRelease' ? 'new release' : type.toLowerCase()}`}>
                        <SpotlightEntityPicker
                            type={type}
                            value={contentId}
                            initialLabel={item?.title}
                            onSelect={(p) => {
                                setContentId(p.id);
                                if (!title.trim()) setTitle(p.title);
                                if (!subtitle.trim() && p.subtitle) setSubtitle(p.subtitle);
                                if (!imageUrl.trim() && p.imageUrl) setImageUrl(p.imageUrl);
                            }}
                            onClear={() => setContentId('')}
                        />
                    </FieldRow>
                ) : (
                    <FieldRow label="External URL (optional)">
                        <Input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} size="sm" placeholder="https://…" />
                    </FieldRow>
                )}
                <SimpleGrid columns={2} gap={3}>
                    <FieldRow label="Start (optional)">
                        <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} size="sm" />
                    </FieldRow>
                    <FieldRow label="End (optional)">
                        <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} size="sm" />
                    </FieldRow>
                </SimpleGrid>
                <Checkbox checked={isActive} onChange={setIsActive} label="Active (visible on the feed)" />
                <DialogActions onClose={onClose} onConfirm={submit} disabled={!valid} loading={pending} />
            </VStack>
        </DialogShell>
    );
};

/* ===================================================================== */
/* Image field + thumbnail                                               */
/* ===================================================================== */

const SpotlightThumb: React.FC<{ url?: string | null }> = ({ url }) => {
    const resolved = useAuthedImageSrc(url || undefined);
    return (
        <Box w="48px" h="32px" borderRadius="6px" overflow="hidden" bg="gray.100" flexShrink={0}>
            {resolved && <Image src={resolved} w="100%" h="100%" objectFit="cover" alt="" />}
        </Box>
    );
};

const SpotlightImageField: React.FC<{ value: string; onChange: (url: string) => void }> = ({
    value,
    onChange,
}) => {
    const toast = useChakraToast();
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = React.useState(false);
    const [localPreview, setLocalPreview] = React.useState<string | null>(null);
    const resolved = useAuthedImageSrc(value || undefined);
    const previewSrc = localPreview ?? resolved;

    const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setLocalPreview(await compressImage(file, 800, 450, 0.85));
        } catch {
            /* preview is best-effort */
        }
        setUploading(true);
        try {
            const { imageUrl } = await spotlightService.uploadImage(file);
            onChange(imageUrl);
        } catch {
            toast.error('Upload failed', 'Could not upload the image. Please try again.');
            setLocalPreview(null);
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <HStack gap={3} align="center">
            <Box
                w="120px"
                h="68px"
                borderRadius="10px"
                overflow="hidden"
                bg="gray.50"
                border="1px dashed"
                borderColor="gray.300"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
            >
                {previewSrc ? (
                    <Image src={previewSrc} w="100%" h="100%" objectFit="cover" alt="" />
                ) : (
                    <Icon as={MdAddPhotoAlternate} boxSize={6} color="gray.400" />
                )}
            </Box>
            <VStack align="stretch" gap={1.5}>
                <Button
                    size="xs"
                    variant="outline"
                    borderColor="gray.300"
                    color="gray.700"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                >
                    {uploading ? <Spinner size="xs" /> : value ? 'Replace image' : 'Upload image'}
                </Button>
                <Text fontSize="10px" color="gray.500">
                    16:9 banner · PNG/JPEG/WebP · ≤ 4 MB
                </Text>
            </VStack>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
        </HStack>
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
    <Text
        as="button"
        fontSize="xs"
        fontWeight="medium"
        color={color}
        onClick={onClick}
        _hover={{ textDecoration: 'underline' }}
    >
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
        <Button
            onClick={onClose}
            variant="outline"
            borderColor="gray.300"
            color="gray.700"
            size="sm"
            fontSize="xs"
            borderRadius="10px"
            disabled={loading}
        >
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

/** ISO → value for <input type="datetime-local"> (local time, minute precision). */
function toLocalInput(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
