import React, { useMemo, useState } from 'react';
import { Box, Text, HStack, VStack, Flex, Badge, Icon, chakra } from '@chakra-ui/react';
import { FiActivity } from 'react-icons/fi';
import { AnimatedTabs, Select } from '@shared/components';
import { formatNaira } from '@shared/utils';
import { AuthedImage } from '@/shared/components/AuthedImage';
import type { RecentSaleDto } from '@/features/dashboard/services/dashboardService';

type ActivityKind = 'gift' | 'unlock' | 'other';

const kindOf = (type: string): ActivityKind => {
  const t = type.toLowerCase();
  if (t.includes('gift')) return 'gift';
  if (t.includes('unlock')) return 'unlock';
  return 'other';
};

const kindLabel: Record<ActivityKind, string> = {
  gift: 'Gift',
  unlock: 'Unlock',
  other: 'Earning',
};

const kindColor: Record<ActivityKind, { bg: string; color: string }> = {
  gift: { bg: 'primary.50', color: 'primary.600' },
  unlock: { bg: 'purple.50', color: 'purple.600' },
  other: { bg: 'gray.100', color: 'gray.600' },
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB');
};

interface ActivityFeedTableProps {
  sales: RecentSaleDto[];
}

/**
 * The live monetization feed for the artist — real gifts and unlocks from
 * /dashboard/recent-sales, filterable by type and sortable by recency/amount.
 */
export const ActivityFeedTable: React.FC<ActivityFeedTableProps> = ({ sales }) => {
  const [filter, setFilter] = useState<'all' | 'gift' | 'unlock'>('all');
  const [sort, setSort] = useState<string>('latest');

  const counts = useMemo(() => {
    let gift = 0;
    let unlock = 0;
    for (const s of sales) {
      const k = kindOf(s.type);
      if (k === 'gift') gift += 1;
      else if (k === 'unlock') unlock += 1;
    }
    return { all: sales.length, gift, unlock };
  }, [sales]);

  const tabs = [
    { id: 'all', label: `All (${counts.all.toLocaleString()})` },
    { id: 'gift', label: `Gifts (${counts.gift.toLocaleString()})` },
    { id: 'unlock', label: `Unlocks (${counts.unlock.toLocaleString()})` },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'highest', label: 'Highest amount' },
  ];

  const rows = useMemo(() => {
    let data = sales.filter((s) => (filter === 'all' ? true : kindOf(s.type) === filter));

    if (sort === 'latest') {
      data = [...data].sort(
        (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
      );
    } else if (sort === 'oldest') {
      data = [...data].sort(
        (a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
      );
    } else if (sort === 'highest') {
      data = [...data].sort((a, b) => b.amountDisplay - a.amountDisplay);
    }

    return data;
  }, [sales, filter, sort]);

  return (
    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" overflow="hidden">
      <Flex
        justify="space-between"
        align={{ base: 'start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={3}
        p={5}
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <VStack align="start" gap={0}>
          <Text fontSize="md" fontWeight="semibold" color="gray.900">
            Recent fan activity
          </Text>
          <Text fontSize="12px" color="gray.500">
            Live gifts and unlocks from your fans
          </Text>
        </VStack>
        <HStack gap={3} wrap="wrap">
          <AnimatedTabs
            tabs={tabs}
            activeTab={filter}
            onTabChange={(id) => setFilter(id as 'all' | 'gift' | 'unlock')}
            size="sm"
            selectedColor="red.500"
          />
          <Select
            options={sortOptions}
            value={sort}
            onChange={setSort}
            backgroundColor="white"
            textColor="gray.800"
            borderColor="gray.300"
            iconColor="gray.600"
            width="160px"
          />
        </HStack>
      </Flex>

      <Box overflowX="auto">
        <Box as="table" w="100%" minW="640px" borderCollapse="separate" borderSpacing="0">
          <Box as="thead" bg="gray.50">
            <Box as="tr">
              {['No.', 'Fan', 'Activity', 'Content', 'Date', 'Amount'].map((h, i) => (
                <Box
                  as="th"
                  key={h}
                  color="gray.500"
                  fontSize="11px"
                  fontWeight="semibold"
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                  py={3}
                  px={4}
                  textAlign={i === 5 ? 'right' : 'left'}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  {h}
                </Box>
              ))}
            </Box>
          </Box>
          <Box as="tbody">
            {rows.length === 0 ? (
              <Box as="tr">
                <chakra.td colSpan={6} textAlign="center" py={12}>
                  <VStack gap={2}>
                    <Box
                      w={10}
                      h={10}
                      borderRadius="full"
                      bg="gray.100"
                      color="gray.400"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiActivity} boxSize={5} />
                    </Box>
                    <Text fontSize="sm" color="gray.500">
                      No activity in this period yet
                    </Text>
                  </VStack>
                </chakra.td>
              </Box>
            ) : (
              rows.map((row, index) => {
                const kind = kindOf(row.type);
                const badge = kindColor[kind];
                return (
                  <Box
                    as="tr"
                    key={row.id}
                    _hover={{ bg: 'gray.50' }}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                  >
                    <Box as="td" fontSize="12px" fontWeight="semibold" py={3.5} px={4} color="gray.400">
                      {(index + 1).toString().padStart(2, '0')}
                    </Box>
                    <Box as="td" py={3.5} px={4}>
                      <HStack gap={2.5}>
                        <Box w={7} h={7} borderRadius="full" bg="gray.100" overflow="hidden" flexShrink={0}>
                          <AuthedImage
                            src={row.buyerAvatar}
                            alt={row.buyerName || 'Fan'}
                            w="full"
                            h="full"
                            objectFit="cover"
                          />
                        </Box>
                        <Text fontSize="13px" color="gray.900" lineClamp={1}>
                          {row.buyerName || 'Anonymous fan'}
                        </Text>
                      </HStack>
                    </Box>
                    <Box as="td" py={3.5} px={4}>
                      <Badge
                        bg={badge.bg}
                        color={badge.color}
                        fontSize="11px"
                        fontWeight="semibold"
                        px={2.5}
                        py={1}
                        borderRadius="full"
                        textTransform="none"
                      >
                        {row.giftType || kindLabel[kind]}
                      </Badge>
                    </Box>
                    <Box as="td" fontSize="13px" py={3.5} px={4} color="gray.600">
                      <Text lineClamp={1} maxW="220px">
                        {row.trackTitle || row.description || '—'}
                      </Text>
                    </Box>
                    <Box as="td" fontSize="12px" py={3.5} px={4} color="gray.500" whiteSpace="nowrap">
                      {formatDate(row.transactionDate)}
                    </Box>
                    <Box
                      as="td"
                      fontSize="13px"
                      fontWeight="semibold"
                      py={3.5}
                      px={4}
                      color="gray.900"
                      textAlign="right"
                      whiteSpace="nowrap"
                    >
                      {formatNaira(row.amountDisplay)}
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
