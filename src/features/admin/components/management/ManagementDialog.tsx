import React from 'react';
import {
    Box,
    Dialog,
    HStack,
    Icon,
    IconButton,
    Portal,
    Text,
    VStack,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';

interface ManagementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    /** Sticky footer content, typically the action buttons. */
    footer?: React.ReactNode;
    maxW?: string;
    children: React.ReactNode;
}

/**
 * Shared modal shell for the Admin Management screens — matches the rounded
 * white card + close button styling of {@link ReasonDialog}.
 */
export const ManagementDialog: React.FC<ManagementDialogProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    footer,
    maxW = '520px',
    children,
}) => (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="center">
        <Portal>
            <Dialog.Backdrop bg="blackAlpha.500" />
            <Dialog.Positioner>
                <Dialog.Content
                    maxW={maxW}
                    borderRadius="20px"
                    position="relative"
                    overflow="hidden"
                >
                    <IconButton
                        aria-label="Close"
                        variant="ghost"
                        size="sm"
                        color="gray.500"
                        position="absolute"
                        right={3}
                        top={3}
                        zIndex={1}
                        onClick={onClose}
                    >
                        <Icon as={MdClose} />
                    </IconButton>

                    <Box px={6} pt={6} pb={2}>
                        <Text fontSize="md" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                            {title}
                        </Text>
                        {subtitle && (
                            <Text fontSize="xs" color="gray.600" mt={1}>
                                {subtitle}
                            </Text>
                        )}
                    </Box>

                    <VStack
                        align="stretch"
                        gap={4}
                        px={6}
                        py={4}
                        maxH="60vh"
                        overflowY="auto"
                    >
                        {children}
                    </VStack>

                    {footer && (
                        <HStack
                            gap={3}
                            justify="flex-end"
                            px={6}
                            py={4}
                            borderTop="1px solid"
                            borderColor="gray.100"
                        >
                            {footer}
                        </HStack>
                    )}
                </Dialog.Content>
            </Dialog.Positioner>
        </Portal>
    </Dialog.Root>
);
