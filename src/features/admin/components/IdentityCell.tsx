import React from 'react';
import { Avatar, HStack, Text, VStack } from '@chakra-ui/react';

interface IdentityCellProps {
    name: string;
    secondary?: string;
    avatarUrl?: string;
    size?: 'xs' | 'sm' | 'md';
}

/** Avatar + name + muted secondary line — the canonical "who" cell. */
export const IdentityCell: React.FC<IdentityCellProps> = ({
    name,
    secondary,
    avatarUrl,
    size = 'sm',
}) => (
    <HStack gap={2.5} minW={0}>
        <Avatar.Root size={size} flexShrink={0}>
            {avatarUrl && <Avatar.Image src={avatarUrl} alt={name} />}
            <Avatar.Fallback name={name} />
        </Avatar.Root>
        <VStack align="start" gap={0} minW={0}>
            <Text
                fontSize="xs"
                fontWeight="semibold"
                color="gray.900"
                lineClamp={1}
            >
                {name}
            </Text>
            {secondary && (
                <Text fontSize="10px" color="gray.500" lineClamp={1}>
                    {secondary}
                </Text>
            )}
        </VStack>
    </HStack>
);
