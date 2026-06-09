import type { PagedResult } from './index';

/* ------------------------------------------------------------------ *
 * Security Activity (Towers 4 + 29)
 *
 * Typed contract for `GET/POST /api/v1/admin/security/*`. The console NEVER
 * requests or renders raw session/refresh tokens — only device, IP and
 * last-used metadata are surfaced.
 * ------------------------------------------------------------------ */

/** A single row in the security activity list. */
export interface SecurityActivityRowDto {
    userId: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastLoginAt?: string;
    activeSessionCount: number;
}

export interface SecurityActivityQuery {
    search?: string;
    page?: number;
    pageSize?: number;
}

export type SecurityActivityPageDto = PagedResult<SecurityActivityRowDto>;

/** Security summary for a single user (drives the detail drawer KPIs). */
export interface SecurityUserDetailDto {
    userId: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastLoginAt?: string;
    suspendedAt?: string;
    suspendedReason?: string;
    isEmailVerified: boolean;
    hasPin: boolean;
    activeSessionCount: number;
    deviceCount: number;
}

/** An active session — metadata only, never the token itself. */
export interface SecuritySessionDto {
    id: string;
    deviceInfo?: string;
    ipAddress?: string;
    createdAt?: string;
    expiresAt?: string;
}

/** A known device for the user. */
export interface SecurityDeviceDto {
    id: string;
    platform?: string;
    isActive: boolean;
    lastUsedAt?: string;
}
