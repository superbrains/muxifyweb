import React from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

export interface Breadcrumb {
    label: string;
    to?: string;
}

interface AdminPageLayoutProps {
    title: string;
    subtitle?: React.ReactNode;
    breadcrumbs?: Breadcrumb[];
    /** Right-aligned primary action(s), e.g. a button. */
    actions?: React.ReactNode;
    /** Optional secondary row beneath the header (tabs, scope notice, etc.). */
    toolbar?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Canonical admin page chrome: full-height grey canvas, breadcrumb, title +
 * subtitle, a primary-action slot, an optional toolbar row, then content.
 * Every separated tower/role/queue page composes this so spacing, typography
 * and the header treatment are identical across the console.
 */
export const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({
    title,
    subtitle,
    breadcrumbs,
    actions,
    toolbar,
    children,
}) => {
    const navigate = useNavigate();
    return (
    <VStack
        gap={{ base: 3, lg: 4 }}
        bg="gray.50"
        minH="100vh"
        align="stretch"
        px={{ base: 3, md: 6 }}
        py={{ base: 4, md: 6 }}
    >
        {breadcrumbs && breadcrumbs.length > 0 && (
            <HStack gap={1} color="gray.400" fontSize="11px" flexWrap="wrap">
                {breadcrumbs.map((crumb, i) => {
                    const isLast = i === breadcrumbs.length - 1;
                    return (
                        <HStack key={`${crumb.label}-${i}`} gap={1}>
                            {crumb.to && !isLast ? (
                                <Box
                                    as="button"
                                    onClick={() => navigate(crumb.to!)}
                                    _hover={{ color: 'gray.600' }}
                                >
                                    {crumb.label}
                                </Box>
                            ) : (
                                <Text color={isLast ? 'gray.600' : 'gray.400'}>
                                    {crumb.label}
                                </Text>
                            )}
                            {!isLast && <FiChevronRight size={11} />}
                        </HStack>
                    );
                })}
            </HStack>
        )}

        <HStack justify="space-between" align="flex-start" gap={3} flexWrap="wrap">
            <Box minW={0}>
                <Text
                    fontSize="md"
                    fontWeight="semibold"
                    color="gray.900"
                    fontFamily="Poppins"
                >
                    {title}
                </Text>
                {subtitle && (
                    <Text fontSize="12px" color="gray.600" mt={0.5}>
                        {subtitle}
                    </Text>
                )}
            </Box>
            {actions && <HStack gap={2}>{actions}</HStack>}
        </HStack>

        {toolbar}

        {children}
    </VStack>
    );
};
