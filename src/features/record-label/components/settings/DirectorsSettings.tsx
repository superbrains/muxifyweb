import React, { useState } from 'react';
import {
    Badge,
    Box,
    Button,
    HStack,
    Icon,
    IconButton,
    Menu,
    Portal,
    Text,
    VStack,
} from '@chakra-ui/react';
import {
    FiCheckCircle,
    FiEdit2,
    FiFileText,
    FiMail,
    FiMoreVertical,
    FiPhone,
    FiPlus,
    FiTrash2,
    FiUploadCloud,
    FiUser,
} from 'react-icons/fi';
import { ConfirmModal } from '@shared/components/ConfirmModal';
import {
    useAddLabelDirector,
    useRemoveLabelDirector,
    useUpdateLabelDirector,
    useUploadDirectorIdentity,
} from '../../hooks/useLabelSettings';
import type {
    AddLabelDirectorRequest,
    LabelDirectorDto,
} from '../../types';
import { DirectorFormDialog } from './DirectorFormDialog';
import { UploadIdentityDocDialog } from './UploadIdentityDocDialog';

interface DirectorsSettingsProps {
    directors: LabelDirectorDto[];
}

export const DirectorsSettings: React.FC<DirectorsSettingsProps> = ({
    directors,
}) => {
    const [addOpen, setAddOpen] = useState(false);
    const [editing, setEditing] = useState<LabelDirectorDto | null>(null);
    const [removing, setRemoving] = useState<LabelDirectorDto | null>(null);
    const [uploadingId, setUploadingId] = useState<LabelDirectorDto | null>(null);

    const addDirector = useAddLabelDirector();
    const updateDirector = useUpdateLabelDirector();
    const removeDirector = useRemoveLabelDirector();
    const uploadIdentity = useUploadDirectorIdentity();

    const handleAdd = async (req: AddLabelDirectorRequest) => {
        await addDirector.mutateAsync(req);
    };

    const handleEdit = async (req: AddLabelDirectorRequest) => {
        if (!editing) return;
        await updateDirector.mutateAsync({ directorId: editing.id, req });
    };

    const handleRemove = async () => {
        if (!removing) return;
        await removeDirector.mutateAsync(removing.id);
        setRemoving(null);
    };

    const handleUpload = async (file: File) => {
        if (!uploadingId) return;
        await uploadIdentity.mutateAsync({ directorId: uploadingId.id, file });
    };

    return (
        <Box>
            <HStack justify="space-between" align="center" mb={4}>
                <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        Directors ({directors.length})
                    </Text>
                    <Text fontSize="11px" color="gray.500">
                        At least one director with an uploaded ID is required for verification.
                    </Text>
                </Box>
                <Button
                    size="sm"
                    fontSize="xs"
                    bg="primary.500"
                    color="white"
                    _hover={{ bg: 'primary.600' }}
                    onClick={() => setAddOpen(true)}
                >
                    <HStack gap={1}>
                        <Icon as={FiPlus} />
                        <span>Add director</span>
                    </HStack>
                </Button>
            </HStack>

            {directors.length === 0 ? (
                <Box
                    borderRadius="12px"
                    bg="gray.50"
                    p={8}
                    textAlign="center"
                    border="1px dashed"
                    borderColor="gray.300"
                >
                    <Icon as={FiUser} boxSize="32px" color="gray.400" mb={2} />
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        No directors yet
                    </Text>
                    <Text fontSize="xs" color="gray.500" mb={4}>
                        Add the directors registered to your company to begin verification.
                    </Text>
                    <Button
                        size="sm"
                        fontSize="xs"
                        bg="primary.500"
                        color="white"
                        _hover={{ bg: 'primary.600' }}
                        onClick={() => setAddOpen(true)}
                    >
                        Add your first director
                    </Button>
                </Box>
            ) : (
                <VStack align="stretch" gap={3}>
                    {directors.map((d) => (
                        <DirectorRow
                            key={d.id}
                            director={d}
                            onEdit={() => setEditing(d)}
                            onRemove={() => setRemoving(d)}
                            onUploadId={() => setUploadingId(d)}
                        />
                    ))}
                </VStack>
            )}

            <DirectorFormDialog
                isOpen={addOpen}
                onClose={() => setAddOpen(false)}
                mode="add"
                onSubmit={handleAdd}
                submitting={addDirector.isPending}
            />

            <DirectorFormDialog
                isOpen={editing !== null}
                onClose={() => setEditing(null)}
                mode="edit"
                director={editing ?? undefined}
                onSubmit={handleEdit}
                submitting={updateDirector.isPending}
            />

            <UploadIdentityDocDialog
                isOpen={uploadingId !== null}
                onClose={() => setUploadingId(null)}
                title={
                    uploadingId
                        ? `Upload ID for ${uploadingId.fullName}`
                        : 'Upload identity document'
                }
                subtitle="Government-issued photo ID such as passport or driver's licence."
                onUpload={handleUpload}
                submitting={uploadIdentity.isPending}
            />

            <ConfirmModal
                isOpen={removing !== null}
                onClose={() => setRemoving(null)}
                onConfirm={handleRemove}
                title="Remove director?"
                message={
                    removing
                        ? `${removing.fullName} will be removed from your label. You can re-add them later.`
                        : ''
                }
                confirmText="Remove"
                isLoading={removeDirector.isPending}
            />
        </Box>
    );
};

