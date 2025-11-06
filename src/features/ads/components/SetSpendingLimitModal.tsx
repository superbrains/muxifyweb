import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    Text,
    VStack,
    HStack,
    Icon,
    IconButton,
    Heading,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';

interface SetSpendingLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (limit: number) => void;
    currentSpend?: number;
    maxBudget?: number;
}

export const SetSpendingLimitModal: React.FC<SetSpendingLimitModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    currentSpend = 0,
    maxBudget = 50000,
}) => {
    const [limit, setLimit] = useState(currentSpend);

    useEffect(() => {
        if (isOpen) {
            setLimit(currentSpend);
        }
    }, [isOpen, currentSpend]);

    const handleConfirm = () => {
        onConfirm(limit);
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
                                Set Spending Limit
                            </Heading>
                            <Text fontSize="xs" color="gray.600" textAlign="center" px={2}>
                                Set the spending limit for this ad, this means when the ad get to the limit it will stop.
                            </Text>
                        </VStack>

                        {/* Slider Section */}
                        <VStack gap={3} align="stretch">
                            <HStack justify="space-between" w="full">
                                <Text fontSize="sm" fontWeight="bold" color="black">
                                    N{limit.toLocaleString()}
                                </Text>
                                <Text fontSize="sm" fontWeight="bold" color="black">
                                    N{maxBudget.toLocaleString()}
                                </Text>
                            </HStack>

                            <Box px={2} position="relative">
                                {/* Track Background */}
                                <Box
                                    w="full"
                                    h="6px"
                                    bg="#ffdcdc"
                                    borderRadius="full"
                                    position="relative"
                                >
                                    {/* Filled Track */}
                                    <Box
                                        w={`${((limit - currentSpend) / (maxBudget - currentSpend)) * 100}%`}
                                        h="full"
                                        bg="#f94444"
                                        borderRadius="full"
                                        position="absolute"
                                        left={0}
                                        top={0}
                                    />
                                </Box>
                                {/* Thumb */}
                                <Box
                                    position="absolute"
                                    top="50%"
                                    left={`${((limit - currentSpend) / (maxBudget - currentSpend)) * 100}%`}
                                    transform="translate(-50%, -50%)"
                                    w="16px"
                                    h="16px"
                                    bg="#f94444"
                                    borderRadius="full"
                                    cursor="pointer"
                                    zIndex={2}
                                    boxShadow="md"
                                />
                                {/* Input Range */}
                                <input
                                    type="range"
                                    min={currentSpend}
                                    max={maxBudget}
                                    step={100}
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: 0,
                                        right: 0,
                                        transform: 'translateY(-50%)',
                                        width: '100%',
                                        height: '6px',
                                        opacity: 0,
                                        cursor: 'pointer',
                                        zIndex: 3,
                                    }}
                                />
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
                            Set Limit
                        </Button>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

