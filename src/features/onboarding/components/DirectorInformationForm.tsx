import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Button,
    Input,
    Stack,
    Text,
    VStack,
    Select,
    Portal,
    Checkbox,
    createListCollection,
    Icon,
    IconButton,
} from '@chakra-ui/react';
import { HiOutlineTrash } from 'react-icons/hi';
import { useChakraToast } from '@shared/hooks';
import { useUserManagementStore, type DirectorInfo } from '@/features/auth/store/useUserManagementStore';
import { profileService } from '../services/profileService';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';

const positions = createListCollection({
    items: [
        { label: 'CEO', value: 'CEO' },
        { label: 'COO', value: 'COO' },
        { label: 'Director', value: 'Director' },
        { label: 'Secretary', value: 'Secretary' },
        { label: 'Other', value: 'Other' },
    ],
});

const idTypes = createListCollection({
    items: [
        { label: "National ID", value: "national_id" },
        { label: "Driver's License", value: "drivers_license" },
        { label: "International Passport", value: "passport" },
        { label: "Voter's Card", value: "voters_card" },
        { label: "Bank Verification Number", value: "bvn" },
    ],
});

interface DirectorRowState {
    name: string;
    email: string;
    phone: string;
    position: string;
    meansOfIdentification: string;
    identityNumber: string;
    isPrimaryContact: boolean;
}

interface DirectorRowErrors {
    name?: string;
    email?: string;
    position?: string;
    meansOfIdentification?: string;
    identityNumber?: string;
}

