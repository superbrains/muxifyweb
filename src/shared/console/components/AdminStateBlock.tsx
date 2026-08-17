import React from 'react';
import { Center, Icon, Spinner, Text, VStack } from '@chakra-ui/react';
import { FiAlertCircle, FiLock } from 'react-icons/fi';
import { getErrorStatus } from '@/shared/lib/errorUtils';

const Wrap: React.FC<{ children: React.ReactNode; minH?: string }> = ({
    children,
    minH = '40vh',
}) => (
    <Center minH={minH} w="full">
        {children}
    </Center>
);

/** Centered loading spinner, on-brand colour. */
export const AdminLoading: React.FC<{ minH?: string }> = ({ minH }) => (
    <Wrap minH={minH}>
        <Spinner size="lg" color="primary.500" />
    </Wrap>
);

interface AdminErrorProps {
    error: unknown;
    /** Fallback message for non-403 errors. */
    message?: string;
    minH?: string;
}

/**
 * Centered error block. A 403 renders an explicit "no access" message rather
 * than a generic failure — the backend enforces the admin role on every
 * `/api/v1/admin/*` endpoint, so a 403 is a meaningful, expected state.
 */
export const AdminError: React.FC<AdminErrorProps> = ({
    error,
    message = 'Something went wrong loading this data.',
    minH,
}) => {
    const forbidden = getErrorStatus(error) === 403;
    return (
        <Wrap minH={minH}>
            <VStack gap={2} maxW="320px" textAlign="center">
                <Icon
                    as={forbidden ? FiLock : FiAlertCircle}
                    boxSize={7}
                    color={forbidden ? 'gray.400' : 'primary.500'}
                />
                <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                    {forbidden ? 'You do not have access' : 'Could not load'}
                </Text>
                <Text fontSize="xs" color="gray.500">
                    {forbidden
                        ? 'This area is restricted to Muxify Super Admins.'
                        : message}
                </Text>
            </VStack>
        </Wrap>
    );
};
