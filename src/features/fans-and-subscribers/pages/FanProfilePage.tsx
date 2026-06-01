import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  SimpleGrid,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import {
  FaMedal,
  FaGift,
  FaHeart,
  FaLockOpen,
  FaUserPlus,
  FaShareAlt,
  FaMusic,
  FaPlay,
  FaTrophy,
  FaBolt,
  FaCheckCircle,
  FaCoins,
  FaChartLine,
} from 'react-icons/fa';
import { AnimatedTabs, EmptyState } from '@shared/components';
import { AuthedImage } from '@shared/components/AuthedImage';
import { formatDate } from '@shared/lib/formatDate';
import {
  useFanProfile,
  useFanActivity,
  useSupportedArtists,
  useFollowedArtists,
  useFanBadges,
  useFanMedals,
} from '../hooks/fanProfileHooks';
import type {
  FanActivityDto,
  SupportedArtistDto,
  FollowedArtistDto,
} from '../types';
import { AchievementMedallion } from '../components/AchievementMedallion';

const MEDAL_TIERS: { name: string; threshold: number }[] = [
  { name: 'Iron Fan', threshold: 10_000 },
  { name: 'Crown Fan', threshold: 50_000 },
  { name: 'Gold Fan', threshold: 200_000 },
  { name: 'Platinum Fan', threshold: 1_000_000 },
  { name: 'Diamond Fan', threshold: 5_000_000 },
];

type TabId = 'status' | 'achievement' | 'activities';

