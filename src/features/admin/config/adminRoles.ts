/**
 * Canonical platform-role identifiers used across the admin console for CR1
 * scoping and the per-role separated pages. Values are the snake_case strings
 * the backend emits via `AdminMappings.RoleToString` (and accepts on role
 * create/update `scopedRoles` + every per-role list filter `?role=`/`?ownerRole=`).
 */
export type PlatformRole =
    | 'fan'
    | 'artist'
    | 'dj'
    | 'creator'
    | 'podcaster'
    | 'record_label'
    | 'ad_manager'
    | 'contributor';

export interface PlatformRoleMeta {
    role: PlatformRole;
    /** Plural label for list pages / nav, e.g. "Artists". */
    plural: string;
    /** Singular label for detail screens, e.g. "Artist". */
    singular: string;
    /** URL slug used in /admin/users/<slug> and queue routes. */
    slug: string;
}

export const PLATFORM_ROLES: Record<PlatformRole, PlatformRoleMeta> = {
    fan: { role: 'fan', plural: 'Fans', singular: 'Fan', slug: 'fans' },
    artist: { role: 'artist', plural: 'Artists', singular: 'Artist', slug: 'artists' },
    dj: { role: 'dj', plural: 'DJs', singular: 'DJ', slug: 'djs' },
    creator: { role: 'creator', plural: 'Content Creators', singular: 'Creator', slug: 'creators' },
    podcaster: { role: 'podcaster', plural: 'Podcasters', singular: 'Podcaster', slug: 'podcasters' },
    record_label: { role: 'record_label', plural: 'Record Labels', singular: 'Record Label', slug: 'record-labels' },
    ad_manager: { role: 'ad_manager', plural: 'Ad Managers', singular: 'Ad Manager', slug: 'ad-managers' },
    contributor: { role: 'contributor', plural: 'Contributors', singular: 'Contributor', slug: 'contributors' },
};

/** Roles whose content flows through the per-role moderation queues. */
export const CONTENT_OWNER_ROLES: PlatformRole[] = [
    'artist',
    'dj',
    'creator',
    'podcaster',
    'record_label',
    'contributor',
    'ad_manager',
];

/** Roles that can receive payouts (per-role payout queues). */
export const PAYOUT_RECIPIENT_ROLES: PlatformRole[] = [
    'artist',
    'dj',
    'creator',
    'podcaster',
    'record_label',
    'contributor',
];
