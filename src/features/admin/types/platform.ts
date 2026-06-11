// Types mirroring the backend Platform analytics / notifications / settings DTOs
// (/api/v1/admin/analytics/*, /api/v1/admin/notifications/*, /api/v1/admin/settings).

import type { PagedResult } from './finance';

export type { PagedResult };

/** Shared from/to window for the analytics endpoints. */
export interface DateWindow {
    from?: string;
    to?: string;
}

export type Granularity = 'day' | 'week' | 'month';

/* --------------------------------- Business -------------------------------- */

/** One slice of the revenue mix, keyed by backend EarningType name. */
export interface RevenueMixSlice {
    type: string;
    amountMinor: number;
    coins: number;
}

/** Raw aggregates for the immediately-preceding equal-length window. */
export interface BusinessSnapshot {
    totalRevenueMinor: number;
    platformFeesMinor: number;
    netRevenueMinor: number;
    grossCoinVolume: number;
    payingUsers: number;
    newSignups: number;
    purchasesCount: number;
    arppuMinor: number;
    coinsPurchased: number;
    coinsSpent: number;
    payoutsMinor: number;
}

export interface BusinessAnalytics {
    currency: string;
    totalRevenueMinor: number;
    platformFeesMinor: number;
    netRevenueMinor: number;
    grossCoinVolume: number;
    totalUsers: number;
    payingUsers: number;
    newSignups: number;
    /** Revenue / total users. */
    arpuMinor: number;
    /** Revenue / paying users. */
    arppuMinor: number;
    purchasesCount: number;
    conversionPct: number;
    feeRatePct: number;
    coinsPurchased: number;
    coinsSpent: number;
    payoutsMinor: number;
    revenueMix: RevenueMixSlice[];
    /** Null unless both `from` and `to` were supplied. */
    previous?: BusinessSnapshot | null;
}

export interface BusinessSeriesPoint {
    date: string;
    revenueMinor: number;
    feesMinor: number;
    payoutsMinor: number;
    signups: number;
    payingUsers: number;
    coinsPurchased: number;
    coinsSpent: number;
}

export interface BusinessTimeseries {
    granularity: Granularity;
    series: BusinessSeriesPoint[];
}

export interface TopArtist {
    artistId: string;
    name: string;
    avatarUrl?: string | null;
    grossMinor: number;
    netMinor: number;
    coins: number;
    earningCount: number;
}

export interface TopContent {
    trackId: string;
    title: string;
    artistName: string;
    coins: number;
    amountMinor: number;
    giftCoins: number;
    unlockCoins: number;
}

export interface TopSpender {
    userId: string;
    name: string;
    avatarUrl?: string | null;
    coinsSpent: number;
    giftCoins: number;
    unlockCoins: number;
    txnCount: number;
}

export interface BusinessTop {
    topArtists: TopArtist[];
    topContent: TopContent[];
    topSpenders: TopSpender[];
}

/* ---------------------------------- Growth --------------------------------- */

export interface GrowthSignupPoint {
    date: string;
    signups: number;
    /** Users existing before the window + running signup sum. */
    cumulativeUsers: number;
    /** Index-aligned previous-window bucket; null when the window is open-ended. */
    previousSignups?: number | null;
}

export interface GrowthRoleBreakdown {
    role: string;
    count: number;
}

export interface GrowthTotals {
    totalUsers: number;
    newSignups: number;
    signupsPerDay: number;
    peakDate?: string | null;
    peakSignups: number;
    prevNewSignups?: number | null;
}

export interface GrowthCountryRow {
    country: string;
    count: number;
}

export interface GrowthAnalytics {
    series: GrowthSignupPoint[];
    byRole: GrowthRoleBreakdown[];
    trendPct: number;
    totals: GrowthTotals;
    byCountry: GrowthCountryRow[];
}

export interface GrowthEngagementPoint {
    date: string;
    activeUsers: number;
    rollingWau: number;
    rollingMau: number;
}

export interface PlatformActiveRow {
    platform: string;
    activeUsers: number;
}

export interface GrowthEngagement {
    series: GrowthEngagementPoint[];
    currentDau: number;
    currentWau: number;
    currentMau: number;
    /** DAU / MAU * 100, 1dp. */
    stickinessPct: number;
    activeUsers: number;
    totalPlays: number;
    playsPerActiveUser: number;
    byPlatform: PlatformActiveRow[];
}

export interface RetentionCohortRow {
    /** Monday week-start yyyy-MM-dd. */
    cohortStart: string;
    cohortSize: number;
    /** cells[k] = % of the cohort active in week k after signup; null = not reached yet. */
    cells: (number | null)[];
}

export interface GrowthRetention {
    weeks: number;
    cohorts: RetentionCohortRow[];
}

