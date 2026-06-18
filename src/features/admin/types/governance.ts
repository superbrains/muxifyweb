/* ------------------------------------------------------------------ *
 * Support & Governance admin types (Phase 3 Group 8). Mirror the backend
 * `/admin/governance/audit-trail` DTOs. Enum-ish fields serialise as strings;
 * payloads are camelCase. Reuses the generic {@link PagedResult} envelope.
 * `import type` only.
 * ------------------------------------------------------------------ */

import type { PagedResult } from './index';

/* ------------------------------------------------------------------ *
 * Audit Trail (GET /admin/governance/audit-trail)
 * ------------------------------------------------------------------ */

export interface AuditTrailEntryDto {
    id: string;
    actorUserId: string;
    actorName: string;
    action: string;
    targetType: string;
    targetId?: string | null;
    summary: string;
    metadataJson?: string | null;
    beforeJson?: string | null;
    afterJson?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: string;
}

export interface AuditTrailQuery {
    action?: string;
    actorId?: string;
    targetType?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
}

export type AuditTrailPage = PagedResult<AuditTrailEntryDto>;
