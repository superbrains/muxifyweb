import React from 'react';
import { AdminPageLayout, AdminError, AdminLoading, KpiStrip } from '../../components/ui';
import type { KpiItem } from '../../components/ui';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { formatCount, formatMinorAmount, isoDaysAgo, todayIso } from '../../lib/format';
import { useBusinessAnalytics } from '../../hooks/usePlatform';
import type { DateWindow } from '../../types/platform';
import { DateWindowBar } from './DateWindowBar';

/** Tower 1 — top-line business KPIs over a from/to window. */
const BusinessAnalyticsPage: React.FC = () => {
    const [range, setRange] = React.useState<DateWindow>({ from: isoDaysAgo(30), to: todayIso() });
    const { data, isLoading, error } = useBusinessAnalytics(range);

    const items: KpiItem[] = data
        ? [
              { label: 'Total Revenue', value: formatMinorAmount(data.totalRevenueMinor, data.currency) },
              { label: 'Platform Fees', value: formatMinorAmount(data.platformFeesMinor, data.currency) },
              { label: 'Net Revenue', value: formatMinorAmount(data.netRevenueMinor, data.currency) },
              { label: 'Gross Coin Volume', value: formatCount(data.grossCoinVolume) },
              { label: 'Total Users', value: formatCount(data.totalUsers) },
              { label: 'Paying Users', value: formatCount(data.payingUsers) },
              { label: 'New Signups', value: formatCount(data.newSignups) },
              { label: 'ARPU', value: formatMinorAmount(data.arpuMinor, data.currency) },
          ]
        : [];

    return (
        <AdminPageLayout
            title="Business Analytics"
            subtitle="Top-line revenue, fees and user economics across the platform"
            breadcrumbs={[{ label: 'Platform' }, { label: 'Business Analytics' }]}
        >
            <DateWindowBar range={range} onChange={setRange} />

            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message={getApiErrorMessage(error, 'Could not load business analytics.')} />
            ) : (
                <KpiStrip items={items} columns={{ base: 2, md: 3, xl: 4 }} />
            )}
        </AdminPageLayout>
    );
};

export default BusinessAnalyticsPage;
