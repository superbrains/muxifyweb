import React from 'react';
import { Box, Text, VStack, HStack, Icon } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import { AuthedImage } from '@/shared/components/AuthedImage';

export interface LeaderItem {
  rank: number;
  name: string;
  /** Small line under the name, e.g. "12 gifts". */
  subLabel?: string;
  /** Right-aligned primary metric, e.g. "8,400 coins". */
  value: string;
  avatarUrl?: string;
}

interface LeaderCardProps {
  title: string;
  icon: IconType;
  items: LeaderItem[];
  /** Round avatars for people, square thumbnails for content (tracks/videos). */
  shape?: 'circle' | 'rounded';
  emptyMessage: string;
}

// Gold / silver / bronze for the podium, brand tint for everyone else.
const medalStyle = (rank: number): { bg: string; color: string } => {
  switch (rank) {
    case 1:
      return { bg: '#FDF0D5', color: '#B8860B' };
    case 2:
      return { bg: '#EEF0F3', color: '#7A8699' };
    case 3:
      return { bg: '#F6E6DA', color: '#A86A3D' };
    default:
      return { bg: 'primary.50', color: 'primary.500' };
  }
};

/**
 * A ranked leaderboard card for fan supporters (givers, unlockers) or content.
 * The podium ranks get medal colours so the hierarchy reads instantly.
 */
export const LeaderCard: React.FC<LeaderCardProps> = ({
  title,
  icon,
  items,
  shape = 'circle',
  emptyMessage,
}) => (
  <Box
    display="flex"
    flexDirection="column"
    bg="white"
    borderRadius="xl"
    border="1px solid"
    borderColor="gray.100"
    p={5}
    minH="248px"
    transition="box-shadow 0.2s ease"
    _hover={{ boxShadow: 'sm' }}
  >
    <HStack gap={2} mb={4}>
      <Box
        w={7}
        h={7}
        borderRadius="md"
        bg="primary.50"
        color="primary.500"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Icon as={icon} boxSize={4} />
      </Box>
      <Text fontSize="sm" fontWeight="semibold" color="gray.900">
        {title}
      </Text>
    </HStack>

    {items.length === 0 ? (
      <VStack flex={1} justify="center" align="center" gap={1} py={6}>
        <Text fontSize="sm" color="gray.500" textAlign="center">
          {emptyMessage}
        </Text>
        <Text fontSize="11px" color="gray.400" textAlign="center">
          Data appears here as fans engage.
        </Text>
      </VStack>
    ) : (
      <VStack align="stretch" gap={3}>
        {items.map((item) => {
          const medal = medalStyle(item.rank);
          return (
            <HStack key={item.rank} justify="space-between" gap={3}>
              <HStack gap={3} minW={0}>
                <Box
                  w={6}
                  h={6}
                  flexShrink={0}
                  borderRadius="full"
                  bg={medal.bg}
                  color={medal.color}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="11px"
                  fontWeight="bold"
                >
                  {item.rank}
                </Box>
                <Box
                  w={9}
                  h={9}
                  flexShrink={0}
                  borderRadius={shape === 'circle' ? 'full' : 'md'}
                  bg="gray.100"
                  overflow="hidden"
                >
                  <AuthedImage
                    src={item.avatarUrl}
                    alt={item.name}
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                </Box>
                <VStack align="start" gap={0} minW={0}>
                  <Text fontSize="13px" color="gray.900" fontWeight="medium" lineClamp={1}>
                    {item.name}
                  </Text>
                  {item.subLabel && (
                    <Text fontSize="11px" color="gray.500" lineClamp={1}>
                      {item.subLabel}
                    </Text>
                  )}
                </VStack>
              </HStack>
              <Text fontSize="12px" fontWeight="semibold" color="primary.500" whiteSpace="nowrap">
                {item.value}
              </Text>
            </HStack>
          );
        })}
      </VStack>
    )}
  </Box>
);
