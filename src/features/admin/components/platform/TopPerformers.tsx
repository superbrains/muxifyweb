import React from 'react';
import { SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { FiAward, FiMusic, FiUsers } from 'react-icons/fi';
import { DataTable, IdentityCell } from '../ui';
import type { DataColumn } from '../ui';
import { formatCount, formatMinorAmount } from '../../lib/format';
import type { BusinessTop, TopArtist, TopContent, TopSpender } from '../../types/platform';

type Ranked<T> = T & { rank: number };

const rank = <T,>(rows: T[]): Ranked<T>[] => rows.map((row, i) => ({ ...row, rank: i + 1 }));

const RankCell: React.FC<{ rank: number }> = ({ rank: n }) => (
    <Text fontSize="10px" fontWeight="bold" color={n === 1 ? 'primary.500' : 'gray.400'}>
        #{n}
    </Text>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Text fontSize="11px" fontWeight="semibold" color="gray.700" px={1}>
        {children}
    </Text>
);

interface TopPerformersProps {
    data?: BusinessTop;
    currency: string;
    loading: boolean;
}

/** Leaderboards for the window — who earned, what sold, and who spent. */
export const TopPerformers: React.FC<TopPerformersProps> = ({ data, currency, loading }) => {
    const artistColumns: DataColumn<Ranked<TopArtist>>[] = [
        { key: 'rank', header: '#', width: '36px', render: (r) => <RankCell rank={r.rank} /> },
        {
            key: 'artist',
            header: 'Artist',
            render: (r) => (
                <IdentityCell
                    name={r.name}
                    secondary={`${formatCount(r.earningCount)} earnings`}
                    avatarUrl={r.avatarUrl ?? undefined}
                    size="xs"
                />
            ),
        },
        {
            key: 'gross',
            header: 'Gross',
            align: 'right',
            render: (r) => (
                <Text fontWeight="semibold">{formatMinorAmount(r.grossMinor, currency)}</Text>
            ),
        },
        {
            key: 'net',
            header: 'Net',
            align: 'right',
            render: (r) => formatMinorAmount(r.netMinor, currency),
        },
    ];

    const contentColumns: DataColumn<Ranked<TopContent>>[] = [
        { key: 'rank', header: '#', width: '36px', render: (r) => <RankCell rank={r.rank} /> },
        {
            key: 'track',
            header: 'Track',
            render: (r) => (
                <VStack align="start" gap={0} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {r.title}
                    </Text>
                    <Text fontSize="10px" color="gray.500" lineClamp={1}>
                        {r.artistName}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'coins',
            header: 'Coins',
            align: 'right',
            render: (r) => formatCount(r.coins),
        },
        {
            key: 'value',
            header: 'Value',
            align: 'right',
            render: (r) => (
                <Text fontWeight="semibold">{formatMinorAmount(r.amountMinor, currency)}</Text>
            ),
        },
    ];

    const spenderColumns: DataColumn<Ranked<TopSpender>>[] = [
        { key: 'rank', header: '#', width: '36px', render: (r) => <RankCell rank={r.rank} /> },
        {
            key: 'fan',
            header: 'Fan',
            render: (r) => (
                <IdentityCell
                    name={r.name}
                    secondary={`${formatCount(r.txnCount)} transactions`}
                    avatarUrl={r.avatarUrl ?? undefined}
                    size="xs"
                />
            ),
        },
        {
            key: 'coins',
            header: 'Coins spent',
            align: 'right',
            render: (r) => <Text fontWeight="semibold">{formatCount(r.coinsSpent)}</Text>,
        },
        {
            key: 'split',
            header: 'Gifts / Unlocks',
            align: 'right',
            render: (r) => (
                <Text fontSize="10px" color="gray.500">
                    {formatCount(r.giftCoins)} / {formatCount(r.unlockCoins)}
                </Text>
            ),
        },
    ];

    return (
        <SimpleGrid columns={{ base: 1, xl: 3 }} gap={3} alignItems="start">
            <VStack align="stretch" gap={2}>
                <SectionTitle>Top artists</SectionTitle>
                <DataTable
                    columns={artistColumns}
                    rows={rank(data?.topArtists ?? [])}
                    rowKey={(r) => r.artistId}
                    loading={loading}
                    skeletonRows={5}
                    emptyIcon={FiAward}
                    emptyTitle="No artist earnings"
                    emptyDescription="No earnings were recorded in this window."
                />
            </VStack>
            <VStack align="stretch" gap={2}>
                <SectionTitle>Top content</SectionTitle>
                <DataTable
                    columns={contentColumns}
                    rows={rank(data?.topContent ?? [])}
                    rowKey={(r) => r.trackId}
                    loading={loading}
                    skeletonRows={5}
                    emptyIcon={FiMusic}
                    emptyTitle="No track earnings"
                    emptyDescription="No track-attributed earnings in this window."
                />
            </VStack>
            <VStack align="stretch" gap={2}>
                <SectionTitle>Top spenders</SectionTitle>
                <DataTable
                    columns={spenderColumns}
                    rows={rank(data?.topSpenders ?? [])}
                    rowKey={(r) => r.userId}
                    loading={loading}
                    skeletonRows={5}
                    emptyIcon={FiUsers}
                    emptyTitle="No fan spending"
                    emptyDescription="No gifts or unlocks were recorded in this window."
                />
            </VStack>
        </SimpleGrid>
    );
};
