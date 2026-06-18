import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { governanceService } from '../services/governanceService';
import { adminKeys } from './adminKeys';
import type { AuditTrailQuery } from '../types/governance';

/* --------------------------------- Queries -------------------------------- */

export const useAuditTrail = (query: AuditTrailQuery) =>
    useQuery({
        queryKey: adminKeys.governance.auditTrail(query),
        queryFn: () => governanceService.auditTrail(query),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });
