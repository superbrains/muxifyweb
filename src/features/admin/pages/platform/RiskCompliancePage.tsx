import React from 'react';
import { Button, Grid, GridItem, HStack, VStack } from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';
import { AdminPageLayout, AdminError, AdminLoading } from '@shared/console';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { todayIso } from '@shared/console/lib/format';
import { exportCsv } from '@shared/console/lib/exportCsv';
import type { CsvColumn } from '@shared/console/lib/exportCsv';
import { ExportButton } from '../../components/finance/FinanceFilters';
import { useRiskCompliance } from '../../hooks/usePlatform';
import type { RiskCategory } from '../../types/platform';
import { RiskPostureHero } from '../../components/platform/risk/RiskPostureHero';
import { RiskSignalsTrendChart } from '../../components/platform/risk/RiskSignalsTrendChart';
import { RiskBreakdownDonut } from '../../components/platform/risk/RiskBreakdownDonut';
import { RiskRegisterTable } from '../../components/platform/risk/RiskRegisterTable';

const REPORT_COLORS = ['#D97706', '#E11D48', '#7C3AED', '#3B82F6'];
const DISPUTE_COLORS = ['#3B82F6', '#D97706', '#E11D48', '#0EA5E9', '#94A3B8'];

const CSV_COLUMNS: CsvColumn<RiskCategory>[] = [
    { header: 'Exposure area', value: (r) => r.label },
    { header: 'Severity', value: (r) => r.severity },
    { header: 'Open items', value: (r) => r.openCount },
    { header: 'Critical items', value: (r) => r.criticalCount },
    { header: 'Queue route', value: (r) => r.route },
];

/**
 * Tower 31 — the platform Risk & Compliance command center. A posture hero
 * (composite score + level + critical signals) over the risk-signal inflow
 * trend, report/dispute breakdowns, and a full risk register that drills into
 * every working queue. Read-only aggregate from `GET /admin/analytics/risk`.
 */
const RiskCompliancePage: React.FC = () => {
    const { data, isLoading, error, refetch, isFetching } = useRiskCompliance();

    const handleExport = () => {
        if (!data) return;
        exportCsv(`risk-register-${todayIso()}`, CSV_COLUMNS, data.categories);
    };

    return (
        <AdminPageLayout
            title="Risk & Compliance"
            subtitle="Live exposure across verifications, moderation, copyright, disputes, payouts and approvals"
            breadcrumbs={[{ label: 'Platform' }, { label: 'Risk & Compliance' }]}
            actions={
                <HStack gap={2}>
                    <Button
                        size="sm"
                        variant="outline"
                        h="34px"
                        fontSize="12px"
                        borderColor="gray.200"
                        color="gray.600"
                        borderRadius="10px"
                        onClick={() => refetch()}
                        loading={isFetching}
                        _hover={{ bg: 'gray.50' }}
                    >
                        <FiRefreshCw size={13} />
                        Refresh
                    </Button>
                    <ExportButton onClick={handleExport} disabled={!data} />
                </HStack>
            }
        >
            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message={getApiErrorMessage(error, 'Could not load the risk snapshot.')} />
            ) : data ? (
                <VStack align="stretch" gap={3}>
                    <RiskPostureHero data={data} />

                    <Grid templateColumns={{ base: '1fr', xl: '1.7fr 1fr' }} gap={3}>
                        <GridItem minW={0}>
                            <RiskSignalsTrendChart trend={data.trend} loading={isFetching && !data.trend.length} />
                        </GridItem>
                        <GridItem minW={0}>
                            <RiskBreakdownDonut
                                title="Flagged content by type"
                                subtitle="What kind of content is awaiting moderation"
                                slices={data.reportsByType}
                                unit="reports"
                                colors={REPORT_COLORS}
                                loading={false}
                                emptyText="No content is pending moderation."
                            />
                        </GridItem>
                    </Grid>

                    <Grid templateColumns={{ base: '1fr', xl: '1.7fr 1fr' }} gap={3}>
                        <GridItem minW={0}>
                            <RiskRegisterTable categories={data.categories} />
                        </GridItem>
                        <GridItem minW={0}>
                            <RiskBreakdownDonut
                                title="Open disputes by stage"
                                subtitle="Where refund and chargeback cases are stuck"
                                slices={data.disputesByStatus}
                                unit="disputes"
                                colors={DISPUTE_COLORS}
                                loading={false}
                                emptyText="No open dispute cases."
                            />
                        </GridItem>
                    </Grid>
                </VStack>
            ) : null}
        </AdminPageLayout>
    );
};

export default RiskCompliancePage;
