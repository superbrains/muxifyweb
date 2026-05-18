import React from 'react';
import { Box, HStack, Icon, Spinner, Text, VStack } from '@chakra-ui/react';
import { FiCheck } from 'react-icons/fi';
import { usePermissionCatalog } from '../../hooks/useAdminManagement';

interface PermissionPickerProps {
    /** Currently-selected permission codes. */
    selected: string[];
    onChange: (next: string[]) => void;
    /** Permission codes shown but not toggleable (e.g. already role-granted). */
    lockedCodes?: string[];
}

/**
 * Grouped, checkbox-style picker rendered from the server permission catalog.
 * Used by the role editor and the per-admin delegation manager.
 */
export const PermissionPicker: React.FC<PermissionPickerProps> = ({
    selected,
    onChange,
    lockedCodes = [],
}) => {
    const { data: groups, isLoading } = usePermissionCatalog();
    const selectedSet = new Set(selected);
    const lockedSet = new Set(lockedCodes);

    if (isLoading || !groups) {
        return (
            <HStack justify="center" py={6}>
                <Spinner size="sm" color="primary.500" />
            </HStack>
        );
    }

    const toggle = (code: string) => {
        if (lockedSet.has(code)) return;
        onChange(
            selectedSet.has(code)
                ? selected.filter((c) => c !== code)
                : [...selected, code],
        );
    };

    return (
        <VStack align="stretch" gap={4}>
            {groups.map((group) => (
                <Box key={group.group}>
                    <Text
                        fontSize="10px"
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing="0.5px"
                        color="#7B91B0"
                        mb={2}
                    >
                        {group.group}
                    </Text>
                    <VStack align="stretch" gap={1}>
                        {group.permissions.map((perm) => {
                            const isLocked = lockedSet.has(perm.code);
                            const isOn = selectedSet.has(perm.code) || isLocked;
                            return (
                                <HStack
                                    key={perm.code}
                                    gap={3}
                                    px={3}
                                    py={2}
                                    borderRadius="10px"
                                    cursor={isLocked ? 'not-allowed' : 'pointer'}
                                    bg={isOn ? 'primary.50' : 'transparent'}
                                    opacity={isLocked ? 0.6 : 1}
                                    _hover={{ bg: isLocked ? undefined : isOn ? 'primary.50' : 'gray.50' }}
                                    onClick={() => toggle(perm.code)}
                                    align="flex-start"
                                >
                                    <Box
                                        boxSize="16px"
                                        mt="2px"
                                        borderRadius="5px"
                                        border="1.5px solid"
                                        borderColor={isOn ? 'primary.500' : 'gray.300'}
                                        bg={isOn ? 'primary.500' : 'white'}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexShrink={0}
                                    >
                                        {isOn && <Icon as={FiCheck} boxSize={3} color="white" />}
                                    </Box>
                                    <Box>
                                        <Text fontSize="xs" fontWeight="medium" color="gray.800">
                                            {perm.displayName}
                                        </Text>
                                        <Text fontSize="10px" color="gray.500">
                                            {perm.description}
                                        </Text>
                                    </Box>
                                </HStack>
                            );
                        })}
                    </VStack>
                </Box>
            ))}
        </VStack>
    );
};
