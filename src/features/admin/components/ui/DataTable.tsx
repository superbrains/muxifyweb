import React from 'react';
import { Box, Center, HStack, Icon, Skeleton, Text, VStack } from '@chakra-ui/react';
import { FiChevronDown, FiChevronUp, FiInbox } from 'react-icons/fi';
import { Paginator } from '../Paginator';

export interface DataColumn<T> {
    key: string;
    header: string;
    render: (row: T) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    /** When set, the header becomes clickable and emits this key to `onSortChange`. */
    sortKey?: string;
}

export interface SortState {
    key: string;
    dir: 'asc' | 'desc';
}

export interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
    columns: DataColumn<T>[];
    rows: T[];
    rowKey: (row: T) => string;
    onRowClick?: (row: T) => void;
    loading?: boolean;
    skeletonRows?: number;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyIcon?: React.ElementType;
    /** Controlled sort — when provided alongside a column `sortKey`, headers toggle it. */
    sort?: SortState;
    onSortChange?: (next: SortState) => void;
    /** Renders a prev/next pager beneath the table when more than one page exists. */
    pagination?: PaginationState;
}

const HEADER_PROPS = {
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.4px',
    color: '#7B91B0',
    fontWeight: 'semibold' as const,
    px: 4,
    py: 3,
    borderBottom: '1px solid',
    borderColor: 'gray.100',
    whiteSpace: 'nowrap' as const,
};

/**
 * The console's standard data table — sortable headers, loading skeletons (not
 * spinners), an iconographic empty state, and optional pagination. Generic over
 * the row type. Upgrades the legacy `AdminTable` while keeping the same visual
 * language (muted #7B91B0 headers, hover rows, white card).
 */
export function DataTable<T>({
    columns,
    rows,
    rowKey,
    onRowClick,
    loading = false,
    skeletonRows = 8,
    emptyTitle = 'Nothing here yet',
    emptyDescription,
    emptyIcon = FiInbox,
    sort,
    onSortChange,
    pagination,
}: DataTableProps<T>) {
    const handleSort = (col: DataColumn<T>) => {
        if (!col.sortKey || !onSortChange) return;
        const dir: 'asc' | 'desc' =
            sort?.key === col.sortKey && sort.dir === 'asc' ? 'desc' : 'asc';
        onSortChange({ key: col.sortKey, dir });
    };

    const card = (children: React.ReactNode) => (
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" overflowX="auto">
            {children}
        </Box>
    );

    if (!loading && rows.length === 0) {
        return card(
            <Center py={12} px={4}>
                <VStack gap={2} textAlign="center" maxW="320px">
                    <Icon as={emptyIcon} boxSize={7} color="gray.300" />
                    <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                        {emptyTitle}
                    </Text>
                    {emptyDescription && (
                        <Text fontSize="xs" color="gray.500">
                            {emptyDescription}
                        </Text>
                    )}
                </VStack>
            </Center>,
        );
    }

    const table = card(
        <Box as="table" w="100%" borderCollapse="separate" style={{ borderSpacing: 0 }}>
            <Box as="thead">
                <Box as="tr">
                    {columns.map((col) => {
                        const sortable = !!col.sortKey && !!onSortChange;
                        const isSorted = sort?.key === col.sortKey;
                        return (
                            <Box
                                as="th"
                                key={col.key}
                                textAlign={col.align ?? 'left'}
                                width={col.width}
                                cursor={sortable ? 'pointer' : 'default'}
                                userSelect="none"
                                onClick={() => handleSort(col)}
                                _hover={sortable ? { color: 'gray.600' } : undefined}
                                {...HEADER_PROPS}
                            >
                                <HStack
                                    gap={1}
                                    display="inline-flex"
                                    justify={col.align === 'right' ? 'flex-end' : 'flex-start'}
                                >
                                    <Text as="span">{col.header}</Text>
                                    {sortable && isSorted && (
                                        <Icon
                                            as={sort?.dir === 'asc' ? FiChevronUp : FiChevronDown}
                                            boxSize={3}
                                        />
                                    )}
                                </HStack>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
            <Box as="tbody">
                {loading
                    ? Array.from({ length: skeletonRows }).map((_, r) => (
                          <Box as="tr" key={`sk-${r}`}>
                              {columns.map((col) => (
                                  <Box
                                      as="td"
                                      key={col.key}
                                      px={4}
                                      py={3.5}
                                      borderBottom="1px solid"
                                      borderColor="gray.50"
                                  >
                                      <Skeleton height="14px" borderRadius="4px" />
                                  </Box>
                              ))}
                          </Box>
                      ))
                    : rows.map((row) => (
                          <Box
                              as="tr"
                              key={rowKey(row)}
                              cursor={onRowClick ? 'pointer' : 'default'}
                              transition="background 0.15s"
                              _hover={onRowClick ? { bg: 'gray.50' } : undefined}
                              onClick={() => onRowClick?.(row)}
                          >
                              {columns.map((col) => (
                                  <Box
                                      as="td"
                                      key={col.key}
                                      textAlign={col.align ?? 'left'}
                                      fontSize="xs"
                                      color="gray.800"
                                      px={4}
                                      py={3.5}
                                      borderBottom="1px solid"
                                      borderColor="gray.50"
                                      verticalAlign="middle"
                                  >
                                      {col.render(row)}
                                  </Box>
                              ))}
                          </Box>
                      ))}
            </Box>
        </Box>,
    );

    if (!pagination) return table;

    return (
        <VStack align="stretch" gap={3}>
            {table}
            <Paginator
                page={pagination.page}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onPageChange={pagination.onPageChange}
            />
        </VStack>
    );
}
