/**
 * React Query key factory for the admin console. Mirrors `labelKeys` in the
 * record-label feature so cache invalidation reads consistently across hooks.
 */
export const adminKeys = {
    all: ['admin'] as const,
    overview: ['admin', 'overview'] as const,
    activity: <T>(range?: T) => ['admin', 'activity', range ?? {}] as const,
    verifications: <T>(query?: T) => ['admin', 'verifications', query ?? {}] as const,
    verification: (id: string) => ['admin', 'verification', id] as const,
    users: <T>(query?: T) => ['admin', 'users', query ?? {}] as const,
    user: (id: string) => ['admin', 'user', id] as const,
    tickets: <T>(query?: T) => ['admin', 'tickets', query ?? {}] as const,
    ticket: (id: string) => ['admin', 'ticket', id] as const,
    moderation: <T>(query?: T) => ['admin', 'moderation', query ?? {}] as const,
};
