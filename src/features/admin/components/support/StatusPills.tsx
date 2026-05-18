import React from 'react';
import { Box, Button, HStack, Text } from '@chakra-ui/react';
import type { StatusStyle } from '../../lib/statusColor';

export interface PillOption {
    value: string;
    label: string;
    style?: StatusStyle;
}

interface StatusPillsProps {
    options: PillOption[];
    active: string;
    onChange: (value: string) => void;
}

/** Horizontal pill filter row — shared by the support ticket & moderation tabs. */
export const StatusPills: React.FC<StatusPillsProps> = ({
    options,
    active,
    onChange,
}) => (
    <HStack gap={1} overflowX="auto">
        {options.map((opt) => {
            const isActive = opt.value === active;
            return (
                <Button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    size="xs"
                    fontSize="11px"
                    fontWeight="medium"
                    borderRadius="full"
                    px={3}
                    bg={isActive ? 'primary.500' : 'gray.50'}
                    color={isActive ? 'white' : 'gray.700'}
                    _hover={{ bg: isActive ? 'primary.600' : 'gray.100' }}
                    flexShrink={0}
                >
                    <HStack gap={1.5}>
                        {opt.style && (
                            <Box
                                boxSize="6px"
                                borderRadius="full"
                                bg={isActive ? 'whiteAlpha.800' : opt.style.dot}
                            />
                        )}
                        <Text>{opt.label}</Text>
                    </HStack>
                </Button>
            );
        })}
    </HStack>
);
