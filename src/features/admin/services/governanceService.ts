import { api } from '@shared/services/api';
import type {
    AuditTrailPage,
    AuditTrailQuery,
    ComplianceSummaryDto,
    LabelDetailDto,
    LabelListPage,
    LabelOpsQuery,
    NudgeRequest,
    StuckUserPage,
    StuckUserQuery,
} from '../types/governance';

/**
 * Typed clients for the admin Support & Governance suite (Phase 3 Group 8).
 * `governanceService` → `/admin/governance/*` (audit trail + compliance),
 * `labelOpsService` → `/admin/labels/*`, `onboardingService` →
 * `/admin/onboarding/*`. Mirrors `advertisingService` / `financeService` style.
 */

/** Strips undefined/null/empty params so axios doesn't serialise `?from=undefined`. */
const clean = (query: object): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') out[k] = v;
    });
    return out;
};

export const governanceService = {
    auditTrail: async (query: AuditTrailQuery): Promise<AuditTrailPage> => {
        const { data } = await api.get<AuditTrailPage>('/admin/governance/audit-trail', {
            params: clean(query),
        });
        return data;
    },
    compliance: async (): Promise<ComplianceSummaryDto> => {
        const { data } = await api.get<ComplianceSummaryDto>('/admin/governance/compliance');
        return data;
    },
};

export const labelOpsService = {
    list: async (query: LabelOpsQuery): Promise<LabelListPage> => {
        const { data } = await api.get<LabelListPage>('/admin/labels', {
            params: clean(query),
        });
        return data;
    },
    detail: async (userId: string): Promise<LabelDetailDto> => {
        const { data } = await api.get<LabelDetailDto>(`/admin/labels/${userId}`);
        return data;
    },
};

export const onboardingService = {
    stuck: async (query: StuckUserQuery): Promise<StuckUserPage> => {
        const { data } = await api.get<StuckUserPage>('/admin/onboarding/stuck', {
            params: clean(query),
        });
        return data;
    },
    nudge: async (userId: string, payload: NudgeRequest): Promise<void> => {
        await api.post(`/admin/onboarding/${userId}/nudge`, payload);
    },
};
