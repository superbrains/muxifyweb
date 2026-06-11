import React from 'react';
import { Button, Grid, GridItem, HStack } from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';
import { AdminPageLayout, AdminError, AdminLoading, KpiStrip } from '../../components/ui';
import type { KpiItem } from '../../components/ui';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { formatCount, todayIso } from '../../lib/format';
import { exportCsv } from '../../lib/exportCsv';
import type { CsvColumn } from '../../lib/exportCsv';
import { ExportButton } from '../../components/finance/FinanceFilters';
import { RiskBreakdownDonut } from '../../components/platform/risk/RiskBreakdownDonut';
import { QueueInflowChart } from '../../components/platform/queue/QueueInflowChart';
import { QueueRegisterTable } from '../../components/platform/queue/QueueRegisterTable';
import { AGING_COLORS, formatAge } from '../../components/platform/queue/queueFormat';
import { useTodayQueue } from '../../hooks/usePlatform';
import type { TodayQueueItem } from '../../types/platform';

const CSV_COLUMNS: CsvColumn<TodayQueueItem>[] = [
    { header: 'Queue', value: (q) => q.label },
    { header: 'SLA status', value: (q) => q.slaStatus },
    { header: 'Open', value: (q) => q.openCount },
    { header: 'Critical', value: (q) => q.criticalCount },
    { header: 'Added today', value: (q) => q.addedToday },
    { header: 'Oldest waiting (h)', value: (q) => q.oldestItemAgeHours },
    { header: 'SLA target (h)', value: (q) => q.slaTargetHours },
    { header: 'Queue route', value: (q) => q.route },
];

/**
 * Tower — the operational "do this today" command center. A summary strip
 * (total open, what arrived today, SLA breaches/at-risk, the oldest waiting item
 * and critical count) sits over the work-arrival trend and a backlog-aging donut,
 * with a full queue register that drills into every working area, ordered by SLA
 * urgency. Read-only aggregate from `GET /admin/analytics/today-queue`.
 */
const TodayQueuePage: React.FC = () => {
    const { data, isLoading, error, refetch, isFetching } = useTodayQueue();

    const kpis: KpiItem[] = data
        ? [
              {
                  label: 'Total Open',
                  value: formatCount(data.totalOpen),
                  sub: 'Items awaiting an action',
                  bg: '#ECF7FF',
                  iconColor: '#3B82F6',
              },
              {
                  label: 'Added Today',
                  value: formatCount(data.addedToday),
                  sub: 'Arrived since midnight UTC',
                  bg: '#F6F1FF',
                  iconColor: '#7C3AED',
              },
              {
                  label: 'SLA Breaches',
                  value: formatCount(data.breachCount),
                  sub: data.breachCount > 0 ? 'Queues past target' : 'All within target',
                  bg: '#FEEEF2',
                  iconColor: '#E11D48',
              },
              {
                  label: 'At Risk',
                  value: formatCount(data.atRiskCount),
                  sub: 'Queues nearing target',
                  bg: '#FFF8E8',
                  iconColor: '#D97706',
              },
              {
                  label: 'Oldest Waiting',
                  value: formatAge(data.oldestWaitingHours),
                  sub: data.oldestQueueLabel || 'Nothing waiting',
                  bg: '#FFF5F6',
                  iconColor: 'primary.500',
              },
              {
                  label: 'Critical',
                  value: formatCount(data.criticalCount),
                  sub: 'Urgent items in queue',
                  bg: '#FEF2F2',
                  iconColor: '#E53E3E',
              },
          ]
        : [];

    const handleExport = () => {
        if (!data) return;
        exportCsv(`today-queue-${todayIso()}`, CSV_COLUMNS, data.queues);
    };

    return (
        <AdminPageLayout
            title="Today's Queue"
            subtitle="Live operational backlog — what needs an action today, how old it is, and where it's breaching SLA"
            breadcrumbs={[{ label: 'Platform' }, { label: "Today's Queue" }]}
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
                <AdminError error={error} message={getApiErrorMessage(error, "Could not load today's queue.")} />
            ) : data ? (
                <>
                    <KpiStrip items={kpis} columns={{ base: 2, md: 3, xl: 6 }} />

                    <Grid templateColumns={{ base: '1fr', xl: '1.7fr 1fr' }} gap={3}>
                        <GridItem minW={0}>
                            <QueueInflowChart trend={data.trend} loading={isFetching && !data.trend.length} />
                        </GridItem>
                        <GridItem minW={0}>
                            <RiskBreakdownDonut
                                title="Backlog by age"
                                subtitle="How long open items have been waiting"
                                slices={data.aging}
                                unit="items"
                                colors={AGING_COLORS}
                                loading={false}
                                emptyText="Nothing is waiting in any queue."
                            />
                        </GridItem>
                    </Grid>

                    <QueueRegisterTable queues={data.queues} />
                </>
            ) : null}
        </AdminPageLayout>
    );
};

export default TodayQueuePage;