interface DirectorRowProps {
    director: LabelDirectorDto;
    onEdit: () => void;
    onRemove: () => void;
    onUploadId: () => void;
}

const DirectorRow: React.FC<DirectorRowProps> = ({
    director,
    onEdit,
    onRemove,
    onUploadId,
}) => {
    const hasDoc = !!director.identityDocumentUrl;

    return (
        <Box
            borderRadius="12px"
            borderWidth="1px"
            borderColor="gray.200"
            bg="white"
            p={4}
        >
            <HStack justify="space-between" align="start" gap={4}>
                <VStack align="start" gap={1} flex={1}>
                    <HStack gap={2} flexWrap="wrap">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                            {director.fullName}
                        </Text>
                        {director.isPrimaryContact && (
                            <Badge
                                bg="primary.50"
                                color="primary.700"
                                fontSize="10px"
                                borderRadius="6px"
                                px={2}
                            >
                                Primary contact
                            </Badge>
                        )}
                        <Badge
                            bg={hasDoc ? 'green.50' : 'orange.50'}
                            color={hasDoc ? 'green.700' : 'orange.700'}
                            fontSize="10px"
                            borderRadius="6px"
                            px={2}
                        >
                            <HStack gap={1}>
                                <Icon as={hasDoc ? FiCheckCircle : FiFileText} boxSize="10px" />
                                <span>{hasDoc ? 'ID on file' : 'No ID uploaded'}</span>
                            </HStack>
                        </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.600">
                        {director.position}
                    </Text>
                    <HStack gap={4} mt={1} flexWrap="wrap">
                        <HStack gap={1}>
                            <Icon as={FiMail} color="gray.400" boxSize="12px" />
                            <Text fontSize="11px" color="gray.600">
                                {director.email}
                            </Text>
                        </HStack>
                        {director.phoneNumber && (
                            <HStack gap={1}>
                                <Icon as={FiPhone} color="gray.400" boxSize="12px" />
                                <Text fontSize="11px" color="gray.600">
                                    {director.phoneNumber}
                                </Text>
                            </HStack>
                        )}
                    </HStack>
                </VStack>

                <Menu.Root>
                    <Menu.Trigger asChild>
                        <IconButton
                            aria-label="Director actions"
                            size="sm"
                            variant="ghost"
                            color="gray.500"
                        >
                            <Icon as={FiMoreVertical} />
                        </IconButton>
                    </Menu.Trigger>
                    <Portal>
                        <Menu.Positioner>
                            <Menu.Content minW="180px" borderRadius="10px">
                                <Menu.Item value="edit" onClick={onEdit}>
                                    <HStack gap={2}>
                                        <Icon as={FiEdit2} color="gray.500" />
                                        <Text fontSize="xs">Edit details</Text>
                                    </HStack>
                                </Menu.Item>
                                <Menu.Item value="upload" onClick={onUploadId}>
                                    <HStack gap={2}>
                                        <Icon as={FiUploadCloud} color="gray.500" />
                                        <Text fontSize="xs">
                                            {hasDoc ? 'Replace ID' : 'Upload ID'}
                                        </Text>
                                    </HStack>
                                </Menu.Item>
                                <Menu.Item value="remove" onClick={onRemove}>
                                    <HStack gap={2}>
                                        <Icon as={FiTrash2} color="red.500" />
                                        <Text fontSize="xs" color="red.600">
                                            Remove
                                        </Text>
                                    </HStack>
                                </Menu.Item>
                            </Menu.Content>
                        </Menu.Positioner>
                    </Portal>
                </Menu.Root>
            </HStack>
        </Box>
    );
};
