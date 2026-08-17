import React from 'react';
import { Button, Center, Icon, Text, VStack } from '@chakra-ui/react';
import { FiInbox } from 'react-icons/fi';

interface EmptyStateProps {
    icon?: React.ElementType;
    title: string;
    description?: string;
    /** Optional call-to-action. */
    cta?: { label: string; onClick: () => void };
    minH?: string;
}

/**
 * Consistent empty state — icon + one-line guidance + optional CTA. Used for
 * non-table empty surfaces (cards, panels, drawers). Tables use the empty state
 * built into {@link DataTable}.
 */
export const AdminEmptyState: React.FC<EmptyStateProps> = ({
    icon = FiInbox,
    title,
    description,
    cta,
    minH = '200px',
}) => (
    <Center minH={minH} w="full">
        <VStack gap={2.5} textAlign="center" maxW="340px">
            <Icon as={icon} boxSize={8} color="gray.300" />
            <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                {title}
            </Text>
            {description && (
                <Text fontSize="xs" color="gray.500">
                    {description}
                </Text>
            )}
            {cta && (
                <Button
                    mt={1}
                    size="sm"
                    bg="primary.500"
                    color="white"
                    fontSize="xs"
                    borderRadius="10px"
                    _hover={{ bg: 'primary.600' }}
                    onClick={cta.onClick}
                >
                    {cta.label}
                </Button>
            )}
        </VStack>
    </Center>
);