export const FanProfilePage: React.FC = () => {
  const { fanId } = useParams<{ fanId: string }>();
  const [tab, setTab] = useState<TabId>('status');

  const profileQ = useFanProfile(fanId ?? null);
  const supportedQ = useSupportedArtists(fanId ?? null);
  const followedQ = useFollowedArtists(fanId ?? null);
  const activityQ = useFanActivity(fanId ?? null, 1);
  const badgesQ = useFanBadges(fanId ?? null);
  const medalsQ = useFanMedals(fanId ?? null);

  if (profileQ.isLoading) {
    return (
      <Flex h="60vh" align="center" justify="center">
        <Spinner size="xl" color="primary.500" />
      </Flex>
    );
  }

  if (profileQ.isError || !profileQ.data) {
    return (
      <Box px={7} py={10}>
        <EmptyState
          title="Could not load this profile"
          description="Please try again."
        />
      </Box>
    );
  }

  const p = profileQ.data;
  const name = p.username || p.displayName || 'Unknown';
  const bio =
    p.bio && p.bio.trim().length > 0 ? p.bio.trim() : 'Music fan on Muxify.';

  return (
    <VStack align="stretch" gap={6} px={{ base: 4, md: 7 }} pb={10}>
      {/* Header */}
      <Flex direction="column" align="center" gap={3} pt={4}>
        <Box position="relative">
          <Box w="100px" h="100px" borderRadius="full" overflow="hidden" bg="gray.700">
            <AuthedImage
              src={p.avatarUrl}
              w="100px"
              h="100px"
              objectFit="cover"
              fallback={
                <Flex w="100px" h="100px" align="center" justify="center" bg="gray.700">
                  <Text fontSize="3xl" color="whiteAlpha.700">
                    {name.charAt(0).toUpperCase()}
                  </Text>
                </Flex>
              }
            />
          </Box>
          {p.isVerified && (
            <Box position="absolute" top="0" right="0" color="yellow.400">
              <Icon as={FaCheckCircle} boxSize={6} />
            </Box>
          )}
        </Box>
        <Text fontSize="2xl" fontWeight="semibold">
          {name}
        </Text>
        <Text fontSize="sm" color="gray.400" textAlign="center" maxW="360px">
          {bio}
        </Text>
        <Text fontSize="xs" color="gray.500">
          Joined {formatDate(p.joinedAt, { month: 'short', year: 'numeric' })}
        </Text>

        {/* Featured badges */}
        {p.featuredBadges.length > 0 && (
          <HStack gap={3} pt={1}>
            {p.featuredBadges.slice(0, 5).map((b) => (
              <AchievementMedallion
                key={b.id}
                icon={b.icon}
                color={b.color}
                size={36}
                glyph={<FaMedal />}
              />
            ))}
          </HStack>
        )}
      </Flex>

      {/* Position */}
      <SimpleGrid columns={2} gap={4}>
        <StatCard
          icon={<FaCoins />}
          label="Gifts Record"
          value={p.totalGiftValue > 0 ? `m${formatThousands(p.totalGiftValue)}` : '—'}
          accent="#FFAD12"
        />
        <StatCard
          icon={<FaChartLine />}
          label="Leaderboard"
          value={p.leaderboardRank != null ? `#${p.leaderboardRank}` : '—'}
          accent="#06A0B5"
        />
      </SimpleGrid>

      {/* Tabs */}
      <AnimatedTabs
        tabs={[
          { id: 'status', label: 'Status', icon: FaBolt },
          { id: 'achievement', label: 'Achievement', icon: FaTrophy },
          { id: 'activities', label: 'Activities', icon: FaChartLine },
        ]}
        activeTab={tab}
        onTabChange={(id) => setTab(id as TabId)}
        size="md"
        backgroundColor="gray.800"
        selectedColor="primary.500"
        tabStyle={1}
      />

      {tab === 'status' && (
        <VStack align="stretch" gap={6}>
          <ArtistRow
            title="Artists & Creators"
            loading={supportedQ.isLoading}
            items={(supportedQ.data?.artists ?? []).map((a: SupportedArtistDto) => ({
              id: a.artistId,
              name: a.artistName ?? 'Artist',
              avatarUrl: a.avatarUrl,
            }))}
            emptyText="No supported artists yet."
          />
          <ArtistRow
            title="Following"
            loading={followedQ.isLoading}
            items={(followedQ.data?.artists ?? []).map((a: FollowedArtistDto) => ({
              id: a.artistId,
              name: a.artistName ?? 'Artist',
              avatarUrl: a.avatarUrl,
            }))}
            emptyText="Not following any artists yet."
          />
        </VStack>
      )}

      {tab === 'achievement' && (
        <VStack align="stretch" gap={6}>
          <MedalProgress totalGiftValue={p.totalGiftValue} />
          <Box>
            <Text fontWeight="medium" mb={3}>
              Medals
            </Text>
            {medalsQ.isLoading ? (
              <Spinner color="primary.500" />
            ) : (medalsQ.data?.medals.length ?? 0) === 0 ? (
              <CardEmpty text="No medals yet — gift coins to climb the tiers (Iron → Diamond)." />
            ) : (
              <HStack gap={4} wrap="wrap">
                {medalsQ.data!.medals.map((m) => (
                  <VStack key={m.id} gap={1}>
                    <AchievementMedallion icon={m.icon} color={m.color} size={56} />
                    <Text fontSize="xs" color="gray.300">
                      {m.name}
                    </Text>
                  </VStack>
                ))}
              </HStack>
            )}
          </Box>
          <Box>
            <Text fontWeight="medium" mb={3}>
              Badges
            </Text>
            {badgesQ.isLoading ? (
              <Spinner color="primary.500" />
            ) : (badgesQ.data?.badges.length ?? 0) === 0 ? (
              <CardEmpty text="Send gifts, follow artists and unlock content to earn badges." />
            ) : (
              <SimpleGrid columns={{ base: 3, md: 4 }} gap={4}>
                {badgesQ.data!.badges.map((b) => (
                  <VStack
                    key={b.id}
                    gap={2}
                    p={3}
                    borderRadius="lg"
                    bg="whiteAlpha.50"
                    borderWidth="1px"
                    borderColor="whiteAlpha.100"
                  >
                    <AchievementMedallion
                      icon={b.icon}
                      color={b.color}
                      size={56}
                      glyph={<FaMedal />}
                    />
                    <Text fontSize="xs" color="gray.200" textAlign="center">
                      {b.name}
                    </Text>
                  </VStack>
                ))}
              </SimpleGrid>
            )}
          </Box>
        </VStack>
      )}

      {tab === 'activities' && (
        <Box>
          <Text fontWeight="medium" mb={3}>
            Activities
          </Text>
          {activityQ.isLoading ? (
            <Spinner color="primary.500" />
          ) : (activityQ.data?.activities.length ?? 0) === 0 ? (
            <CardEmpty text="Gifts, likes, unlocks and follows will show up here." />
          ) : (
            <VStack
              align="stretch"
              gap={4}
              p={4}
              borderRadius="lg"
              bg="whiteAlpha.50"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
            >
              {activityQ.data!.activities.map((a) => (
                <ActivityRow key={a.id} activity={a} />
              ))}
            </VStack>
          )}
        </Box>
      )}
    </VStack>
  );
};

