import React from 'react';
import { HStack, Text } from '@chakra-ui/react';
import type { CurationAction } from '../../types/discovery';

const ACCENT = '#FF2D55';

/** Inline text-button used across the Discovery pages (mirrors SpotlightPage's LinkBtn). */
export const LinkBtn: React.FC<{
    color?: string;
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
}> = ({ color = ACCENT, onClick, disabled, children }) => (
    <Text
        as="button"
        fontSize="xs"
        fontWeight="medium"
        color={disabled ? 'gray.300' : color}
        cursor={disabled ? 'not-allowed' : 'pointer'}
        onClick={disabled ? undefined : onClick}
        _hover={disabled ? undefined : { textDecoration: 'underline' }}
    >
        {children}
    </Text>
);

const ACTION_COLOR: Record<CurationAction, string> = {
    Pin: '#FF2D55',
    Boost: '#3B82F6',
    Suppress: '#D97706',
    Exclude: '#E53E3E',
};

/** The Pin/Boost/Suppress/Exclude curate menu for a trending row. */
export const CurateActions: React.FC<{
    onAction: (action: CurationAction) => void;
    disabled?: boolean;
}> = ({ onAction, disabled }) => (
    <HStack gap={2.5} justify="flex-end">
        {(['Pin', 'Boost', 'Suppress', 'Exclude'] as CurationAction[]).map((action) => (
            <LinkBtn
                key={action}
                color={ACTION_COLOR[action]}
                disabled={disabled}
                onClick={() => onAction(action)}
            >
                {action}
            </LinkBtn>
        ))}
    </HStack>
);
