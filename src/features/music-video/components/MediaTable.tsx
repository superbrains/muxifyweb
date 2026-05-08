import React from 'react';
import { Box, Table, Text } from '@chakra-ui/react';

interface MediaTableProps {
    showAlbumColumn: boolean;
    children: React.ReactNode;
}

const headerStyle = {
    fontSize: '10px',
    fontWeight: '600',
    color: 'gray.blue.700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    py: 3,
    bg: 'gray.50',
    borderBottomWidth: '1px',
    borderColor: 'gray.100',
};

const HeaderCell: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' }> = ({
    children,
    align = 'left',
}) => (
    <Table.ColumnHeader textAlign={align} {...headerStyle}>
        <Text as="span" {...headerStyle} px={0} py={0}>
            {children}
        </Text>
    </Table.ColumnHeader>
);

export const MediaTable: React.FC<MediaTableProps> = ({ showAlbumColumn, children }) => {
    return (
        <Box
            bg="white"
            borderWidth="1px"
            borderColor="gray.100"
            borderRadius="xl"
            shadow="sm"
            overflow="hidden"
        >
            <Table.Root size="sm" interactive>
                <Table.Header>
                    <Table.Row bg="gray.50">
                        <HeaderCell>{''}</HeaderCell>
                        <HeaderCell>Title</HeaderCell>
                        <HeaderCell>Artist</HeaderCell>
                        {showAlbumColumn && <HeaderCell>Album</HeaderCell>}
                        <HeaderCell>Release</HeaderCell>
                        <HeaderCell align="right">Plays</HeaderCell>
                        <HeaderCell align="right">Unlocks</HeaderCell>
                        <HeaderCell align="right">Gifts</HeaderCell>
                        <HeaderCell align="right">{''}</HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>{children}</Table.Body>
            </Table.Root>
        </Box>
    );
};
