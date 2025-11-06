import React from 'react';
import {
    Dialog,
    Button,
    Text,
    VStack,
    HStack,
    Box,
    Icon,
    IconButton,
    Spinner,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string;
    isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'red',
    isLoading = false,
}) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    maxW="420px"
                    p={7}
                    borderRadius="25px"
                    position="relative"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                >
                    <IconButton
                        aria-label="Close"
                        variant="ghost"
                        size="sm"
                        color="gray.500"
                        position="absolute"
                        right={4}
                        top={4}
                        onClick={onClose}
                    >
                        <Icon as={MdClose} />
                    </IconButton>

                    <VStack gap={5} align="center" w="full" py={2}>
                        {/* Warning Icon */}
                        <Box
                            bg={confirmColor === 'red' ? 'red.50' : 'orange.50'}
                            borderRadius="full"
                            p={4}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon
                                as={FiAlertTriangle}
                                boxSize={8}
                                color={confirmColor === 'red' ? 'red.500' : 'orange.500'}
                            />
                        </Box>

                        {/* Title */}
                        <Text fontSize="lg" fontWeight="semibold" color="gray.900" textAlign="center">
                            {title}
                        </Text>

                        {/* Message */}
                        <Text fontSize="sm" color="gray.600" textAlign="center" w="85%" lineHeight="1.6">
                            {message}
                        </Text>

                        {/* Action Buttons */}
                        <HStack gap={3} w="full" justify="center" pt={2}>
                            <Button
                                onClick={onClose}
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.700"
                                size="md"
                                fontSize="sm"
                                fontWeight="medium"
                                px={6}
                                py={2}
                                borderRadius="md"
                                _hover={{
                                    bg: 'gray.50',
                                    borderColor: 'gray.400'
                                }}
                                disabled={isLoading}
                            >
                                {cancelText}
                            </Button>
                            <Button
                                bg={confirmColor === 'red' ? '#f94444' : confirmColor === 'blue' ? 'primary.500' : `${confirmColor}.500`}
                                color="white"
                                size="md"
                                fontSize="sm"
                                fontWeight="medium"
                                px={6}
                                py={2}
                                borderRadius="md"
                                onClick={handleConfirm}
                                disabled={isLoading}
                                _hover={{
                                    bg: confirmColor === 'red' ? '#e53939' : confirmColor === 'blue' ? 'primary.600' : `${confirmColor}.600`,
                                    opacity: 0.9
                                }}
                                display="flex"
                                alignItems="center"
                                gap={2}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner size="sm" color="white" />
                                        <Text>{confirmText}...</Text>
                                    </>
                                ) : (
                                    confirmText
                                )}
                            </Button>
                        </HStack>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

