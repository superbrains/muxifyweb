import React from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Icon,
    IconButton,
    Image,
    Input,
    Portal,
    SimpleGrid,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { MdAddPhotoAlternate, MdClose } from 'react-icons/md';
import { FiStar } from 'react-icons/fi';
import { ConfirmModal } from '@shared/components';
import { useChakraToast } from '@shared/hooks';
import { useAuthedImageSrc } from '@/shared/hooks/useAuthedImageSrc';
import { compressImage } from '@/shared/lib/fileUtils';
import {
    AdminError,
    AdminPageLayout,
    DataTable,
    FilterBar,
    KpiStrip,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn, KpiItem } from '../../components/ui';
import { adminDate } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { discoveryService } from '../../services/discoveryService';
import {
    useCreateFeatured,
    useDeleteFeatured,
    useFeatured,
    useSetFeaturedActive,
    useUpdateFeatured,
} from '../../hooks/useDiscovery';
import {
    DISCOVERY_CONTENT_TYPE_OPTIONS,
    type AdminFeaturedDto,
    type UpsertFeaturedRequest,
} from '../../types/discovery';
import { LinkBtn } from './discoveryShared';

const ACCENT = '#FF2D55';

const SECTION_OPTIONS = [
    { value: 'All', label: 'All sections' },
    { value: 'Hero', label: 'Hero' },
    { value: 'FeaturedArtists', label: 'Featured artists' },
    { value: 'FeaturedPlaylists', label: 'Featured playlists' },
    { value: 'EditorsPicks', label: "Editor's picks" },
    { value: 'Banner', label: 'Banner' },
];

const SECTION_VALUES = SECTION_OPTIONS.filter((o) => o.value !== 'All').map((o) => o.value);
const CONTENT_TYPE_VALUES = DISCOVERY_CONTENT_TYPE_OPTIONS.filter((o) => o.value !== 'All').map(
    (o) => o.value,
);

