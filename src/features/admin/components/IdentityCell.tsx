import React from 'react';
import { HStack, Text, VStack } from '@chakra-ui/react';
import { UserAvatar } from '@shared/components';
import { identityTint } from '../lib/identityTint';

interface IdentityCellProps {
    name: string;
    secondary?: string;
    avatarUrl?: string | null;
    size?: 'xs' | 'sm' | 'md';
}

/**
 * Avatar + name + muted secondary line — the canonical "who" cell. The avatar
 * resolves JWT-gated `/api/v1/media/...` proxy paths via UserAvatar, so real
 * profile pictures render in every admin table.
 */
export const IdentityCell: React.FC<IdentityCellProps> = ({
    name,
    secondary,
    avatarUrl,
    size = 'sm',
}) => {
    const tint = identityTint(name);
    return (
        <HStack gap={2.5} minW={0}>
            <UserAvatar name={name} src={avatarUrl} size={size} bg={tint.bg} color={tint.color} />
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
};
