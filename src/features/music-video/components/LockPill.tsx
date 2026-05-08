import React from 'react';
import { HStack, Icon, Text } from '@chakra-ui/react';
import { FiLock, FiUnlock } from 'react-icons/fi';

interface LockPillProps {
    isUnlocked: boolean;
    costCoins?: number;
}

export const LockPill: React.FC<LockPillProps> = ({ isUnlocked, costCoins = 0 }) => {
    if (isUnlocked || costCoins === 0) {
        return (
            <HStack
                gap={1.5}
                bg="green.50"
                color="green.700"
                px={2.5}
                py={1}
                borderRadius="full"
                borderWidth="1px"
                borderColor="green.100"
            >
                <Icon as={FiUnlock} boxSize={3} />
                <Text fontSize="11px" fontWeight="semibold" letterSpacing="0.02em">
                    Free
                </Text>
            </HStack>
        );
    }

    return (
        <HStack
            gap={1.5}
            bg="primary.50"
            color="primary.600"
            px={2.5}
            py={1}
            borderRadius="full"
            borderWidth="1px"
            borderColor="primary.100"
        >
            <Icon as={FiLock} boxSize={3} />
            <Text
                fontSize="11px"
                fontWeight="semibold"
                letterSpacing="0.02em"
                style={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {costCoins} coins
            </Text>
        </HStack>
    );
};