// ---------------------------------------------------------------------------

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}> = ({ icon, label, value, accent }) => (
  <HStack
    p={4}
    borderRadius="lg"
    bg="whiteAlpha.50"
    borderWidth="1px"
    borderColor="whiteAlpha.100"
    gap={3}
  >
    <Flex
      align="center"
      justify="center"
      w="40px"
      h="40px"
      borderRadius="full"
      color="white"
      style={{ background: accent }}
    >
      {icon}
    </Flex>
    <Box>
      <Text fontSize="lg" fontWeight="bold">
        {value}
      </Text>
      <Text fontSize="sm" color="gray.400">
        {label}
      </Text>
    </Box>
  </HStack>
);

const CardEmpty: React.FC<{ text: string }> = ({ text }) => (
  <Box
    p={5}
    borderRadius="lg"
    borderWidth="1px"
    borderColor="whiteAlpha.100"
    textAlign="center"
  >
    <Text fontSize="sm" color="gray.400">
      {text}
    </Text>
  </Box>
);

const ArtistRow: React.FC<{
  title: string;
  loading: boolean;
  items: { id: string; name: string; avatarUrl?: string }[];
  emptyText: string;
}> = ({ title, loading, items, emptyText }) => (
  <Box>
    <Text fontWeight="medium" mb={3}>
      {title}
    </Text>
    {loading ? (
      <Spinner color="primary.500" />
    ) : items.length === 0 ? (
      <CardEmpty text={emptyText} />
    ) : (
      <HStack gap={4} overflowX="auto" pb={2}>
        {items.map((a) => (
          <VStack key={a.id} gap={1} minW="64px">
            <Box w="56px" h="56px" borderRadius="full" overflow="hidden" bg="gray.700">
              <AuthedImage
                src={a.avatarUrl}
                w="56px"
                h="56px"
                objectFit="cover"
                fallback={
                  <Flex w="56px" h="56px" align="center" justify="center" bg="gray.700">
                    <Text color="whiteAlpha.700">{a.name.charAt(0).toUpperCase()}</Text>
                  </Flex>
                }
              />
            </Box>
            <Text fontSize="xs" color="gray.300" maxW="64px" truncate>
              {a.name}
            </Text>
          </VStack>
        ))}
      </HStack>
    )}
  </Box>
);

const MedalProgress: React.FC<{ totalGiftValue: number }> = ({ totalGiftValue }) => {
  let next: { name: string; threshold: number } | undefined;
  let prev = 0;
  for (const tier of MEDAL_TIERS) {
    if (totalGiftValue < tier.threshold) {
      next = tier;
      break;
    }
    prev = tier.threshold;
  }

  if (!next) {
    return (
      <Box p={4} borderRadius="lg" borderWidth="1px" borderColor="whiteAlpha.100">
        <HStack>
          <Icon as={FaMedal} color="yellow.400" />
          <Text fontSize="sm">Top tier reached — you&apos;re a Diamond Fan! 💎</Text>
        </HStack>
      </Box>
    );
  }

  const span = Math.max(1, next.threshold - prev);
  const fraction = Math.max(0, Math.min(1, (totalGiftValue - prev) / span));
  const remaining = next.threshold - totalGiftValue;

  return (
    <Box
      p={4}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      bg="whiteAlpha.50"
    >
      <HStack justify="space-between" mb={2}>
        <HStack>
          <Icon as={FaMedal} color="yellow.400" />
          <Text fontSize="sm" fontWeight="medium">
            Next medal: {next.name}
          </Text>
        </HStack>
        <Text fontSize="xs" color="gray.400">
          {Math.round(fraction * 100)}%
        </Text>
      </HStack>
      <Box w="100%" h="7px" borderRadius="full" bg="whiteAlpha.200" overflow="hidden">
        <Box h="100%" w={`${fraction * 100}%`} bg="yellow.400" borderRadius="full" />
      </Box>
      <Text fontSize="xs" color="gray.500" mt={2}>
        {formatThousands(remaining)} more coins gifted to unlock {next.name}
      </Text>
    </Box>
  );
};

