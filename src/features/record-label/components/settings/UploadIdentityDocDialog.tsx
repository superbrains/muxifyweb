import React, { useRef, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Icon,
    IconButton,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { FiFile, FiUploadCloud } from 'react-icons/fi';
import { useChakraToast } from '@shared/hooks/useChakraToast';

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,application/pdf';

interface UploadIdentityDocDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    submitting?: boolean;
    onUpload: (file: File) => Promise<unknown>;
}

export const UploadIdentityDocDialog: React.FC<UploadIdentityDocDialogProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    submitting = false,
    onUpload,
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const toast = useChakraToast();

    const reset = () => {
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleClose = () => {
        if (submitting) return;
        reset();
        onClose();
    };

    const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0];
        if (!picked) return;
        if (picked.size > MAX_BYTES) {
            toast.error('File too large', 'Maximum 10 MB.');
            e.target.value = '';
            return;
        }
        const allowed = new Set(ACCEPT.split(','));
        if (!allowed.has(picked.type)) {
            toast.error('Unsupported file', 'Use a JPG, PNG, or PDF.');
            e.target.value = '';
            return;
        }
        setFile(picked);
    };

    const handleSubmit = async () => {
        if (!file) return;
        await onUpload(file);
        reset();
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    maxW="440px"
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
                        onClick={handleClose}
                    >
                        <Icon as={MdClose} />
                    </IconButton>

                    <VStack align="stretch" gap={4}>
                        <Box>
                            <Text fontSize="md" fontWeight="semibold" color="gray.900">
                                {title}
                            </Text>
                            {subtitle && (
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {subtitle}
                                </Text>
                            )}
                        </Box>

                        <Box
                            border="1px dashed"
                            borderColor="gray.300"
                            borderRadius="12px"
                            p={6}
                            bg="gray.50"
                            cursor="pointer"
                            onClick={() => inputRef.current?.click()}
                            _hover={{ borderColor: 'primary.400', bg: 'primary.50' }}
                        >
                            <VStack gap={2} align="center">
                                <Icon as={FiUploadCloud} boxSize="28px" color="primary.500" />
                                {file ? (
                                    <HStack gap={2}>
                                        <Icon as={FiFile} color="gray.600" />
                                        <Text fontSize="xs" fontWeight="medium" color="gray.800">
                                            {file.name}
                                        </Text>
                                        <Text fontSize="11px" color="gray.500">
                                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        </Text>
                                    </HStack>
                                ) : (
                                    <>
                                        <Text fontSize="xs" color="gray.700">
                                            Click to choose a file
                                        </Text>
                                        <Text fontSize="11px" color="gray.500">
                                            JPG, PNG, or PDF up to 10 MB
                                        </Text>
                                    </>
                                )}
                            </VStack>
                            <input
                                ref={inputRef}
                                type="file"
                                accept={ACCEPT}
                                style={{ display: 'none' }}
                                onChange={handlePick}
                            />
                        </Box>

                        <HStack justify="flex-end" gap={2}>
                            <Button
                                size="sm"
                                fontSize="xs"
                                variant="outline"
                                onClick={handleClose}
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
                                disabled={!file || submitting}
                            >
                                {submitting ? (
                                    <HStack gap={2}>
                                        <Spinner size="xs" />
                                        <span>Uploading…</span>
                                    </HStack>
                                ) : (
                                    'Upload'
                                )}
                            </Button>
                        </HStack>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
