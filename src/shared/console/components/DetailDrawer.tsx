import React from 'react';
import { Box, Drawer, HStack, Portal, Text, VStack } from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';

interface DetailDrawerProps {
    /** Open when truthy; `onClose` fires on backdrop/escape/close button. */
    open: boolean;
    onClose: () => void;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Sticky footer slot (action buttons). */
    footer?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Right-side detail drawer used by every "view X" action across the console
 * (profiles, content, campaigns, tickets, disputes). Standardises the header,
 * scroll body and optional sticky footer so detail surfaces are consistent.
 */
export const DetailDrawer: React.FC<DetailDrawerProps> = ({
    open,
    onClose,
    title,
    subtitle,
    size = 'md',
    footer,
    children,
}) => (
    <Drawer.Root
        open={open}
        onOpenChange={(d) => !d.open && onClose()}
        placement="end"
        size={size}
    >
        <Portal>
            <Drawer.Backdrop bg="blackAlpha.500" />
            <Drawer.Positioner>
                <Drawer.Content bg="white">
                    <Drawer.Header
                        borderBottom="1px solid"
                        borderColor="gray.100"
                        px={5}
                        py={4}
                    >
                        <HStack justify="space-between" align="flex-start" w="100%" gap={3}>
                            <VStack align="start" gap={0.5} minW={0}>
                                <Drawer.Title
                                    fontSize="sm"
                                    fontWeight="semibold"
                                    color="gray.900"
                                    fontFamily="Poppins"
                                    lineClamp={1}
                                >
                                    {title}
                                </Drawer.Title>
                                {subtitle && (
                                    <Text fontSize="11px" color="gray.500" lineClamp={1}>
                                        {subtitle}
                                    </Text>
                                )}
                            </VStack>
                            <Box
                                as="button"
                                onClick={onClose}
                                color="gray.400"
                                _hover={{ color: 'gray.700' }}
                                aria-label="Close drawer"
                                flexShrink={0}
                                mt={0.5}
                            >
                                <FiX />
                            </Box>
                        </HStack>
                    </Drawer.Header>

                    <Drawer.Body px={5} py={4}>
                        {children}
                    </Drawer.Body>

                    {footer && (
                        <Drawer.Footer borderTop="1px solid" borderColor="gray.100" px={5} py={4}>
                            {footer}
                        </Drawer.Footer>
                    )}
                </Drawer.Content>
            </Drawer.Positioner>
        </Portal>
    </Drawer.Root>
);
