import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import {
  getWithdrawalStatusLabel,
  type WithdrawalStatus,
} from '@/features/earnings-and-royalty/types';

// Shared palette with the admin finance pills: green = paid, blue = processing,
// amber = waiting (label/admin), red = rejected/failed.
const GREEN = { bg: '#E7FFF7', color: '#0F7B5C', dot: '#16A34A' };
const AMBER = { bg: '#FFF9E6', color: '#92660C', dot: '#D97706' };
const BLUE = { bg: '#ECF7FF', color: '#1D4ED8', dot: '#3B82F6' };
const RED = { bg: '#FEF2F2', color: '#C53030', dot: '#E53E3E' };
const SLATE = { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' };

const styleFor = (status: WithdrawalStatus) => {
  switch (status) {
    case 'Completed':
      return GREEN;
    case 'Processing':
      return BLUE;
    case 'PendingLabelApproval':
    case 'Pending':
      return AMBER;
    case 'Rejected':
    case 'Failed':
      return RED;
    case 'Cancelled':
      return SLATE;
    default:
      return SLATE;
  }
};

interface WithdrawalStatusBadgeProps {
  status: WithdrawalStatus;
}

/**
 * Pill showing the multi-stage withdrawal status (Pending Label Approval →
 * Pending Admin Approval → Processing → Paid, or Rejected) for the artist/label
 * payout views. Mirrors the admin StatusBadge look.
 */
export const WithdrawalStatusBadge: React.FC<WithdrawalStatusBadgeProps> = ({ status }) => {
  const s = styleFor(status);
  return (
    <HStack
      gap={1.5}
      bg={s.bg}
      color={s.color}
      fontSize="10px"
      fontWeight="semibold"
      px={2.5}
      py={1}
      borderRadius="full"
      display="inline-flex"
      w="fit-content"
    >
      <Box boxSize="6px" borderRadius="full" bg={s.dot} />
      <Text>{getWithdrawalStatusLabel(status)}</Text>
    </HStack>
  );
};

export default WithdrawalStatusBadge;