export interface GrowthFunnel {
    signedUp: number;
    emailVerified: number;
    onboarded: number;
    activated: number;
    converted: number;
}

/* --------------------------------- Revenue --------------------------------- */

export interface RevenueTypeBreakdown {
    type: string;
    amountMinor: number;
}

export interface RevenueSeriesPoint {
    date: string;
    amountMinor: number;
}

export interface RevenueOverview {
    currency: string;
    grossFundingMinor: number;
    feesMinor: number;
    payoutsMinor: number;
    netMinor: number;
    byType: RevenueTypeBreakdown[];
    series: RevenueSeriesPoint[];
}

/* -------------------------------- Geography -------------------------------- */

export interface GeographyRow {
    country: string;
    users: number;
    revenueMinor: number;
}

export interface GeographyAnalytics {
    byCountry: GeographyRow[];
}

/* ----------------------------------- Risk ---------------------------------- */

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'Low' | 'Elevated' | 'High' | 'Critical';

/** One exposure area on the risk register, deep-linking to its queue. */
export interface RiskCategory {
    key: string;
    label: string;
    description: string;
    openCount: number;
    /** Urgent subset of openCount. */
    criticalCount: number;
    severity: RiskSeverity;
    /** Admin route this row drills into. */
    route: string;
}

/** One day of newly-raised risk signals. */
export interface RiskTrendPoint {
    date: string;
    contentReports: number;
    disputes: number;
    duplicates: number;
}

/** A labelled count slice for the risk breakdown donuts. */
export interface RiskBreakdownSlice {
    label: string;
    count: number;
}

export interface RiskCompliance {
    // Headline open-exposure counts
    pendingVerifications: number;
    flaggedContent: number;
    failedPayouts: number;
    suspendedUsers: number;
    pendingWithdrawals: number;
    pendingFinanceApprovals: number;
    openDisputes: number;
    escalatedDisputes: number;
    duplicateMatchesPending: number;
    highConfidenceDuplicates: number;

    // Composite posture
    totalOpenItems: number;
    criticalOpenItems: number;
    /** 0–100 weighted gauge. */
    riskScore: number;
    riskLevel: RiskLevel;

    // Drill-down data
    categories: RiskCategory[];
    trend: RiskTrendPoint[];
    reportsByType: RiskBreakdownSlice[];
    disputesByStatus: RiskBreakdownSlice[];
    generatedAt: string;
}

/* ------------------------------- Today's queue ----------------------------- */

/** SLA verdict for a work queue, derived from the oldest waiting item. */
export type QueueSlaStatus = 'clear' | 'ontrack' | 'atrisk' | 'breached';

/** Counts of a queue's open items bucketed by age. */
export interface QueueAging {
    fresh: number; // < 24h
    day: number; // 24–72h
    week: number; // 72–168h
    stale: number; // > 168h
}

/** One day of newly-arrived work items across all queues. */
export interface TodayQueueTrendPoint {
    date: string;
    added: number;
}

/** A single work queue on the Today's Queue register. */
export interface TodayQueueItem {
    key: string;
    label: string;
    description: string;
    /** Admin route this row drills into. */
    route: string;
    openCount: number;
    /** Urgent subset of openCount. */
    criticalCount: number;
    addedToday: number;
    oldestItemAgeHours: number;
    slaTargetHours: number;
    slaStatus: QueueSlaStatus;
    aging: QueueAging;
}

export interface TodayQueue {
    // Headline summary
    totalOpen: number;
    addedToday: number;
    atRiskCount: number;
    breachCount: number;
    criticalCount: number;
    oldestWaitingHours: number;
    oldestQueueLabel: string;

    // Drill-down data
    queues: TodayQueueItem[];
    /** Platform-wide backlog split by age (reuses the breakdown-slice shape). */
    aging: RiskBreakdownSlice[];
    trend: TodayQueueTrendPoint[];
    generatedAt: string;
}

/* ------------------------------- Notifications ----------------------------- */

export interface Broadcast {
    id: string;
    title: string;
    message: string;
    type: string;
    targetRole?: string | null;
    recipientCount: number;
    createdAt: string;
}

export interface CreateBroadcastPayload {
    title: string;
    message: string;
    type: string;
    targetRole?: string | null;
}

export interface BroadcastQuery {
    page: number;
    pageSize: number;
}

export interface DeliveryStats {
    total: number;
    byChannel: {
        inApp: number;
        push: number;
        email: number;
    };
    byStatus: {
        pending: number;
        sent: number;
        failed: number;
        read: number;
    };
    byType: { type: string; count: number }[];
}

/* --------------------------------- Settings -------------------------------- */

export interface PlatformSetting {
    key: string;
    value: string;
    category: string;
    description: string;
    valueType: string;
}
