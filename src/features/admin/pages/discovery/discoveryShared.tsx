import React from 'react';
import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import {
    FiDisc,
    FiGift,
    FiHeart,
    FiList,
    FiMusic,
    FiPlay,
    FiShare2,
    FiUser,
    FiVideo,
} from 'react-icons/fi';
import { UserAvatar } from '@shared/components';
import { CoverThumb, StatusBadge, toneStyle } from '../../components/ui';
import { formatCount } from '../../lib/format';
import type { CurationAction } from '../../types/discovery';
import { CURATION_TONE, rankChangeStyle } from './discoveryUtils';

const ACCENT = '#FF2D55';

/* ------------------------------------------------------------------ *
 * Inline text buttons + the legacy curate menu (kept for the gifting
 * exclusion flows + the trending row quick-actions).
 * ------------------------------------------------------------------ */

/** Inline text-button used across the Discovery pages (mirrors SpotlightPage's LinkBtn). */
export const LinkBtn: React.FC<{
    color?: string;
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
}> = ({ color = ACCENT, onClick, disabled, children }) => (
    <Text
        as="button"
        fontSize="xs"
        fontWeight="medium"
        color={disabled ? 'gray.300' : color}
        cursor={disabled ? 'not-allowed' : 'pointer'}
        onClick={disabled ? undefined : onClick}
        _hover={disabled ? undefined : { textDecoration: 'underline' }}
    >
        {children}
    </Text>
);

const ACTION_COLOR: Record<CurationAction, string> = {
    Pin: '#3B82F6',
    Boost: '#16A34A',
    Suppress: '#D97706',
    Exclude: '#E53E3E',
};

/** The Pin/Boost/Suppress/Exclude curate menu for a trending row. */
export const CurateActions: React.FC<{
    onAction: (action: CurationAction) => void;
    disabled?: boolean;
}> = ({ onAction, disabled }) => (
    <HStack gap={2.5} justify="flex-end">
        {(['Pin', 'Boost', 'Suppress', 'Exclude'] as CurationAction[]).map((action) => (
            <LinkBtn
                key={action}
                color={ACTION_COLOR[action]}
                disabled={disabled}
                onClick={() => onAction(action)}
            >
                {action}
            </LinkBtn>
        ))}
    </HStack>
);

/* ------------------------------------------------------------------ *
 * Rank treatment — top-3 medallions, plus the ▲/▼ rank-change delta.
 * ------------------------------------------------------------------ */

const MEDAL: Record<number, { bg: string; color: string }> = {
    1: { bg: '#FEF3C7', color: '#B45309' }, // gold
    2: { bg: '#EEF2F6', color: '#64748B' }, // silver
    3: { bg: '#FDE7D6', color: '#C2620E' }, // bronze
};

/** Ranked-list rank cell: top-3 get a tinted medallion, others a plain number, with a delta. */
export const RankBadge: React.FC<{ rank: number; rankChange?: number }> = ({
    rank,
    rankChange = 0,
}) => {
    const medal = MEDAL[rank];
    const rc = rankChangeStyle(rankChange);
    return (
        <VStack gap={1} align="center">
            <Box
                w="30px"
                h="30px"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg={medal?.bg ?? 'transparent'}
                color={medal?.color ?? 'gray.900'}
                fontWeight="bold"
                fontSize={medal ? '13px' : 'sm'}
                border={medal ? undefined : '1px solid'}
                borderColor="gray.100"
            >
                {rank}
            </Box>
            {rankChange !== 0 && (
                <Text fontSize="9px" fontWeight="semibold" color={rc.color}>
                    {rc.label}
                </Text>
            )}
        </VStack>
    );
};

/* ------------------------------------------------------------------ *
 * Content cell — cover art + title + (type · owner · genre).
 * ------------------------------------------------------------------ */

const TYPE_ICON: Record<string, IconType> = {
    Track: FiMusic,
    Video: FiVideo,
    Album: FiDisc,
    Playlist: FiList,
    Artist: FiUser,
};

