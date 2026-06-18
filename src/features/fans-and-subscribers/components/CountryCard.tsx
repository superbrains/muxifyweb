import React from 'react';
import { Box, Text, VStack, HStack, Icon } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import type { CountryStatDto } from '@/features/leaderboard/types';

interface CountryCardProps {
  title: string;
  icon: IconType;
  entries: CountryStatDto[];
  /** Formats the metric for a row, e.g. (v) => `${v} plays`. */
  formatValue: (entry: CountryStatDto) => string;
  emptyMessage: string;
}

/**
 * Fan geography as a ranked bar list. Bar widths are relative to the top
 * country so the distribution is legible at a glance — the card's signature.
 */
export const CountryCard: React.FC<CountryCardProps> = ({
  title,
  icon,
  entries,
  formatValue,
  emptyMessage,
}) => {
  const max = entries.reduce((m, e) => Math.max(m, e.value), 0) || 1;

  return (
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

      {entries.length === 0 ? (
        <VStack flex={1} justify="center" align="center" gap={1} py={6}>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            {emptyMessage}
          </Text>
          <Text fontSize="11px" color="gray.400" textAlign="center">
            Fans need a country on their profile to appear here.
          </Text>
        </VStack>
      ) : (
        <VStack align="stretch" gap={3.5}>
          {entries.map((entry) => (
            <Box key={`${entry.country}-${entry.rank}`}>
              <HStack justify="space-between" mb={1.5}>
                <Text fontSize="13px" color="gray.800" fontWeight="medium" lineClamp={1}>
                  {entry.country}
                </Text>
                <Text fontSize="12px" color="gray.500" whiteSpace="nowrap">
                  {formatValue(entry)}
                </Text>
              </HStack>
              <Box h="6px" bg="gray.100" borderRadius="full" overflow="hidden">
                <Box
                  h="full"
                  w={`${Math.max(6, (entry.value / max) * 100)}%`}
                  bg="primary.500"
                  borderRadius="full"
                  transition="width 0.4s ease"
                />
              </Box>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};