/** Featured content — full CRUD over curated home-feed feature slots. */
const FeaturedContentPage: React.FC = () => {
    const canManage = useHasPermission('DiscoveryManage');
    const [section, setSection] = React.useState('All');
    const { data, isLoading, error } = useFeatured({
        section: section === 'All' ? undefined : section,
    });

    const setActive = useSetFeaturedActive();
    const del = useDeleteFeatured();

    const rows = data ?? [];
    const kpis: KpiItem[] = [
        { label: 'Features', value: rows.length, tone: 'info' },
        { label: 'Active', value: rows.filter((f) => f.isActive).length, tone: 'success' },
        { label: 'Inactive', value: rows.filter((f) => !f.isActive).length, tone: 'neutral' },
        { label: 'Sections', value: new Set(rows.map((f) => f.section)).size, tone: 'warning' },
    ];

    const [editing, setEditing] = React.useState<AdminFeaturedDto | null>(null);
    const [creating, setCreating] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<AdminFeaturedDto | null>(null);

    const columns: DataColumn<AdminFeaturedDto>[] = [
        {
            key: 'item',
            header: 'Feature',
            render: (f) => (
                <HStack gap={3} minW={0}>
                    <Thumb url={f.imageUrl} />
                    <Box minW={0}>
                        <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                            {f.title}
                        </Text>
                        {f.subtitle && (
                            <Text fontSize="10px" color="gray.500" lineClamp={1}>
                                {f.subtitle}
                            </Text>
                        )}
                    </Box>
                </HStack>
            ),
        },
        {
            key: 'section',
            header: 'Section',
            render: (f) => (
                <Text fontSize="xs" color="gray.700">
                    {f.section}
                </Text>
            ),
        },
        {
            key: 'content',
            header: 'Content',
            render: (f) => (
                <Text fontSize="11px" color="gray.500" textTransform="capitalize">
                    {f.contentType}
                </Text>
            ),
        },
        { key: 'order', header: 'Order', align: 'center', render: (f) => f.displayOrder },
        {
            key: 'status',
            header: 'Status',
            render: (f) => <StatusBadge status={f.isActive ? 'Active' : 'Inactive'} />,
        },
        {
            key: 'created',
            header: 'Created',
            render: (f) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDate(f.createdAt)}
                </Text>
            ),
        },
    ];

    if (canManage) {
        columns.push({
            key: 'actions',
            header: '',
            align: 'right',
            render: (f) => (
                <HStack gap={3} justify="flex-end">
                    <LinkBtn onClick={() => setEditing(f)}>Edit</LinkBtn>
                    <LinkBtn
                        color={f.isActive ? 'gray.500' : '#16A34A'}
                        onClick={() => setActive.mutate({ id: f.id, active: !f.isActive })}
                    >
                        {f.isActive ? 'Deactivate' : 'Activate'}
                    </LinkBtn>
                    <LinkBtn color="#E53E3E" onClick={() => setDeleteTarget(f)}>
                        Delete
                    </LinkBtn>
                </HStack>
            ),
        });
    }

    return (
        <AdminPageLayout
            title="Featured Content"
            subtitle="Hand-curated feature slots rendered across the home feed sections."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Featured' }]}
            actions={
                canManage ? (
                    <Button
                        size="sm"
                        fontSize="xs"
                        bg={ACCENT}
                        color="white"
                        borderRadius="10px"
                        _hover={{ bg: '#E61E45' }}
                        onClick={() => setCreating(true)}
                    >
                        New feature
                    </Button>
                ) : undefined
            }
        >
            <VStack align="stretch" gap={4}>
                <KpiStrip items={kpis} columns={{ base: 2, md: 4, xl: 4 }} />

                <FilterBar
                    filters={[
                        {
                            key: 'section',
                            value: section,
                            onChange: setSection,
                            options: SECTION_OPTIONS,
                            width: '190px',
                        },
                    ]}
                />

                {error ? (
                    <AdminError error={error} message="Could not load featured content." />
                ) : (
                    <DataTable
                        columns={columns}
                        rows={rows}
                        rowKey={(f) => f.id}
                        loading={isLoading && !data}
                        emptyIcon={FiStar}
                        emptyTitle="No featured items"
                        emptyDescription="Create a feature to surface it on the home feed."
                    />
                )}
            </VStack>

            {creating && <FeaturedDialog onClose={() => setCreating(false)} />}
            {editing && <FeaturedDialog item={editing} onClose={() => setEditing(null)} />}

            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && del.mutate(deleteTarget.id)}
                title="Delete featured item"
                message={`Remove "${deleteTarget?.title}" from the home feed? This can't be undone.`}
                confirmText="Delete"
                isLoading={del.isPending}
            />
        </AdminPageLayout>
    );
};

export default FeaturedContentPage;

/* ===================================================================== */
/* Create / edit dialog                                                  */
/* ===================================================================== */