export const ContentCell: React.FC<{
    title?: string | null;
    contentType: string;
    contentId: string;
    ownerName?: string | null;
    genreName?: string | null;
    coverArtUrl?: string | null;
}> = ({ title, contentType, contentId, ownerName, genreName, coverArtUrl }) => {
    const icon = TYPE_ICON[contentType] ?? FiMusic;
    const secondary = [contentType, ownerName, genreName].filter(Boolean).join(' · ');
    return (
        <HStack gap={3} minW={0}>
            <CoverThumb
                src={coverArtUrl}
                icon={icon}
                size="40px"
                radius={contentType === 'Artist' ? 'full' : '8px'}
            />
            <VStack align="start" gap={0.5} minW={0}>
                <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                    {title || contentId}
                </Text>
                {secondary && (
                    <Text fontSize="10px" color="gray.500" lineClamp={1} textTransform="capitalize">
                        {secondary}
                    </Text>
                )}
            </VStack>
        </HStack>
    );
};

/* ------------------------------------------------------------------ *
 * Metric chips — plays / likes / shares / gift coins.
 * ------------------------------------------------------------------ */

const MetricChip: React.FC<{ icon: IconType; value?: number }> = ({ icon, value }) =>
    value === undefined ? null : (
        <HStack gap={1} bg="gray.50" px={2} py={1} borderRadius="6px" flexShrink={0}>
            <Icon as={icon} boxSize="10px" color="#94A3B8" />
            <Text fontSize="10px" fontWeight="medium" color="gray.600">
                {formatCount(value)}
            </Text>
        </HStack>
    );

export const MetricChips: React.FC<{
    plays?: number;
    likes?: number;
    shares?: number;
    gifts?: number;
}> = ({ plays, likes, shares, gifts }) => (
    <HStack gap={1.5} flexWrap="wrap">
        <MetricChip icon={FiPlay} value={plays} />
        <MetricChip icon={FiHeart} value={likes} />
        <MetricChip icon={FiShare2} value={shares} />
        <MetricChip icon={FiGift} value={gifts} />
    </HStack>
);

/* ------------------------------------------------------------------ *
 * Curation status badge — "Pin/Boost/Suppress/Exclude" or "Organic".
 * ------------------------------------------------------------------ */

export const CurationStatusBadge: React.FC<{ action?: string | null }> = ({ action }) =>
    action ? (
        <StatusBadge style={toneStyle(CURATION_TONE[action] ?? 'info', action)} />
    ) : (
        <Text fontSize="11px" color="gray.400">
            Organic
        </Text>
    );

/* ------------------------------------------------------------------ *
 * Leaderboard podium — top-3 hero cards for the gifting surfaces.
 * ------------------------------------------------------------------ */

export interface PodiumEntry {
    rank: number;
    name: string;
    avatarUrl?: string | null;
    value: string;
    sub?: string;
}

const PODIUM_RING: Record<number, string> = { 1: '#F5C518', 2: '#B8C2CF', 3: '#CD7F32' };

export const LeaderboardPodium: React.FC<{ entries: PodiumEntry[] }> = ({ entries }) => {
    const top = entries.slice(0, 3);
    if (top.length === 0) return null;
    return (
        <HStack gap={3} align="stretch" w="100%" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
            {top.map((e) => (
                <VStack
                    key={e.rank}
                    flex="1"
                    minW={{ base: '45%', md: 0 }}
                    bg="white"
                    border="1px solid"
                    borderColor="gray.100"
                    borderRadius="xl"
                    p={4}
                    gap={2}
                    position="relative"
                >
                    <Box
                        position="absolute"
                        top={2}
                        left={3}
                        fontSize="11px"
                        fontWeight="bold"
                        color={PODIUM_RING[e.rank]}
                    >
                        #{e.rank}
                    </Box>
                    <Box borderRadius="full" p="2px" border="2px solid" borderColor={PODIUM_RING[e.rank]}>
                        <UserAvatar name={e.name} src={e.avatarUrl} size="lg" />
                    </Box>
                    <VStack gap={0.5} align="center" minW={0} w="100%">
                        <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                            {e.name}
                        </Text>
                        <Text fontSize="13px" fontWeight="bold" color={ACCENT}>
                            {e.value}
                        </Text>
                        {e.sub && (
                            <Text fontSize="10px" color="gray.500" lineClamp={1}>
                                {e.sub}
                            </Text>
                        )}
                    </VStack>
                </VStack>
            ))}
        </HStack>
    );
};