const emptyRow = (isPrimary = false): DirectorRowState => ({
    name: '',
    email: '',
    phone: '',
    position: '',
    meansOfIdentification: '',
    identityNumber: '',
    isPrimaryContact: isPrimary,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface DirectorInformationFormProps {
    nextRoute?: string;
}

export const DirectorInformationForm: React.FC<DirectorInformationFormProps> = ({
    nextRoute = '/onboarding/company/label-logo',
}) => {
    const [rows, setRows] = useState<DirectorRowState[]>([emptyRow(true)]);
    const [errors, setErrors] = useState<DirectorRowErrors[]>([{}]);
    const [loading, setLoading] = useState(false);

    const toast = useChakraToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { saveDirectorsInfo, setCurrentUser } = useUserManagementStore();

    const userId = (location.state as { userId?: string })?.userId;

    const updateField = <K extends keyof DirectorRowState>(
        index: number,
        field: K,
        value: DirectorRowState[K],
    ) => {
        setRows((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
        setErrors((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field as keyof DirectorRowErrors]: undefined };
            return next;
        });
    };

    const setPrimary = (index: number) => {
        setRows((prev) => prev.map((r, i) => ({ ...r, isPrimaryContact: i === index })));
    };

    const addDirector = () => {
        setRows((prev) => [...prev, emptyRow(false)]);
        setErrors((prev) => [...prev, {}]);
    };

    const removeDirector = (index: number) => {
        if (rows.length <= 1) return;
        const wasPrimary = rows[index].isPrimaryContact;
        setRows((prev) => {
            const next = prev.filter((_, i) => i !== index);
            if (wasPrimary && next.length > 0) next[0] = { ...next[0], isPrimaryContact: true };
            return next;
        });
        setErrors((prev) => prev.filter((_, i) => i !== index));
    };

    const validate = (): boolean => {
        const next: DirectorRowErrors[] = rows.map(() => ({}));
        let ok = true;
        rows.forEach((row, i) => {
            if (!row.name.trim()) {
                next[i].name = 'Director name is required';
                ok = false;
            }
            if (!row.email.trim() || !EMAIL_RE.test(row.email)) {
                next[i].email = 'Valid email is required';
                ok = false;
            }
            if (!row.position) {
                next[i].position = 'Position is required';
                ok = false;
            }
            if (!row.meansOfIdentification) {
                next[i].meansOfIdentification = 'ID type is required';
                ok = false;
            }
            if (!row.identityNumber.trim()) {
                next[i].identityNumber = 'ID number is required';
                ok = false;
            }
        });
        if (!rows.some((r) => r.isPrimaryContact)) {
            next[0].name = next[0].name || 'Choose a primary contact';
            ok = false;
        }
        setErrors(next);
        return ok;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            for (const row of rows) {
                await profileService.addDirector({
                    fullName: row.name,
                    email: row.email,
                    phoneNumber: row.phone || undefined,
                    position: row.position,
                    isPrimaryContact: row.isPrimaryContact,
                });
            }

            const directors: DirectorInfo[] = rows.map((row) => ({
                name: row.name,
                email: row.email,
                phone: row.phone,
                position: row.position,
                meansOfIdentification: row.meansOfIdentification,
                identityNumber: row.identityNumber,
                isPrimaryContact: row.isPrimaryContact,
            }));

            if (userId) {
                setCurrentUser(userId);
                saveDirectorsInfo(userId, directors);
            }

            toast.success('Directors saved!', 'Director details have been recorded.');
            navigate(nextRoute, { state: { userId } });
        } catch (error: unknown) {
            const errorMessage = getApiErrorMessage(error, 'Failed to save director information.');
            toast.error('Failed to save', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <VStack gap={4} align="center">
            <Box textAlign="center">
                <Text fontSize="lg" fontWeight="semibold" color="black" mb={1}>
                    Director Information
                </Text>
                <Text fontSize="xs" color="gray.600" mb={4}>
                    Add the directors of your company. You can add more than one.
                </Text>
            </Box>

            <Box as="form" onSubmit={handleSubmit} w="full">
                <Stack gap={4}>
                    {rows.map((row, index) => {
                        const rowErrors = errors[index] || {};
                        return (
                            <Box
                                key={index}
                                p={4}
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                            >
                                <VStack gap={3} align="stretch">
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                                            Director {index + 1}
                                        </Text>
                                        {rows.length > 1 && (
                                            <IconButton
                                                size="xs"
                                                variant="ghost"
                                                color="primary.500"
                                                onClick={() => removeDirector(index)}
                                                aria-label="Remove director"
                                            >
                                                <Icon as={HiOutlineTrash} boxSize={4} />
                                            </IconButton>
                                        )}
                                    </Box>

                                    <Box>
                                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                                            Director Name
                                        </Text>
                                        <Input
                                            value={row.name}
                                            variant="subtle"
                                            size="sm"
                                            fontSize="xs"
                                            placeholder="Full Name"
                                            onChange={(e) => updateField(index, 'name', e.target.value)}
                                            borderColor={rowErrors.name ? 'red.300' : 'transparent'}
                                            _focus={{
                                                borderColor: 'primary.500',
                                                boxShadow: '0 0 0 1px #f94444',
                                            }}
                                        />
                                        {rowErrors.name && (
                                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                                {rowErrors.name}
                                            </Text>
                                        )}
                                    </Box>

                                    <Box>
                                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                                            Email
                                        </Text>
                                        <Input
                                            type="email"
                                            value={row.email}
                                            variant="subtle"
                                            size="sm"
                                            fontSize="xs"
                                            placeholder="director@company.com"
                                            onChange={(e) => updateField(index, 'email', e.target.value)}
                                            borderColor={rowErrors.email ? 'red.300' : 'transparent'}
                                            _focus={{
                                                borderColor: 'primary.500',
                                                boxShadow: '0 0 0 1px #f94444',
                                            }}
                                        />
                                        {rowErrors.email && (
                                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                                {rowErrors.email}
                                            </Text>
                                        )}
                                    </Box>

                                    <Box>
                                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                                            Phone <Text as="span" color="gray.400">(Optional)</Text>
                                        </Text>
                                        <Input
                                            value={row.phone}
                                            variant="subtle"
                                            size="sm"
                                            fontSize="xs"
                                            placeholder="+234 800 000 0000"
                                            onChange={(e) => updateField(index, 'phone', e.target.value)}
                                            borderColor="transparent"
                                            _focus={{
                                                borderColor: 'primary.500',
                                                boxShadow: '0 0 0 1px #f94444',
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                                            Position
                                        </Text>
                                        <Select.Root
                                            size="sm"
                                            fontSize="xs"
                                            collection={positions}
                                            value={row.position ? [row.position] : []}
                                            onValueChange={(details) =>
                                                updateField(index, 'position', details.value[0] || '')
                                            }
                                        >
                                            <Select.HiddenSelect />
                                            <Select.Control>
                                                <Select.Trigger>
                                                    <Select.ValueText placeholder="Select Position" />
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.Indicator />
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            <Portal>
                                                <Select.Positioner>
                                                    <Select.Content>
                                                        {positions.items.map((p) => (
                                                            <Select.Item fontSize="xs" item={p} key={p.value}>
                                                                {p.label}
                                                                <Select.ItemIndicator />
                                                            </Select.Item>
                                                        ))}
                                                    </Select.Content>
                                                </Select.Positioner>
                                            </Portal>
                                        </Select.Root>
                                        {rowErrors.position && (
                                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                                {rowErrors.position}
                                            </Text>
                                        )}
                                    </Box>

                                    <Box>
                                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                                            Means of Identification
                                        </Text>
                                        <Select.Root
                                            size="sm"
                                            fontSize="xs"
                                            collection={idTypes}
                                            value={
                                                row.meansOfIdentification ? [row.meansOfIdentification] : []
                                            }
                                            onValueChange={(details) =>
                                                updateField(
                                                    index,
                                                    'meansOfIdentification',
                                                    details.value[0] || '',
                                                )
                                            }
                                        >
                                            <Select.HiddenSelect />
                                            <Select.Control>
                                                <Select.Trigger>
                                                    <Select.ValueText placeholder="Select ID Type" />
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.Indicator />
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            <Portal>
                                                <Select.Positioner>
                                                    <Select.Content>
                                                        {idTypes.items.map((it) => (
                                                            <Select.Item fontSize="xs" item={it} key={it.value}>
                                                                {it.label}
                                                                <Select.ItemIndicator />
                                                            </Select.Item>
                                                        ))}
                                                    </Select.Content>
                                                </Select.Positioner>
                                            </Portal>
                                        </Select.Root>
                                        {rowErrors.meansOfIdentification && (
                                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                                {rowErrors.meansOfIdentification}
                                            </Text>
                                        )}
                                    </Box>

                                    <Box>
                                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                                            Identity Number
                                        </Text>
                                        <Input
                                            value={row.identityNumber}
                                            variant="subtle"
                                            size="sm"
                                            fontSize="xs"
                                            placeholder="ID Number"
                                            onChange={(e) =>
                                                updateField(index, 'identityNumber', e.target.value)
                                            }
                                            borderColor={
                                                rowErrors.identityNumber ? 'red.300' : 'transparent'
                                            }
                                            _focus={{
                                                borderColor: 'primary.500',
                                                boxShadow: '0 0 0 1px #f94444',
                                            }}
                                        />
                                        {rowErrors.identityNumber && (
                                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                                {rowErrors.identityNumber}
                                            </Text>
                                        )}
                                    </Box>

                                    <Checkbox.Root
                                        checked={row.isPrimaryContact}
                                        onCheckedChange={() => setPrimary(index)}
                                        size="sm"
                                    >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control />
                                        <Checkbox.Label fontSize="xs" color="gray.700">
                                            Primary contact
                                        </Checkbox.Label>
                                    </Checkbox.Root>

                                    {index === rows.length - 1 && (
                                        <Box display="flex" justifyContent="flex-end">
                                            <Button
                                                type="button"
                                                onClick={addDirector}
                                                variant="ghost"
                                                fontSize="xs"
                                                fontWeight="medium"
                                                bg="primary.25"
                                                color="primary.500"
                                                _hover={{ color: 'primary.600' }}
                                                rounded="full"
                                                py={2}
                                                px={4}
                                                h="auto"
                                            >
                                                + Add another director
                                            </Button>
                                        </Box>
                                    )}
                                </VStack>
                            </Box>
                        );
                    })}

                    <Button
                        type="submit"
                        loading={loading}
                        bg="primary.500"
                        color="white"
                        size="md"
                        fontSize="xs"
                        width="full"
                        fontWeight="medium"
                        borderRadius="10px"
                        mt="20px"
                        _hover={{ bg: 'primary.600' }}
                    >
                        Continue
                    </Button>
                </Stack>
            </Box>
        </VStack>
    );
};
