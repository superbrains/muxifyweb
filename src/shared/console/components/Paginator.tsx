import React from 'react';
import { Button, HStack, Text } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PaginatorProps {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
}

/** Prev / next pager with a "showing X–Y of N" caption. */
export const Paginator: React.FC<PaginatorProps> = ({
    page,
    pageSize,
    total,
    onPageChange,
}) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    if (total <= pageSize) return null;

    return (
        <HStack justify="space-between" align="center" px={1}>
            <Text fontSize="11px" color="gray.500">
                Showing {from}–{to} of {total.toLocaleString()}
            </Text>
            <HStack gap={2}>
                <Button
                    size="xs"
                    variant="outline"
                    borderColor="gray.200"
                    color="gray.700"
                    borderRadius="8px"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <FiChevronLeft />
                    Prev
                </Button>
                <Text fontSize="11px" color="gray.600" fontWeight="medium">
                    {page} / {totalPages}
                </Text>
                <Button
                    size="xs"
                    variant="outline"
                    borderColor="gray.200"
                    color="gray.700"
                    borderRadius="8px"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                    <FiChevronRight />
                </Button>
            </HStack>
        </HStack>
    );
};
