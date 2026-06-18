import React from 'react';
import { Box, Text, HStack, VStack, Icon } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';

interface StatTileProps {
  label: string;
  value: string;
  icon: IconType;
  /** Period-over-period change, e.g. 12.5 for +12.5%. Omit to hide the trend chip. */
  percentChange?: number;
  isPositive?: boolean;
  /** Secondary line under the value, e.g. "₦1.2M received". */
  caption?: string;
}

/**
 * A single KPI tile for the Fans & Subscribers header strip. Quiet by design —
 * the value is the focus, the accent rail and trend chip are the only colour.
 */
export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  icon,
  percentChange,
  isPositive = true,
  caption,
}) => {
  const showTrend = percentChange !== undefined && percentChange !== 0;
  const trendColor = isPositive ? 'green.600' : 'red.500';
  const trendBg = isPositive ? 'green.50' : 'red.50';

  return (
    <Box
      position="relative"
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.100"
      px={5}
      py={4}
      overflow="hidden"
      transition="box-shadow 0.2s ease, transform 0.2s ease"
      _hover={{ boxShadow: 'sm' }}
    >
      {/* Accent rail — the one bit of colour, ties tiles to the brand */}
      <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="primary.500" />

      <HStack justify="space-between" align="start" mb={3}>
        <Text
          fontSize="11px"
          fontWeight="semibold"
          letterSpacing="0.06em"
          textTransform="uppercase"
          color="gray.500"
        >
          {label}
        </Text>
        <Box
          w={8}
          h={8}
          borderRadius="lg"
          bg="primary.50"
          color="primary.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={icon} boxSize={4} />
        </Box>
      </HStack>

      <VStack align="start" gap={1}>
        <Text fontSize="28px" lineHeight="1.1" fontWeight="bold" color="gray.900">
          {value}
        </Text>
        <HStack gap={2} minH="20px">
          {showTrend && (
            <HStack
              gap={0.5}
              bg={trendBg}
              color={trendColor}
              borderRadius="full"
              px={2}
              py={0.5}
              fontSize="11px"
              fontWeight="semibold"
            >
              <Icon as={isPositive ? FiArrowUpRight : FiArrowDownRight} boxSize={3} />
              <Text>{Math.abs(percentChange!).toFixed(1)}%</Text>
            </HStack>
          )}
          {caption && (
            <Text fontSize="12px" color="gray.500" lineClamp={1}>
              {caption}
            </Text>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};