const FeaturedDialog: React.FC<{ item?: AdminFeaturedDto; onClose: () => void }> = ({
    item,
    onClose,
}) => {
    const isEdit = !!item;
    const create = useCreateFeatured();
    const update = useUpdateFeatured();
    const toast = useChakraToast();

    const [title, setTitle] = React.useState(item?.title ?? '');
    const [subtitle, setSubtitle] = React.useState(item?.subtitle ?? '');
    const [section, setSection] = React.useState(item?.section ?? SECTION_VALUES[0]);
    const [contentType, setContentType] = React.useState(item?.contentType ?? CONTENT_TYPE_VALUES[0]);
    const [contentId, setContentId] = React.useState(item?.contentId ?? '');
    const [actionUrl, setActionUrl] = React.useState(item?.actionUrl ?? '');
    const [imageUrl, setImageUrl] = React.useState(item?.imageUrl ?? '');
    const [displayOrder, setDisplayOrder] = React.useState(String(item?.displayOrder ?? 0));
    const [genreId, setGenreId] = React.useState(item?.genreId ?? '');
    const [startDate, setStartDate] = React.useState(toLocalInput(item?.startDate ?? undefined));
    const [endDate, setEndDate] = React.useState(toLocalInput(item?.endDate ?? undefined));

    const valid = title.trim().length > 0 && contentId.trim().length > 0;
    const pending = create.isPending || update.isPending;

    const submit = () => {
        if (!valid) {
            toast.error('Missing fields', 'Title and a Content ID are required.');
            return;
        }
        const payload: UpsertFeaturedRequest = {
            title: title.trim(),
            subtitle: subtitle.trim() || null,
            section,
            contentType,
            contentId: contentId.trim(),
            actionUrl: actionUrl.trim() || null,
            imageUrl: imageUrl.trim() || null,
            displayOrder: Number(displayOrder) || 0,
            genreId: genreId.trim() || null,
            startDate: startDate ? new Date(startDate).toISOString() : null,
            endDate: endDate ? new Date(endDate).toISOString() : null,
        };
        const onDone = { onSuccess: onClose };
        if (isEdit) update.mutate({ id: item!.id, payload }, onDone);
        else create.mutate(payload, onDone);
    };

    return (
        <DialogShell title={isEdit ? 'Edit feature' : 'New feature'} onClose={onClose}>
            <VStack align="stretch" gap={3}>
                <FieldRow label="Feature image">
                    <FeaturedImageField value={imageUrl} onChange={setImageUrl} />
                </FieldRow>
                <FieldRow label="Title">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        size="sm"
                        placeholder="e.g. Fresh from Lagos"
                    />
                </FieldRow>
                <FieldRow label="Subtitle (optional)">
                    <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} size="sm" />
                </FieldRow>
                <SimpleGrid columns={2} gap={3}>
                    <FieldRow label="Section">
                        <NativeSelect
                            value={section}
                            onChange={setSection}
                            options={SECTION_VALUES}
                        />
                    </FieldRow>
                    <FieldRow label="Content type">
                        <NativeSelect
                            value={contentType}
                            onChange={setContentType}
                            options={CONTENT_TYPE_VALUES}
                        />
                    </FieldRow>
                </SimpleGrid>
                <FieldRow label="Content ID">
                    <Input
                        value={contentId}
                        onChange={(e) => setContentId(e.target.value)}
                        size="sm"
                        placeholder="GUID of the featured content"
                    />
                </FieldRow>
                <SimpleGrid columns={2} gap={3}>
                    <FieldRow label="Display order (lower first)">
                        <Input
                            type="number"
                            value={displayOrder}
                            onChange={(e) => setDisplayOrder(e.target.value)}
                            size="sm"
                        />
                    </FieldRow>
                    <FieldRow label="Genre ID (optional)">
                        <Input value={genreId} onChange={(e) => setGenreId(e.target.value)} size="sm" />
                    </FieldRow>
                </SimpleGrid>
                <FieldRow label="Action URL (optional)">
                    <Input
                        value={actionUrl}
                        onChange={(e) => setActionUrl(e.target.value)}
                        size="sm"
                        placeholder="Deep link or https://…"
                    />
                </FieldRow>
                <SimpleGrid columns={2} gap={3}>
                    <FieldRow label="Start (optional)">
                        <Input
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            size="sm"
                        />
                    </FieldRow>
                    <FieldRow label="End (optional)">
                        <Input
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            size="sm"
                        />
                    </FieldRow>
                </SimpleGrid>
                <DialogActions onClose={onClose} onConfirm={submit} disabled={!valid} loading={pending} />
            </VStack>
        </DialogShell>
    );
};

/* ===================================================================== */
/* Image field + thumbnail                                               */
/* ===================================================================== */

const Thumb: React.FC<{ url?: string | null }> = ({ url }) => {
    const resolved = useAuthedImageSrc(url || undefined);
    return (
        <Box w="48px" h="32px" borderRadius="6px" overflow="hidden" bg="gray.100" flexShrink={0}>
            {resolved && <Image src={resolved} w="100%" h="100%" objectFit="cover" alt="" />}
        </Box>
    );
};

const FeaturedImageField: React.FC<{ value: string; onChange: (url: string) => void }> = ({
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
            const { imageUrl } = await discoveryService.uploadFeaturedImage(file);
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
                    16:9 · PNG/JPEG/WebP · ≤ 4 MB
                </Text>
            </VStack>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
        </HStack>
    );
};

/* ===================================================================== */
/* Small shared pieces                                                   */
/* ===================================================================== */

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

const FieldRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <Box>
        <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
            {label}
        </Text>
        {children}
    </Box>
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
                <Dialog.Content maxW="600px" p={6} borderRadius="20px" position="relative">
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
            _hover={{ bg: '#E61E45' }}
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
