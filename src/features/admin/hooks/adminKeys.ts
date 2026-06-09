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
        payoutAccounts: (query: unknown) => ['admin', 'finance', 'payout-accounts', query] as const,
        payoutAudit: (query: unknown) => ['admin', 'finance', 'payout-audit', query] as const,
        reconciliation: (range: unknown) => ['admin', 'finance', 'reconciliation', range] as const,
        approvals: (query: unknown) => ['admin', 'finance', 'approvals', query] as const,
    },
    // Security Activity (Towers 4 + 29)
    security: {
        root: ['admin', 'security'] as const,
        activity: (query: unknown) => ['admin', 'security', 'activity', query] as const,
        user: (userId: string) => ['admin', 'security', 'user', userId] as const,
        sessions: (userId: string) => ['admin', 'security', 'user', userId, 'sessions'] as const,
        devices: (userId: string) => ['admin', 'security', 'user', userId, 'devices'] as const,
    },
    // Content suite (Towers 5/6/7/23/27/28)
    content: {
        root: ['admin', 'content'] as const,
        items: (query: unknown) => ['admin', 'content', 'items', query] as const,
        item: (kind: string, id: string) => ['admin', 'content', 'item', kind, id] as const,
        uploadSessions: (query: unknown) => ['admin', 'content', 'uploads', 'sessions', query] as const,
        processing: (query: unknown) => ['admin', 'content', 'uploads', 'processing', query] as const,
        matches: (query: unknown) => ['admin', 'content', 'duplicates', 'matches', query] as const,
        match: (id: string) => ['admin', 'content', 'duplicates', 'match', id] as const,
        lyrics: (query: unknown) => ['admin', 'content', 'lyrics', query] as const,
    },
    // Discovery (Towers — trending / charts / featured / overrides / gifting)
    discovery: {
        root: ['admin', 'discovery'] as const,
        trending: (query: unknown) => ['admin', 'discovery', 'trending', query] as const,
        topCharts: (query: unknown) => ['admin', 'discovery', 'top-charts', query] as const,
        hotReleases: (query: unknown) => ['admin', 'discovery', 'hot-releases', query] as const,
        newReleases: (query: unknown) => ['admin', 'discovery', 'new-releases', query] as const,
        mostGifted: (query: unknown) => ['admin', 'discovery', 'most-gifted', query] as const,
        topGivers: (query: unknown) => ['admin', 'discovery', 'top-givers', query] as const,
        homeFeed: ['admin', 'discovery', 'home-feed'] as const,
        overrides: (query: unknown) => ['admin', 'discovery', 'overrides', query] as const,
        featured: (query: unknown) => ['admin', 'discovery', 'featured', query] as const,
    },
    // Leaderboards (configs / exclusions / preview)
    leaderboards: {
        root: ['admin', 'leaderboards'] as const,
        configs: ['admin', 'leaderboards', 'configs'] as const,
        exclusions: (query: unknown) => ['admin', 'leaderboards', 'exclusions', query] as const,
        preview: (type: string, query: unknown) =>
            ['admin', 'leaderboards', 'preview', type, query] as const,
    },
    // Monetization (Phase 3 Group 5 — revenue / commission / royalties summaries)
    monetization: {
        root: ['admin', 'monetization'] as const,
        revenue: (range: unknown) => ['admin', 'monetization', 'revenue', range] as const,
        commission: (range: unknown) => ['admin', 'monetization', 'commission', range] as const,
        royalties: (range: unknown) => ['admin', 'monetization', 'royalties', range] as const,
    },
    // Royalty splits (per-track recipients / freeze / dispute / audit)
    royalties: {
        root: ['admin', 'royalties'] as const,
        tracks: (query: unknown) => ['admin', 'royalties', 'tracks', query] as const,
        track: (id: string) => ['admin', 'royalties', 'track', id] as const,
        audit: (id: string) => ['admin', 'royalties', 'track', id, 'audit'] as const,
    },
    // Sponsorships (CRUD + lifecycle)
    sponsorships: {
        root: ['admin', 'sponsorships'] as const,
        list: (query: unknown) => ['admin', 'sponsorships', 'list', query] as const,
        detail: (id: string) => ['admin', 'sponsorships', 'detail', id] as const,
    },
    // Refunds & disputes (case workflow)
    disputes: {
        root: ['admin', 'disputes'] as const,
        list: (query: unknown) => ['admin', 'disputes', 'list', query] as const,
        detail: (id: string) => ['admin', 'disputes', 'detail', id] as const,
    },
    // Advertising (Phase 3 Group 7 — Towers 17 & 18)
    advertising: {
        root: ['admin', 'advertising'] as const,
        overview: ['admin', 'advertising', 'overview'] as const,
        advertisers: (query: unknown) => ['admin', 'advertising', 'advertisers', query] as const,
        advertiser: (id: string) => ['admin', 'advertising', 'advertiser', id] as const,
        campaigns: (query: unknown) => ['admin', 'advertising', 'campaigns', query] as const,
        campaign: (id: string) => ['admin', 'advertising', 'campaign', id] as const,
        creatives: (query: unknown) => ['admin', 'advertising', 'creatives', query] as const,
        creativeReview: (query: unknown) =>
            ['admin', 'advertising', 'creative-review', query] as const,
        targetingReview: (query: unknown) =>
            ['admin', 'advertising', 'targeting-review', query] as const,
        placements: ['admin', 'advertising', 'placements'] as const,
        placementInventory: () => ['admin', 'advertising', 'placement-inventory'] as const,
        invoices: (query: unknown) => ['admin', 'advertising', 'invoices', query] as const,
        invoice: (id: string) => ['admin', 'advertising', 'invoice', id] as const,
        wallets: (query: unknown) => ['admin', 'advertising', 'wallets', query] as const,
        walletTransactions: (userId: string, query: unknown) =>
            ['admin', 'advertising', 'wallet', userId, 'transactions', query] as const,
        billing: (query: unknown) => ['admin', 'advertising', 'billing', query] as const,
        analytics: (query: unknown) => ['admin', 'advertising', 'analytics', query] as const,
        moderation: (query: unknown) => ['admin', 'advertising', 'moderation', query] as const,
    },
    // Support & Governance (Phase 3 Group 8)
    governance: {
        root: ['admin', 'governance'] as const,
        auditTrail: (query: unknown) => ['admin', 'governance', 'audit-trail', query] as const,
        compliance: ['admin', 'governance', 'compliance'] as const,
    },
    labelOps: {
        root: ['admin', 'labels'] as const,
        list: (query: unknown) => ['admin', 'labels', 'list', query] as const,
        detail: (userId: string) => ['admin', 'labels', 'detail', userId] as const,
    },
    onboarding: {
        root: ['admin', 'onboarding'] as const,
        stuck: (query: unknown) => ['admin', 'onboarding', 'stuck', query] as const,
    },
    // Platform (analytics / notifications / settings)
    platform: {
        root: ['admin', 'platform'] as const,
        business: (range: unknown) => ['admin', 'platform', 'business', range] as const,
        growth: (range: unknown) => ['admin', 'platform', 'growth', range] as const,
        revenue: (range: unknown) => ['admin', 'platform', 'revenue', range] as const,
        geography: (range: unknown) => ['admin', 'platform', 'geography', range] as const,
        risk: ['admin', 'platform', 'risk'] as const,
        todayQueue: ['admin', 'platform', 'today-queue'] as const,
        broadcasts: (query: unknown) => ['admin', 'platform', 'broadcasts', query] as const,
        deliveryStats: (range: unknown) => ['admin', 'platform', 'delivery-stats', range] as const,
        settings: ['admin', 'platform', 'settings'] as const,
    },
};
