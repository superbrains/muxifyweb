import React from 'react';
import { Box, Collapsible, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';

export interface NavLink {
    label: string;
    to: string;
    icon?: React.ElementType;
    /** When `false`, the item is hidden (scope/permission gating done by caller). Defaults to visible. */
    visible?: boolean;
    /** Optional count badge. */
    badge?: number;
    /** Exact-match active highlighting (default matches `to` and nested paths). */
    exact?: boolean;
}

export interface NavGroup {
    id: string;
    label: string;
    icon?: React.ElementType;
    items: NavLink[];
}

interface SectionNavProps {
    groups: NavGroup[];
    currentPath: string;
    /** Optional click handler (e.g. close mobile drawer). Navigation uses RouterLink. */
    onItemClick?: () => void;
}

const isActive = (path: string, link: NavLink): boolean =>
    link.exact ? path === link.to : path === link.to || path.startsWith(`${link.to}/`);

/**
 * Grouped, collapsible admin navigation matching the document's 8-group
 * structure. Items are filtered by their `visible` flag (the caller computes
 * `isSuperAdmin || (roleScope allows role && permission held)`); a group with no
 * visible items is omitted entirely. Groups containing the active route start
 * expanded.
 */
export const SectionNav: React.FC<SectionNavProps> = ({
    groups,
    currentPath,
    onItemClick,
}) => {
    const navigate = useNavigate();
    const visibleGroups = groups
        .map((g) => ({ ...g, items: g.items.filter((i) => i.visible !== false) }))
        .filter((g) => g.items.length > 0);

    return (
        <VStack align="stretch" gap={1.5}>
            {visibleGroups.map((group) => {
                const groupActive = group.items.some((i) => isActive(currentPath, i));
                return (
                    <Collapsible.Root key={group.id} defaultOpen={groupActive}>
                        <Collapsible.Trigger w="100%" cursor="pointer">
                            <HStack
                                justify="space-between"
                                px={3}
                                py={2}
                                borderRadius="8px"
                                _hover={{ bg: 'gray.50' }}
                            >
                                <HStack gap={2} minW={0}>
                                    {group.icon && (
                                        <Icon as={group.icon} boxSize={4} color="gray.500" />
                                    )}
                                    <Text
                                        fontSize="10px"
                                        fontWeight="bold"
                                        textTransform="uppercase"
                                        letterSpacing="0.5px"
                                        color="gray.500"
                                    >
                                        {group.label}
                                    </Text>
                                </HStack>
                                <Collapsible.Context>
                                    {(api) => (
                                        <Icon
                                            as={FiChevronDown}
                                            boxSize={3.5}
                                            color="gray.400"
                                            transition="transform 0.2s"
                                            transform={api.open ? 'rotate(180deg)' : undefined}
                                        />
                                    )}
                                </Collapsible.Context>
                            </HStack>
                        </Collapsible.Trigger>
                        <Collapsible.Content>
                            <VStack align="stretch" gap={0.5} pl={2} pb={1}>
                                {group.items.map((item) => {
                                    const active = isActive(currentPath, item);
                                    return (
                                        <Box
                                            key={item.to}
                                            as="button"
                                            textAlign="left"
                                            w="100%"
                                            onClick={() => {
                                                navigate(item.to);
                                                onItemClick?.();
                                            }}
                                            px={3}
                                            py={1.5}
                                            borderRadius="8px"
                                            bg={active ? 'primary.50' : 'transparent'}
                                            color={active ? 'primary.600' : 'gray.700'}
                                            fontWeight={active ? 'semibold' : 'medium'}
                                            _hover={{ bg: active ? 'primary.50' : 'gray.50' }}
                                            transition="background 0.12s"
                                        >
                                            <HStack justify="space-between" gap={2}>
                                                <HStack gap={2.5} minW={0}>
                                                    {item.icon && (
                                                        <Icon
                                                            as={item.icon}
                                                            boxSize={4}
                                                            color={active ? 'primary.500' : 'gray.400'}
                                                        />
                                                    )}
                                                    <Text fontSize="12px" lineClamp={1}>
                                                        {item.label}
                                                    </Text>
                                                </HStack>
                                                {item.badge !== undefined && item.badge > 0 && (
                                                    <Box
                                                        bg="primary.500"
                                                        color="white"
                                                        fontSize="9px"
                                                        fontWeight="bold"
                                                        borderRadius="full"
                                                        px={1.5}
                                                        minW="16px"
                                                        textAlign="center"
                                                    >
                                                        {item.badge > 99 ? '99+' : item.badge}
                                                    </Box>
                                                )}
                                            </HStack>
                                        </Box>
                                    );
                                })}
                            </VStack>
                        </Collapsible.Content>
                    </Collapsible.Root>
                );
            })}
        </VStack>
    );
};
