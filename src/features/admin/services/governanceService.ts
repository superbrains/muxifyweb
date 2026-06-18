import { api } from '@shared/services/api';
import type { AuditTrailPage, AuditTrailQuery } from '../types/governance';

/**
 * Typed client for the admin Support & Governance audit trail
 * (`GET /admin/governance/audit-trail`). Mirrors `advertisingService` /
 * `financeService` style.
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
};
