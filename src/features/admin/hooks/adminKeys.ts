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
    // Admin Management
    myPermissions: ['admin', 'me', 'permissions'] as const,
    permissionCatalog: ['admin', 'management', 'permissions'] as const,
    roles: ['admin', 'management', 'roles'] as const,
    admins: ['admin', 'management', 'admins'] as const,
    adminDetail: (id: string) => ['admin', 'management', 'admin', id] as const,
    invitations: ['admin', 'management', 'invitations'] as const,
    audit: <T>(query?: T) => ['admin', 'management', 'audit', query ?? {}] as const,
    // Finance
    finance: {
        root: ['admin', 'finance'] as const,
        overview: (range: unknown) => ['admin', 'finance', 'overview', range] as const,
        transactions: (query: unknown) => ['admin', 'finance', 'transactions', query] as const,
        transaction: (id: string) => ['admin', 'finance', 'transaction', id] as const,
        fanLedger: (userId: string, query: unknown) => ['admin', 'finance', 'fan', userId, query] as const,
        earnings: (query: unknown) => ['admin', 'finance', 'earnings', query] as const,
        creatorEarnings: (artistId: string, query: unknown) =>
            ['admin', 'finance', 'creator', artistId, 'earnings', query] as const,
        creatorSplits: (artistId: string) => ['admin', 'finance', 'creator', artistId, 'splits'] as const,
        gifts: (query: unknown) => ['admin', 'finance', 'gifts', query] as const,
        unlocks: (query: unknown) => ['admin', 'finance', 'unlocks', query] as const,
        withdrawals: (query: unknown) => ['admin', 'finance', 'withdrawals', query] as const,
        withdrawal: (id: string) => ['admin', 'finance', 'withdrawal', id] as const,
        payouts: (query: unknown) => ['admin', 'finance', 'payouts', query] as const,
        payout: (id: string) => ['admin', 'finance', 'payout', id] as const,
        reconciliation: (range: unknown) => ['admin', 'finance', 'reconciliation', range] as const,
    },
};
