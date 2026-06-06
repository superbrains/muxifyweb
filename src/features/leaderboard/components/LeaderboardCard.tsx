import React from 'react';
import { Box, Text, VStack, HStack, Icon, Skeleton, SkeletonCircle } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import { FiInbox } from 'react-icons/fi';
import { AuthedImage } from '../../../shared/components/AuthedImage';
import { UserAvatar } from '@/shared/components/UserAvatar';

export interface LeaderboardItem {
    rank: number;
    name: string;
    value: string;
    avatarUrl?: string;
}

interface LeaderboardCardProps {
    title: string;
    data: LeaderboardItem[];
    /** Header icon shown beside the title. */
    icon?: IconType;
    /** 'people' renders circular avatars with initials; 'content' renders rounded cover art. */
    variant?: 'people' | 'content';
    /** Fallback icon for the 'content' variant when there's no cover art. */
    fallbackIcon?: IconType;
    /** Short label shown under each value (e.g. "plays", "gifts"). */
    valueLabel?: string;
    loading?: boolean;
    emptyLabel?: string;
}

// Medal accent colours for the top three ranks.
const MEDAL_COLORS: Record<number, { bg: string; color: string }> = {
    1: { bg: '#FFF3D6', color: '#B8860B' }, // gold
    2: { bg: '#EEF1F4', color: '#7A8794' }, // silver
    3: { bg: '#FBE6D6', color: '#B5662E' }, // bronze
};

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
    const medal = MEDAL_COLORS[rank];
    return (
        <Box
            w={6}
            h={6}
            borderRadius="full"
            bg={medal ? medal.bg : 'red.50'}
            color={medal ? medal.color : 'primary.500'}
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="11px"
            fontWeight="bold"
            flexShrink={0}
        >
            {rank}
        </Box>
    );
};

const ContentCover: React.FC<{ src?: string; alt: string; fallbackIcon: IconType }> = ({ src, alt, fallbackIcon }) => {
    const Fallback = (
        <Box
            w={9}
            h={9}
            borderRadius="md"
            bg="gray.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="gray.400"
        >
            <Icon as={fallbackIcon} boxSize={4} />
        </Box>
    );
    return (
        <AuthedImage
            src={src}
            alt={alt}
            w={9}
            h={9}
            borderRadius="md"
            objectFit="cover"
            fallback={Fallback}
        />
    );
};

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
    title,
    data,
    icon,
    variant = 'content',
    fallbackIcon = FiInbox,
    valueLabel,
    loading = false,
    emptyLabel = 'No data yet',
}) => (
    <Box
        display="flex"
        flexDirection="column"
        bg="white"
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="0 1px 2px rgba(16, 24, 40, 0.04)"
        p={4}
        minH="260px"
    >
        {/* Header */}
        <HStack gap={2} mb={3} pb={3} borderBottom="1px solid" borderColor="gray.100">
            {icon && (
                <Box
                    w={7}
                    h={7}
                    borderRadius="md"
                    bg="red.50"
                    color="primary.500"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                >
                    <Icon as={icon} boxSize={4} />
                </Box>
            )}
            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                {title}
            </Text>
        </HStack>

        {loading ? (
            <VStack align="stretch" gap={3} flex={1}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <HStack key={i} gap={3}>
                        <SkeletonCircle size="6" />
                        <Skeleton height="36px" width="36px" borderRadius="md" />
                        <VStack align="start" gap={1} flex={1}>
                            <Skeleton height="10px" width="70%" />
                            <Skeleton height="8px" width="40%" />
                        </VStack>
                    </HStack>
                ))}
            </VStack>
        ) : data.length === 0 ? (
            <VStack flex={1} justify="center" align="center" gap={2} py={6} color="gray.400">
                <Icon as={fallbackIcon} boxSize={7} />
                <Text fontSize="xs">{emptyLabel}</Text>
            </VStack>
        ) : (
            <VStack align="stretch" gap={2.5}>
                {data.map((item) => (
                    <HStack key={`${item.rank}-${item.name}`} justify="space-between" gap={3}>
                        <HStack gap={3} minW={0} flex={1}>
                            <RankBadge rank={item.rank} />
                            {variant === 'people' ? (
                                <UserAvatar name={item.name} src={item.avatarUrl} size="sm" />
                            ) : (
                                <ContentCover src={item.avatarUrl} alt={item.name} fallbackIcon={fallbackIcon} />
                            )}
                            <Text
                                fontSize="xs"
                                color="gray.800"
                                fontWeight="medium"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace="nowrap"
                                minW={0}
                            >
                                {item.name}
                            </Text>
                        </HStack>
                        <VStack align="end" gap={0} flexShrink={0}>
                            <Text fontSize="xs" fontWeight="bold" color="gray.900">
                                {item.value}
                            </Text>
                            {valueLabel && (
                                <Text fontSize="9px" color="gray.400" textTransform="uppercase" letterSpacing="0.04em">
                                    {valueLabel}
                                </Text>
                            )}
                        </VStack>
                    </HStack>
                ))}
            </VStack>
        )}
    </Box>
);
