import React from 'react';
import {
    Box,
    Button,
    Dialog,
    Text,
    VStack,
    Icon,
    IconButton,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { SuccessTickIcon } from '@/shared/icons/CustomIcons';

interface PaymentSuccessfulModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDone: () => void;
}

export const PaymentSuccessfulModal: React.FC<PaymentSuccessfulModalProps> = ({
    isOpen,
    onClose,
    onDone,
}) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content maxW="380px" minH="400px" p={7} position="relative" borderRadius="25px" display="flex" flexDirection="column" alignItems="center" justifyContent="space-between">
                    <IconButton
                        aria-label="Close"
                        variant="ghost"
                        size="sm"
                        color="red.500"
                        position="absolute"
                        right={4}
                        top={4}
                        onClick={onClose}
                    >
                        <Icon as={MdClose} />
                    </IconButton>

                    <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                        Payout Successful
                    </Text>


                    <VStack gap={7} align="center" py={4}>
                        <Box
                          
                        >
                            <SuccessTickIcon w={90} h={90} color="green.500" />
                        </Box>


                        <Text fontSize="xs" color="gray.600" textAlign="center" w="80%">
                            Payment sometimes can take time depending on your financial institution
                        </Text>

                        
                    </VStack><Button
                            onClick={onDone}
                            bg="primary.500"
                            color="white"
                            w="full"
                            size="md"
                            fontSize="sm"
                            fontWeight="medium"
                            borderRadius="md"
                            _hover={{ bg: 'primary.600' }}
                        >
                            Done
                        </Button>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
