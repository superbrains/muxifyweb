/**
 * Soft tints for avatar-initials fallbacks, picked deterministically from the
 * name so a user keeps the same colour across every admin surface.
 */
const FALLBACK_TINTS = [
    { bg: '#EEF2FF', color: '#4338CA' }, // indigo
    { bg: '#ECFDF5', color: '#047857' }, // emerald
    { bg: '#FFF7ED', color: '#C2410C' }, // orange
    { bg: '#F0F9FF', color: '#0369A1' }, // sky
    { bg: '#FDF2F8', color: '#BE185D' }, // pink
    { bg: '#F5F3FF', color: '#6D28D9' }, // violet
    { bg: '#FEFCE8', color: '#A16207' }, // amber
    { bg: '#F0FDFA', color: '#0F766E' }, // teal
] as const;

export const identityTint = (name?: string | null) => {
    let hash = 0;
    for (const ch of name ?? '') hash = (hash * 31 + ch.charCodeAt(0)) | 0;
    return FALLBACK_TINTS[Math.abs(hash) % FALLBACK_TINTS.length];
};