const ActivityRow: React.FC<{ activity: FanActivityDto }> = ({ activity }) => {
  const visual = activityVisuals(activity.activityType);
  const title = activityTitle(activity);
  const isMilestone =
    activity.activityType === 'BadgeEarned' ||
    activity.activityType === 'MedalEarned';

  return (
    <HStack gap={3} align="center">
      <Box position="relative" w="48px" h="48px" flexShrink={0}>
        {isMilestone ? (
          <AchievementMedallion icon="" color="#FFAD12" size={48} glyph={visual.icon} />
        ) : activity.relatedImageUrl ? (
          <Box w="48px" h="48px" borderRadius="md" overflow="hidden">
            <AuthedImage
              src={activity.relatedImageUrl}
              w="48px"
              h="48px"
              objectFit="cover"
              fallback={<TypeTile color={visual.color} icon={visual.icon} />}
            />
          </Box>
        ) : (
          <TypeTile color={visual.color} icon={visual.icon} />
        )}
        <Flex
          position="absolute"
          right="-3px"
          bottom="-3px"
          align="center"
          justify="center"
          w="20px"
          h="20px"
          borderRadius="full"
          color="white"
          borderWidth="2px"
          borderColor="gray.900"
          fontSize="10px"
          style={{ background: visual.color }}
        >
          {visual.icon}
        </Flex>
      </Box>
      <Box flex={1} minW={0}>
        <Text fontSize="sm" lineClamp={2}>
          {title}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {formatDate(activity.activityAt, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </Box>
      {activity.coinValue != null && activity.coinValue > 0 && (
        <Text fontSize="sm" fontWeight="semibold" color="yellow.400">
          m{activity.coinValue}
        </Text>
      )}
    </HStack>
  );
};

const TypeTile: React.FC<{ color: string; icon: React.ReactNode }> = ({ color, icon }) => (
  <Flex
    w="48px"
    h="48px"
    borderRadius="md"
    align="center"
    justify="center"
    color={color}
    style={{ background: `${color}33` }}
  >
    {icon}
  </Flex>
);

function activityVisuals(type: string): { icon: React.ReactNode; color: string } {
  switch (type) {
    case 'GiftSent':
    case 'GiftReceived':
      return { icon: <FaGift />, color: '#EA4335' };
    case 'ContentLike':
      return { icon: <FaHeart />, color: '#EA4335' };
    case 'ContentUnlock':
      return { icon: <FaLockOpen />, color: '#06A0B5' };
    case 'ArtistFollow':
      return { icon: <FaUserPlus />, color: '#34A891' };
    case 'ContentShare':
      return { icon: <FaShareAlt />, color: '#8D4CA8' };
    case 'TrackPlay':
      return { icon: <FaMusic />, color: '#06A0B5' };
    case 'VideoPlay':
      return { icon: <FaPlay />, color: '#06A0B5' };
    case 'BadgeEarned':
      return { icon: <FaMedal />, color: '#FFAD12' };
    case 'MedalEarned':
      return { icon: <FaTrophy />, color: '#FFAD12' };
    default:
      return { icon: <FaBolt />, color: '#666666' };
  }
}

function activityTitle(a: FanActivityDto): string {
  const artist = a.artistName ?? 'an artist';
  const track = a.trackTitle ?? a.videoTitle ?? '';
  switch (a.activityType) {
    case 'TrackPlay':
      return track ? `Played ${track}` : 'Played a track';
    case 'VideoPlay':
      return track ? `Watched ${track}` : 'Watched a video';
    case 'ContentUnlock':
      return track ? `Unlocked ${track} by ${artist}` : 'Unlocked content';
    case 'GiftSent':
      return `Sent ${a.giftType ?? 'a gift'} to ${artist}`;
    case 'GiftReceived':
      return `Received ${a.giftType ?? 'a gift'}`;
    case 'ArtistFollow':
      return `Followed ${artist}`;
    case 'BadgeEarned':
      return `Earned the ${a.badgeName ?? 'a'} badge`;
    case 'MedalEarned':
      return `Earned the ${a.medalName ?? 'a'} medal`;
    case 'ContentLike':
      return track ? `Liked ${track} by ${artist}` : 'Liked content';
    case 'ContentShare':
      return track ? `Shared ${track}` : 'Shared content';
    default:
      return a.activityType;
  }
}

function formatThousands(value: number): string {
  return value.toLocaleString('en-US');
}

export default FanProfilePage;
