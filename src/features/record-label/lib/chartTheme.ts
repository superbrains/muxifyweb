import type { ApexOptions } from 'apexcharts';

/**
 * Shared ApexCharts base options for record-label charts. Keeps axis typography,
 * grid colour, and toolbar visibility consistent across the dashboard and analytics
 * page so the two surfaces visually align.
 */
export const baseChartTheme: ApexOptions = {
    chart: {
        toolbar: { show: false },
        fontFamily: 'Manrope, sans-serif',
    },
    xaxis: {
        labels: {
            style: { colors: '#7B91B0', fontFamily: 'Poppins', fontSize: '10px' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
    },
    yaxis: {
        labels: {
            style: { colors: '#7B91B0', fontFamily: 'Poppins', fontSize: '10px' },
        },
    },
    grid: { borderColor: '#F1F5F9', strokeDashArray: 3 },
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: {
        style: { fontFamily: 'Manrope, sans-serif', fontSize: '11px' },
    },
};
