import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Icon,
    IconButton,
    Input,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import type {
    AddLabelDirectorRequest,
    LabelDirectorDto,
} from '../../types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
    fullName: string;
    email: string;
    phoneNumber: string;
    position: string;
    isPrimaryContact: boolean;
}

interface FormErrors {
    fullName?: string;
    email?: string;
    position?: string;
}

const empty: FormState = {
    fullName: '',
    email: '',
    phoneNumber: '',
    position: '',
    isPrimaryContact: false,
};

interface DirectorFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    director?: LabelDirectorDto;
    onSubmit: (req: AddLabelDirectorRequest) => Promise<unknown>;
    submitting?: boolean;
}

export const DirectorFormDialog: React.FC<DirectorFormDialogProps> = ({
    isOpen,
    onClose,
    mode,
    director,
    onSubmit,
    submitting = false,
}) => {
    const [form, setForm] = useState<FormState>(empty);
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (isOpen && director) {
            setForm({
                fullName: director.fullName,
                email: director.email,
                phoneNumber: director.phoneNumber ?? '',
                position: director.position,
                isPrimaryContact: director.isPrimaryContact,
            });
        } else if (isOpen) {
            setForm(empty);
        }
        setErrors({});
    }, [isOpen, director]);

    const validate = (): boolean => {
        const next: FormErrors = {};
        if (!form.fullName.trim()) next.fullName = 'Full name is required';
        if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) {
            next.email = 'A valid email is required';
        }
        if (!form.position.trim()) next.position = 'Position is required';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        const req: AddLabelDirectorRequest = {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phoneNumber: form.phoneNumber.trim() || undefined,
            position: form.position.trim(),
            isPrimaryContact: form.isPrimaryContact,
        };
        await onSubmit(req);
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    maxW="480px"
                    p={6}
                    borderRadius="20px"
                    position="relative"
                >
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

                    <VStack align="stretch" gap={4}>
                        <Box>
                            <Text fontSize="md" fontWeight="semibold" color="gray.900">
                                {mode === 'add' ? 'Add director' : 'Edit director'}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                Directors are required for label verification and contract signing.
                            </Text>
                        </Box>

                        <Box>
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Full name <Text as="span" color="red.500">*</Text>
                            </Text>
                            <Input
                                value={form.fullName}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, fullName: e.target.value }))
                                }
                                placeholder="Jane Doe"
                                size="sm"
                                fontSize="xs"
                                variant="subtle"
                                borderColor={errors.fullName ? 'red.300' : 'transparent'}
                            />
                            {errors.fullName && (
                                <Text color="red.500" fontSize="11px" mt={1}>
                                    {errors.fullName}
                                </Text>
                            )}
                        </Box>

                        <HStack gap={3} align="start" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
                            <Box flex={1} minW="200px">
                                <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                    Email <Text as="span" color="red.500">*</Text>
                                </Text>
                                <Input
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, email: e.target.value }))
                                    }
                                    placeholder="jane@example.com"
                                    size="sm"
                                    fontSize="xs"
                                    variant="subtle"
                                    type="email"
                                    borderColor={errors.email ? 'red.300' : 'transparent'}
                                />
                                {errors.email && (
                                    <Text color="red.500" fontSize="11px" mt={1}>
                                        {errors.email}
                                    </Text>
                                )}
                            </Box>
                            <Box flex={1} minW="160px">
                                <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                    Phone
                                </Text>
                                <Input
                                    value={form.phoneNumber}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, phoneNumber: e.target.value }))
                                    }
                                    placeholder="+234…"
                                    size="sm"
                                    fontSize="xs"
                                    variant="subtle"
                                />
                            </Box>
                        </HStack>

                        <Box>
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Position <Text as="span" color="red.500">*</Text>
                            </Text>
                            <Input
                                value={form.position}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, position: e.target.value }))
                                }
                                placeholder="CEO, Managing Director, …"
                                size="sm"
                                fontSize="xs"
                                variant="subtle"
                                borderColor={errors.position ? 'red.300' : 'transparent'}
                            />
                            {errors.position && (
                                <Text color="red.500" fontSize="11px" mt={1}>
                                    {errors.position}
                                </Text>
                            )}
                        </Box>

                        <HStack gap={2} align="center">
                            <input
                                type="checkbox"
                                id="primary-contact"
                                checked={form.isPrimaryContact}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        isPrimaryContact: e.target.checked,
                                    }))
                                }
                                style={{ width: 14, height: 14, accentColor: '#f94444' }}
                            />
                            <label
                                htmlFor="primary-contact"
                                style={{
                                    fontSize: '12px',
                                    color: '#374151',
                                    cursor: 'pointer',
                                }}
                            >
                                Primary contact for the label
                            </label>
                        </HStack>

                        <HStack justify="flex-end" gap={2} mt={2}>
                            <Button
                                size="sm"
                                fontSize="xs"
                                variant="outline"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                fontSize="xs"
                                bg="primary.500"
                                color="white"
                                _hover={{ bg: 'primary.600' }}
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <HStack gap={2}>
                                        <Spinner size="xs" />
                                        <span>Saving…</span>
                                    </HStack>
                                ) : mode === 'add' ? (
                                    'Add director'
                                ) : (
                                    'Save changes'
                                )}
                            </Button>
                        </HStack>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
