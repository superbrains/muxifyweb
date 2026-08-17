import React from 'react';
import {
    Box,
    Button,
    HStack,
    Icon,
    SimpleGrid,
    Skeleton,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
    FiAlertTriangle,
    FiArrowRight,
    FiGift,
    FiInfo,
    FiLock,
    FiMusic,
    FiRadio,
    FiAward,
    FiPlusCircle,
} from 'react-icons/fi';
import { formatNaira } from '@shared/utils';
import { formatTrend } from '@/features/record-label/lib/format';
import { KpiStrip, StatusBadge, resolveStatusStyle } from '@shared/console';
import type { KpiItem } from '@shared/console';
import {
    useContributorEarningsSummary,
    useContributorEarningsHistory,
    useContributorProfile,
    useContributorPayoutMethods,
} from '../hooks/useContributor';
import { ContributorPageShell } from '../components/ContributorPageShell';
import { RaiseDisputeDialog } from '../components/RaiseDisputeDialog';
import type { ContributorEarningType } from '../services/contributorService';

const earningMeta: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    gift: { label: 'Gifts', icon: FiGift, color: '#E53E3E' },
    unlock: { label: 'Content unlocks', icon: FiLock, color: '#7C3AED' },
    streaming: { label: 'Streaming', icon: FiRadio, color: '#3B82F6' },
    bonus: { label: 'Bonuses', icon: FiAward, color: '#16A34A' },
    referral: { label: 'Referrals', icon: FiArrowRight, color: '#D97706' },
    split: { label: 'Splits', icon: FiMusic, color: '#0EA5E9' },
};

const earningTypeLabel = (type: ContributorEarningType | string): string =>
    earningMeta[type]?.label ?? String(type);

/* ----------------------------------------------------------------- Banner */

const Banner: React.FC<{
    tone: 'warning' | 'info';
    icon: React.ElementType;
    title: string;
    description: string;
    cta?: { label: string; onClick: () => void };
}> = ({ tone, icon, title, description, cta }) => {
    const palette =
        tone === 'warning'
            ? { bg: '#FFF9E6', border: '#F3E2A8', fg: '#92660C', icon: '#D97706' }
            : { bg: '#ECF7FF', border: '#CDE6FB', fg: '#1D4ED8', icon: '#3B82F6' };
    return (
        <HStack
            bg={palette.bg}
            border="1px solid"
            borderColor={palette.border}
            borderRadius="xl"
            px={4}
            py={3}
            gap={3}
            align="flex-start"
        >
            <Icon as={icon} color={palette.icon} boxSize={5} mt={0.5} flexShrink={0} />
            <VStack align="start" gap={0} flex={1} minW={0}>
                <Text fontSize="sm" fontWeight="semibold" color={palette.fg}>
                    {title}
                </Text>
                <Text fontSize="xs" color="gray.600">
                    {description}
                </Text>
            </VStack>
            {cta && (
                <Button
                    size="xs"
                    variant="outline"
                    borderColor={palette.border}
                    color={palette.fg}
                    bg="white"
                    fontSize="xs"
                    borderRadius="8px"
                    _hover={{ bg: 'white', borderColor: palette.icon }}
                    onClick={cta.onClick}
                    flexShrink={0}
                >
                    {cta.label}
                </Button>
            )}
        </HStack>
    );
};

/* -------------------------------------------------------------- Breakdown */

const BreakdownBar: React.FC<{ type: string; amount: number; total: number }> = ({
    type,
    amount,
    total,
}) => {
    const meta = earningMeta[type] ?? { label: type, icon: FiMusic, color: '#94A3B8' };
    const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
    return (
        <VStack align="stretch" gap={1.5}>
            <HStack justify="space-between">
                <HStack gap={2}>
                    <Box boxSize="8px" borderRadius="full" bg={meta.color} />
                    <Text fontSize="xs" color="gray.700" fontWeight="medium">
                        {meta.label}
                    </Text>
                </HStack>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                    {pct}%
                </Text>
            </HStack>
            <Box bg="gray.100" borderRadius="full" h="6px" overflow="hidden">
                <Box bg={meta.color} h="100%" w={`${pct}%`} borderRadius="full" transition="width 0.4s" />
            </Box>
        </VStack>
    );
};

/* ------------------------------------------------------------------ Page */

const ContributorDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const summaryQuery = useContributorEarningsSummary();
    const historyQuery = useContributorEarningsHistory({ pageSize: 6 });
    const profileQuery = useContributorProfile();
    const methodsQuery = useContributorPayoutMethods();
    const [disputeOpen, setDisputeOpen] = React.useState(false);

    const summary = summaryQuery.data;
    const profile = profileQuery.data;
    const earnings = historyQuery.data?.earnings ?? [];
    const methods = methodsQuery.data?.payoutMethods ?? [];

    const displayName = profile?.displayName?.split(' ')[0] || 'there';
    const isVerified = profile?.verificationStatus === 'Verified';
    const held = summary?.heldForFrozenSplitsDisplay ?? 0;
    const isLabelManaged = summary?.isLabelManaged ?? false;

    const trend = summary
        ? formatTrend(summary.earningsThisMonth ?? 0, summary.earningsLastMonth ?? 0)
        : undefined;

    const kpis: KpiItem[] = [
        {
            label: 'Available to withdraw',
            value: formatNaira(summary?.availableForWithdrawalDisplay ?? 0),
            tone: 'success',
        },
        {
            label: 'Total earned',
            value: formatNaira(summary?.totalEarnedDisplay ?? 0),
            trend,
            trendCaption: 'vs last month',
        },
        {
            label: 'Pending withdrawal',
            value: formatNaira(summary?.pendingWithdrawalDisplay ?? 0),
            tone: 'warning',
        },
        {
            label: 'Total withdrawn',
            value: formatNaira(summary?.totalWithdrawnDisplay ?? 0),
            tone: 'neutral',
        },
    ];

    const breakdown = summary
        ? [
              { type: 'gift', amount: summary.giftEarnings ?? 0 },
              { type: 'unlock', amount: summary.contentUnlockEarnings ?? 0 },
              { type: 'streaming', amount: summary.streamingEarnings ?? 0 },
              { type: 'bonus', amount: summary.bonusEarnings ?? 0 },
          ]
        : [];
    const breakdownTotal = breakdown.reduce((sum, b) => sum + b.amount, 0);

    const loading = summaryQuery.isLoading || profileQuery.isLoading;

    return (
        <ContributorPageShell
            title={loading ? 'Dashboard' : `Welcome back, ${displayName}`}
            subtitle="Your earnings, payouts and account status at a glance."
            actions={
                <>
                    <Button
                        size="sm"
                        variant="outline"
                        borderColor="gray.200"
                        color="gray.700"
                        fontSize="xs"
                        borderRadius="10px"
                        _hover={{ bg: 'gray.50' }}
                        onClick={() => setDisputeOpen(true)}
                    >
                        Raise a dispute
                    </Button>
                    <Button
                        size="sm"
                        bg="primary.500"
                        color="white"
                        fontSize="xs"
                        borderRadius="10px"
                        _hover={{ bg: 'primary.600' }}
                        onClick={() => navigate('/contributor/payouts')}
                    >
                        Request payout
                    </Button>
                </>
            }
        >
            {/* Status alerts */}
            {!loading && !isVerified && (
                <Banner
                    tone="warning"
                    icon={FiAlertTriangle}
                    title="Verify your identity to unlock payouts"
                    description={
                        profile?.verificationStatus === 'Pending'
                            ? 'Your verification is under review. You can request payouts once it is approved.'
                            : 'You need a verified account before you can withdraw your earnings.'
                    }
                    cta={{ label: 'Go to profile', onClick: () => navigate('/contributor/profile') }}
                />
            )}
            {!loading && held > 0 && (
                <Banner
                    tone="info"
                    icon={FiInfo}
                    title={`${formatNaira(held)} is temporarily held`}
                    description="Some of the splits you earn from are under review. This amount is released automatically once they're cleared."
                    cta={{ label: 'View splits', onClick: () => navigate('/contributor/splits') }}
                />
            )}
            {!loading && isLabelManaged && (
                <Banner
                    tone="info"
                    icon={FiInfo}
                    title="Your payouts are managed by your record label"
                    description="You can track everything here; your label triggers the actual payouts on your behalf."
                />
            )}

            {/* KPI strip */}
            {loading ? (
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
                    {[0, 1, 2, 3].map((i) => (
                        <Skeleton key={i} height="92px" borderRadius="xl" />
                    ))}
                </SimpleGrid>
            ) : (
                <KpiStrip items={kpis} columns={{ base: 2, md: 4, xl: 4 }} />
            )}

            {/* Breakdown + account status */}
            <SimpleGrid columns={{ base: 1, lg: 3 }} gap={4}>
                <Box
                    gridColumn={{ lg: 'span 2' }}
                    bg="white"
                    border="1px solid"
                    borderColor="gray.100"
                    borderRadius="xl"
                    p={5}
                >
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                        Where your earnings come from
                    </Text>
                    {loading ? (
                        <VStack gap={4} align="stretch">
                            {[0, 1, 2, 3].map((i) => (
                                <Skeleton key={i} height="20px" borderRadius="6px" />
                            ))}
                        </VStack>
                    ) : breakdownTotal === 0 ? (
                        <Text fontSize="xs" color="gray.500" py={6} textAlign="center">
                            Your earnings breakdown appears here once you start earning.
                        </Text>
                    ) : (
                        <VStack gap={4} align="stretch">
                            {breakdown.map((b) => (
                                <BreakdownBar
                                    key={b.type}
                                    type={b.type}
                                    amount={b.amount}
                                    total={breakdownTotal}
                                />
                            ))}
                        </VStack>
                    )}
                </Box>

                <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                        Account status
                    </Text>
                    <VStack gap={3.5} align="stretch">
                        <HStack justify="space-between">
                            <Text fontSize="xs" color="gray.600">
                                Verification
                            </Text>
                            {loading ? (
                                <Skeleton height="18px" width="64px" borderRadius="full" />
                            ) : (
                                <StatusBadge status={profile?.verificationStatus} />
                            )}
                        </HStack>
                        <HStack justify="space-between">
                            <Text fontSize="xs" color="gray.600">
                                Payout account
                            </Text>
                            {methodsQuery.isLoading ? (
                                <Skeleton height="18px" width="64px" borderRadius="full" />
                            ) : (
                                <StatusBadge
                                    style={resolveStatusStyle(
                                        methods.length > 0 ? 'active' : 'notsubmitted',
                                        methods.length > 0 ? 'Linked' : 'None',
                                    )}
                                />
                            )}
                        </HStack>
                        <HStack justify="space-between">
                            <Text fontSize="xs" color="gray.600">
                                Payouts
                            </Text>
                            <Text fontSize="xs" fontWeight="medium" color="gray.800">
                                {isLabelManaged ? 'Label-managed' : 'Self-service'}
                            </Text>
                        </HStack>

                        <Box borderTop="1px solid" borderColor="gray.100" pt={3} mt={1}>
                            <Button
                                w="full"
                                size="sm"
                                variant="outline"
                                borderColor="gray.200"
                                color="gray.700"
                                fontSize="xs"
                                borderRadius="10px"
                                _hover={{ bg: 'gray.50' }}
                                onClick={() => navigate('/contributor/payout-accounts')}
                            >
                                Manage payout accounts
                            </Button>
                        </Box>
                    </VStack>
                </Box>
            </SimpleGrid>

            {/* Recent earnings */}
            <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" overflow="hidden">
                <HStack justify="space-between" px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        Recent earnings
                    </Text>
                    <Button
                        size="xs"
                        variant="ghost"
                        color="primary.500"
                        fontSize="xs"
                        _hover={{ bg: 'primary.50' }}
                        onClick={() => navigate('/contributor/earnings')}
                    >
                        View all <Icon as={FiArrowRight} ml={1} />
                    </Button>
                </HStack>
                {historyQuery.isLoading ? (
                    <VStack gap={0} align="stretch" p={4}>
                        {[0, 1, 2, 3].map((i) => (
                            <Skeleton key={i} height="40px" borderRadius="8px" mb={2} />
                        ))}
                    </VStack>
                ) : earnings.length === 0 ? (
                    <VStack gap={1} py={12}>
                        <Icon as={FiPlusCircle} boxSize={7} color="gray.300" />
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">
                            No earnings yet
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            Your contributor earnings will appear here once they accrue.
                        </Text>
                    </VStack>
                ) : (
                    <VStack gap={0} align="stretch">
                        {earnings.map((e) => {
                            const meta = earningMeta[e.type] ?? {
                                label: e.type,
                                icon: FiMusic,
                                color: '#94A3B8',
                            };
                            return (
                                <HStack
                                    key={e.id}
                                    justify="space-between"
                                    px={5}
                                    py={3.5}
                                    borderBottom="1px solid"
                                    borderColor="gray.50"
                                    _hover={{ bg: 'gray.50' }}
                                >
                                    <HStack gap={3} minW={0}>
                                        <Box
                                            boxSize="34px"
                                            borderRadius="10px"
                                            bg={`${meta.color}1A`}
                                            color={meta.color}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            flexShrink={0}
                                        >
                                            <Icon as={meta.icon} boxSize={4} />
                                        </Box>
                                        <VStack align="start" gap={0} minW={0}>
                                            <Text fontSize="xs" fontWeight="medium" color="gray.900" lineClamp={1}>
                                                {e.description || earningTypeLabel(e.type)}
                                            </Text>
                                            <Text fontSize="11px" color="gray.500">
                                                {earningTypeLabel(e.type)} ·{' '}
                                                {new Date(e.earnedAt).toLocaleDateString()}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" flexShrink={0}>
                                        {formatNaira(e.netAmountDisplay)}
                                    </Text>
                                </HStack>
                            );
                        })}
                    </VStack>
                )}
            </Box>

            <RaiseDisputeDialog isOpen={disputeOpen} onClose={() => setDisputeOpen(false)} />
        </ContributorPageShell>
    );
};

export default ContributorDashboardPage;
