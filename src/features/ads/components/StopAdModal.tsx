import React from 'react';
import {
    Box,
    Button,
    Dialog,
    Text,
    VStack,
    Icon,
    IconButton,
    Heading,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { FiAlertCircle } from 'react-icons/fi';

interface StopAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const StopAdModal: React.FC<StopAdModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
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
                    maxW="350px" 
                    p={5} 
                    borderRadius="20px"
                    position="relative"
                >
                    <IconButton
                        aria-label="Close"
                        variant="ghost"
                        size="sm"
                        position="absolute"
                        right={4}
                        top={4}
                        onClick={onClose}
                    >
                        <Icon as={MdClose} boxSize={5} color="#f94444" />
                    </IconButton>
                    
                    <VStack gap={4} align="stretch" w="full">
                        {/* Header */}
                        <VStack gap={1}>
                            <Heading size="sm" fontWeight="semibold">
                                Stop Ad
                            </Heading>
                        </VStack>
                        
                        {/* Content */}
                        <VStack gap={3} align="center">
                            <Text fontSize="xs" color="gray.600" textAlign="center" px={2}>
                                This is a running ad, do you wish to stop this ad from running?
                            </Text>
                            
                            {/* Warning Icon */}
                            <Box
                                w="60px"
                                h="60px"
                                borderRadius="full"
                                bg="#ffefef"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Icon as={FiAlertCircle} boxSize={8} color="#f94444" />
                            </Box>
                        </VStack>
                        
                        {/* Submit Button */}
                        <Button
                            bg="#f94444"
                            color="white"
                            size="md"
                            onClick={handleConfirm}
                            _hover={{ bg: '#e53939' }}
                        >
                            Stop Ad
                        </Button>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

