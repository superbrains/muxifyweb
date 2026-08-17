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
    Switch,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { FiGrid } from 'react-icons/fi';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    DataTable,
    StatusBadge,
} from '@shared/console';
import type { DataColumn } from '@shared/console';
import { formatCount, formatMinorAmount } from '@shared/console/lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useCreatePlacement,
    useDisablePlacement,
    useEnablePlacement,
    usePlacementInventory,
    useUpdatePlacement,
} from '../../hooks/useAdvertising';
import type {
    AdPlacementInventoryDto,
    CreatePlacementRequest,
    UpdatePlacementRequest,
} from '../../types/advertising';
import { NoAccess } from './NoAccess';

/** Placements — managed inventory slots with create/edit and enable/disable lifecycle. */
const PlacementsPage: React.FC = () => {
    const canView = useHasPermission('AdvertisingView');
    const canManage = useHasPermission('AdvertisingManage');
    const { data, isLoading, error } = usePlacementInventory();

    const [creating, setCreating] = React.useState(false);
    const [editing, setEditing] = React.useState<AdPlacementInventoryDto | null>(null);

    const columns: DataColumn<AdPlacementInventoryDto>[] = [
        {
            key: 'placement',
            header: 'Placement',
            render: (p) => (
                <VStack align="start" gap={0.5} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {p.name}
                    </Text>
                    <Text fontSize="10px" color="gray.500" lineClamp={1}>
                        {p.slug}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'surface',
            header: 'Surface',
            render: (p) => (
                <Text fontSize="xs" color="gray.700">
                    {p.surface}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (p) => <StatusBadge status={p.isEnabled ? 'Enabled' : 'Disabled'} />,
        },
        {
            key: 'cap',
            header: 'Cap',
            align: 'right',
            render: (p) => (
                <Text fontSize="xs" color="gray.700">
                    {p.inventoryCap != null ? formatCount(p.inventoryCap) : '—'}
                </Text>
            ),
        },
        {
            key: 'floor',
            header: 'Floor price',
            align: 'right',
            render: (p) => (
                <Text fontSize="xs" color="gray.700">
                    {p.floorPriceMinor != null ? formatMinorAmount(p.floorPriceMinor) : '—'}
                </Text>
            ),
        },
        {
            key: 'usage',
            header: 'Campaigns',
            align: 'right',
            render: (p) => (
                <Text fontSize="xs" color="gray.700">
                    {formatCount(p.activeCampaigns)} / {formatCount(p.totalCampaigns)}
                </Text>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (p) => (
                <PlacementRowActions
                    placement={p}
                    canManage={canManage}
                    onEdit={() => setEditing(p)}
                />
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Placements"
            subtitle="Managed inventory slots where ads run, with live campaign usage."
            breadcrumbs={[{ label: 'Advertising' }, { label: 'Placements' }]}
            actions={
                canManage ? (
                    <Button
                        size="sm"
                        fontSize="xs"
                        bg="primary.500"
                        color="white"
                        borderRadius="10px"
                        _hover={{ bg: '#E61E45' }}
                        onClick={() => setCreating(true)}
                    >
                        New placement
                    </Button>
                ) : undefined
            }
        >
            {!canView ? (
                <NoAccess />
            ) : error ? (
                <AdminError error={error} message="Could not load placements." />
            ) : isLoading && !data ? (
                <AdminLoading />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data ?? []}
                    rowKey={(p) => p.id}
                    emptyIcon={FiGrid}
                    emptyTitle="No placements"
                    emptyDescription="No placement inventory is configured yet."
                />
            )}

            {creating && <PlacementDialog onClose={() => setCreating(false)} />}
            {editing && (
                <PlacementDialog existing={editing} onClose={() => setEditing(null)} />
            )}
        </AdminPageLayout>
    );
};

export default PlacementsPage;

/* ------------------------------ Row lifecycle ----------------------------- */

const PlacementRowActions: React.FC<{
    placement: AdPlacementInventoryDto;
    canManage: boolean;
    onEdit: () => void;
}> = ({ placement, canManage, onEdit }) => {
    const enable = useEnablePlacement();
    const disable = useDisablePlacement();

    if (!canManage) return null;

    return (
        <HStack gap={2} justify="flex-end">
            <Button
                size="xs"
                fontSize="11px"
                variant="outline"
                borderColor="gray.300"
                color="gray.700"
                borderRadius="8px"
                onClick={onEdit}
            >
                Edit
            </Button>
            {placement.isEnabled ? (
                <Button
                    size="xs"
                    fontSize="11px"
                    variant="outline"
                    borderColor="gray.300"
                    color="#E53E3E"
                    borderRadius="8px"
                    loading={disable.isPending}
                    onClick={() => disable.mutate(placement.id)}
                >
                    Disable
                </Button>
            ) : (
                <Button
                    size="xs"
                    fontSize="11px"
                    bg="primary.500"
                    color="white"
                    borderRadius="8px"
                    _hover={{ bg: '#E61E45' }}
                    loading={enable.isPending}
                    onClick={() => enable.mutate(placement.id)}
                >
                    Enable
                </Button>
            )}
        </HStack>
    );
};

/* ------------------------------ Create / edit ----------------------------- */

const PlacementDialog: React.FC<{
    existing?: AdPlacementInventoryDto;
    onClose: () => void;
}> = ({ existing, onClose }) => {
    const create = useCreatePlacement();
    const update = useUpdatePlacement();
    const isEdit = !!existing;

    const [slug, setSlug] = React.useState(existing?.slug ?? '');
    const [name, setName] = React.useState(existing?.name ?? '');
    const [surface, setSurface] = React.useState(existing?.surface ?? '');
    const [isEnabled, setIsEnabled] = React.useState(existing?.isEnabled ?? true);
    const [cap, setCap] = React.useState(
        existing?.inventoryCap != null ? String(existing.inventoryCap) : '',
    );
    const [floorMajor, setFloorMajor] = React.useState(
        existing?.floorPriceMinor != null ? String(existing.floorPriceMinor / 100) : '',
    );
    const [description, setDescription] = React.useState(existing?.description ?? '');

    const inventoryCap = cap.trim() ? Math.round(parseFloat(cap) || 0) : null;
    const floorPriceMinor = floorMajor.trim()
        ? Math.round((parseFloat(floorMajor) || 0) * 100)
        : null;

    const valid = isEdit
        ? name.trim().length > 0 && surface.trim().length > 0
        : slug.trim().length > 0 && name.trim().length > 0 && surface.trim().length > 0;

    const pending = create.isPending || update.isPending;

    const submit = () => {
        if (!valid) return;
        if (isEdit && existing) {
            const payload: UpdatePlacementRequest = {
                name: name.trim(),
                surface: surface.trim(),
                inventoryCap,
                floorPriceMinor,
                description: description.trim() || null,
            };
            update.mutate({ id: existing.id, payload }, { onSuccess: onClose });
        } else {
            const payload: CreatePlacementRequest = {
                slug: slug.trim(),
                name: name.trim(),
                surface: surface.trim(),
                isEnabled,
                inventoryCap,
                floorPriceMinor,
                description: description.trim() || null,
            };
            create.mutate(payload, { onSuccess: onClose });
        }
    };

    return (
        <Dialog.Root open onOpenChange={(e) => !e.open && onClose()} placement="center">
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content maxW="520px" p={6} borderRadius="20px" position="relative">
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
                            {isEdit ? 'Edit placement' : 'New placement'}
                        </Text>
                        <VStack align="stretch" gap={3}>
                            {!isEdit && (
                                <DialogField label="Slug">
                                    <Input
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        size="sm"
                                        placeholder="home-banner"
                                    />
                                </DialogField>
                            )}
                            <SimpleGrid columns={2} gap={3}>
                                <DialogField label="Name">
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        size="sm"
                                    />
                                </DialogField>
                                <DialogField label="Surface">
                                    <Input
                                        value={surface}
                                        onChange={(e) => setSurface(e.target.value)}
                                        size="sm"
                                        placeholder="Home / Player / Search"
                                    />
                                </DialogField>
                            </SimpleGrid>
                            <SimpleGrid columns={2} gap={3}>
                                <DialogField label="Inventory cap (optional)">
                                    <Input
                                        type="number"
                                        value={cap}
                                        onChange={(e) => setCap(e.target.value)}
                                        size="sm"
                                        placeholder="e.g. 5"
                                    />
                                </DialogField>
                                <DialogField label="Floor price (major, optional)">
                                    <Input
                                        type="number"
                                        value={floorMajor}
                                        onChange={(e) => setFloorMajor(e.target.value)}
                                        size="sm"
                                        placeholder="e.g. 1000"
                                    />
                                </DialogField>
                            </SimpleGrid>
                            <DialogField label="Description (optional)">
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    fontSize="xs"
                                    resize="none"
                                />
                            </DialogField>
                            {!isEdit && (
                                <HStack justify="space-between">
                                    <Text fontSize="11px" fontWeight="semibold" color="gray.700">
                                        Enabled
                                    </Text>
                                    <Switch.Root
                                        checked={isEnabled}
                                        onCheckedChange={(e) => setIsEnabled(e.checked)}
                                    >
                                        <Switch.HiddenInput />
                                        <Switch.Control>
                                            <Switch.Thumb />
                                        </Switch.Control>
                                    </Switch.Root>
                                </HStack>
                            )}
                            <HStack gap={3} justify="flex-end" pt={1}>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    borderColor="gray.300"
                                    color="gray.700"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={pending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submit}
                                    bg="primary.500"
                                    color="white"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={!valid || pending}
                                    _hover={{ bg: '#E61E45' }}
                                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                >
                                    {pending ? (
                                        <Spinner size="xs" color="white" />
                                    ) : isEdit ? (
                                        'Save'
                                    ) : (
                                        'Create'
                                    )}
                                </Button>
                            </HStack>
                        </VStack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

const DialogField: React.FC<{ label: string; children: React.ReactNode }> = ({
    label,
    children,
}) => (
    <Box>
        <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
            {label}
        </Text>
        {children}
    </Box>
);
