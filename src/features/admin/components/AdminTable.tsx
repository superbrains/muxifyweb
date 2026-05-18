import { Box, Center, Text } from '@chakra-ui/react';

export interface AdminTableColumn<T> {
    key: string;
    header: string;
    render: (row: T) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

interface AdminTableProps<T> {
    columns: AdminTableColumn<T>[];
    rows: T[];
    rowKey: (row: T) => string;
    onRowClick?: (row: T) => void;
    emptyTitle?: string;
    emptyDescription?: string;
}

/**
 * Lightweight Chakra data table styled to match the Muxify dashboard tables
 * (muted #7B91B0 headers, hover rows, white card). Generic over the row type.
 */
export function AdminTable<T>({
    columns,
    rows,
    rowKey,
    onRowClick,
    emptyTitle = 'Nothing here yet',
    emptyDescription,
}: AdminTableProps<T>) {
    if (rows.length === 0) {
        return (
            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100">
                <Center py={12} px={4}>
                    <Box textAlign="center">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                            {emptyTitle}
                        </Text>
                        {emptyDescription && (
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                {emptyDescription}
                            </Text>
                        )}
                    </Box>
                </Center>
            </Box>
        );
    }

    return (
        <Box
            bg="white"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
            overflowX="auto"
        >
            <Box as="table" w="100%" borderCollapse="separate" style={{ borderSpacing: 0 }}>
                <Box as="thead">
                    <Box as="tr">
                        {columns.map((col) => (
                            <Box
                                as="th"
                                key={col.key}
                                textAlign={col.align ?? 'left'}
                                fontSize="10px"
                                textTransform="uppercase"
                                letterSpacing="0.4px"
                                color="#7B91B0"
                                fontWeight="semibold"
                                px={4}
                                py={3}
                                borderBottom="1px solid"
                                borderColor="gray.100"
                                width={col.width}
                                whiteSpace="nowrap"
                            >
                                {col.header}
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Box as="tbody">
                    {rows.map((row) => (
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
            </Box>
        </Box>
    );
}
