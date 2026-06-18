import React, { useState } from 'react';
import { Box, Text, VStack, Flex, Grid, Spinner, Alert, SimpleGrid } from '@chakra-ui/react';
import {
  FiPlay,
  FiUsers,
  FiGift,
  FiUnlock,
  FiAward,
  FiHeart,
  FiMapPin,
  FiGlobe,
} from 'react-icons/fi';
import { AnimatedTabs } from '@shared/components';
import { useUserStore } from '@/app/store/useUserStore';
import { useArtistStore } from '@/features/artists/store/useArtistStore';
import type { FanMediaType, CountryStatDto } from '@/features/leaderboard/types';
import type { TimeFilter } from '../types';
import { useFanAnalytics } from '../hooks/useFanAnalytics';
import { StatTile } from './StatTile';
import { LeaderCard } from './LeaderCard';
import { CountryCard } from './CountryCard';
import { ActivityFeedTable } from './ActivityFeedTable';

interface FansTabProps {
  mediaType: FanMediaType;
}

const timeTabs = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

/** Compact number formatter for KPI values (1.2K / 3.4M). */
const fmtCount = (n: number): string => {
  if (n >= 1_000_000) return `${parseFloat((n / 1_000_000).toFixed(1))}M`;
  if (n >= 1_000) return `${parseFloat((n / 1_000).toFixed(1))}K`;
  return n.toLocaleString();
};

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text
    fontSize="11px"
    fontWeight="semibold"
    letterSpacing="0.08em"
    textTransform="uppercase"
    color="gray.500"
  >
    {children}
  </Text>
);

/**
 * One Fans & Subscribers content tab (music or video). Every figure is sourced
 * from a real, media-scoped endpoint via useFanAnalytics — no placeholders.
 */
export const FansTab: React.FC<FansTabProps> = ({ mediaType }) => {
  const { user } = useUserStore();
  const { selectedArtistId } = useArtistStore();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('monthly');

  // Record labels viewing a roster artist drive analytics by the selected artist;
  // otherwise the logged-in artist views their own.
  const artistId = selectedArtistId ?? user?.id;
  const { data, isLoading, error, hasFetched } = useFanAnalytics(artistId, mediaType, timeFilter);

  const playsLabel = mediaType === 'video' ? 'Total Views' : 'Total Plays';
  const playsWord = mediaType === 'video' ? 'views' : 'plays';

  if (!artistId) {
    return (
      <VStack bg="white" borderRadius="xl" p={6} minH="400px" justify="center">
        <Text color="gray.600">Sign in to view your fans</Text>
      </VStack>
    );
  }

  if (isLoading && !hasFetched) {
    return (
      <VStack bg="white" borderRadius="xl" p={6} minH="400px" justify="center" gap={3}>
        <Spinner size="xl" color="red.500" />
        <Text color="gray.600">Loading fan analytics…</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Box bg="white" borderRadius="xl" p={6}>
        <Alert.Root status="error" borderRadius="md">
          <Alert.Indicator />
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      </Box>
    );
  }

  const summary = data.summary;
  const newFollowers = summary ? Math.max(0, summary.followers.value - summary.followers.previous) : 0;

  const countryValue =
    (word: string) =>
    (entry: CountryStatDto): string =>
      `${entry.count.toLocaleString()} ${word}`;

  return (
    <VStack align="stretch" gap={6}>
      {/* Time filter */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
        <AnimatedTabs
          tabs={timeTabs}
          activeTab={timeFilter}
          onTabChange={(id) => setTimeFilter(id as TimeFilter)}
          selectedColor="red.500"
          size="sm"
        />
        {isLoading && <Spinner size="sm" color="red.400" />}
      </Flex>

      {/* KPI strip — the hero: real engagement at a glance */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
        <StatTile
          label={playsLabel}
          value={fmtCount(summary?.plays.value ?? 0)}
          icon={FiPlay}
          percentChange={summary?.plays.percentChange}
          isPositive={summary?.plays.isPositiveChange}
        />
        <StatTile
          label="Followers"
          value={fmtCount(summary?.followers.value ?? 0)}
          icon={FiUsers}
          percentChange={summary?.followers.percentChange}
          isPositive={summary?.followers.isPositiveChange}
          caption={newFollowers > 0 ? `+${fmtCount(newFollowers)} new` : undefined}
        />
        <StatTile
          label="Gifts Received"
          value={fmtCount(summary?.gifts.value ?? 0)}
          icon={FiGift}
          percentChange={summary?.gifts.percentChange}
          isPositive={summary?.gifts.isPositiveChange}
          caption={summary && summary.totalGiftValue > 0 ? `${fmtCount(summary.totalGiftValue)} coins` : undefined}
        />
        <StatTile
          label="Content Unlocks"
          value={fmtCount(summary?.unlocks.value ?? 0)}
          icon={FiUnlock}
          percentChange={summary?.unlocks.percentChange}
          isPositive={summary?.unlocks.isPositiveChange}
          caption={summary && summary.totalUnlockCoins > 0 ? `${fmtCount(summary.totalUnlockCoins)} coins` : undefined}
        />
      </SimpleGrid>

      {/* Top supporters */}
      <VStack align="stretch" gap={3}>
        <SectionHeading>Your top supporters</SectionHeading>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <LeaderCard
            title="Top givers"
            icon={FiHeart}
            emptyMessage="No gifts yet"
            items={data.topGivers.map((f) => ({
              rank: f.rank,
              name: f.displayName || f.username || 'Anonymous',
              subLabel: `${f.giftCount.toLocaleString()} ${f.giftCount === 1 ? 'gift' : 'gifts'}`,
              value: `${fmtCount(f.totalGiftValue)} coins`,
              avatarUrl: f.avatarUrl,
            }))}
          />
          <LeaderCard
            title="Top unlockers"
            icon={FiUnlock}
            emptyMessage="No unlocks yet"
            items={data.topUnlockers.map((u) => ({
              rank: u.rank,
              name: u.displayName || u.username || 'Anonymous',
              subLabel: `${u.unlockCount.toLocaleString()} ${u.unlockCount === 1 ? 'unlock' : 'unlocks'}`,
              value: `${fmtCount(u.totalCoinsSpent)} coins`,
              avatarUrl: u.avatarUrl,
            }))}
          />
          <LeaderCard
            title="Most unlocked content"
            icon={FiAward}
            shape="rounded"
            emptyMessage="No unlocks yet"
            items={data.topUnlockedContent.map((c) => ({
              rank: c.rank,
              name: c.title || 'Untitled',
              subLabel: c.artistName || undefined,
              value: `${fmtCount(c.unlockCount)} unlocks`,
              avatarUrl: c.coverUrl,
            }))}
          />
        </Grid>
      </VStack>

      {/* Geography */}
      <VStack align="stretch" gap={3}>
        <SectionHeading>Where your fans are</SectionHeading>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <CountryCard
            title={`Top ${playsWord} by country`}
            icon={FiGlobe}
            entries={data.playsByCountry}
            formatValue={countryValue(playsWord)}
            emptyMessage="No location data yet"
          />
          <CountryCard
            title="Top gifts by country"
            icon={FiMapPin}
            entries={data.giftsByCountry}
            formatValue={countryValue('gifts')}
            emptyMessage="No location data yet"
          />
          <CountryCard
            title="Top unlocks by country"
            icon={FiMapPin}
            entries={data.unlocksByCountry}
            formatValue={countryValue('unlocks')}
            emptyMessage="No location data yet"
          />
        </Grid>
      </VStack>

      {/* Activity feed */}
      <ActivityFeedTable sales={data.activity} />
    </VStack>
  );
};
