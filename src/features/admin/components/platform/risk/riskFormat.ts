import type { RiskLevel, RiskSeverity } from '../../../types/platform';

/**
 * The risk console's severity language. Five-tone status pills elsewhere collapse
 * "high" and "critical" into a single danger red; a risk register needs to tell
 * an urgent-but-stable backlog apart from an actively-bleeding one, so severity
 * gets its own four-step ramp (calm green → amber → orange → rose) used by the
 * register, the KPI tiles and the posture hero alike.
 */
export interface SeverityStyle {
    label: string;
    /** Foreground / text. */
    color: string;
    /** Soft fill behind pills and tiles. */
    bg: string;
    /** Saturated accent for dots, bars and rings. */
    accent: string;
    /** Border tint for outlined surfaces. */
    border: string;
}

export const SEVERITY: Record<RiskSeverity, SeverityStyle> = {
    low: { label: 'Low', color: '#0F7B5C', bg: '#E7FBF3', accent: '#16A34A', border: '#BBF3DD' },
    medium: { label: 'Medium', color: '#92660C', bg: '#FFF8E8', accent: '#D97706', border: '#FBE3AE' },
    high: { label: 'High', color: '#B4400C', bg: '#FFF1E8', accent: '#EA580C', border: '#FBD3B6' },
    critical: { label: 'Critical', color: '#C01744', bg: '#FEEEF2', accent: '#E11D48', border: '#FAC4D2' },
};

const SEVERITY_RANK: Record<RiskSeverity, number> = {
    critical: 3,
    high: 2,
    medium: 1,
    low: 0,
};

/** Sort comparator: most severe first, then by open volume. */
export const bySeverityDesc = (
    a: { severity: RiskSeverity; openCount: number },
    b: { severity: RiskSeverity; openCount: number },
): number =>
    SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] || b.openCount - a.openCount;

export const severityStyle = (severity: RiskSeverity): SeverityStyle =>
    SEVERITY[severity] ?? SEVERITY.low;

/**
 * Posture-level styling for the hero. Maps the backend's four-step platform risk
 * level onto a gradient + accent so the whole banner shifts colour with exposure.
 */
export interface LevelStyle {
    color: string;
    accent: string;
    /** Hero banner gradient. */
    gradient: string;
    /** Track colour for the score gauge. */
    track: string;
    blurb: string;
}

export const LEVEL: Record<RiskLevel, LevelStyle> = {
    Low: {
        color: '#C73838',
        accent: '#F94444',
        gradient: 'linear-gradient(135deg, #3D0E0E 0%, #99292B 52%, #F94444 100%)',
        track: 'rgba(249,68,68,0.18)',
        blurb: 'Exposure is contained — routine review only.',
    },
    Elevated: {
        color: '#92660C',
        accent: '#D97706',
        gradient: 'linear-gradient(135deg, #3A2A07 0%, #6E4E10 52%, #9A6C14 100%)',
        track: 'rgba(217,119,6,0.20)',
        blurb: 'A growing backlog needs attention before it ages.',
    },
    High: {
        color: '#B4400C',
        accent: '#EA580C',
        gradient: 'linear-gradient(135deg, #3D1606 0%, #7A2D0C 52%, #B4400C 100%)',
        track: 'rgba(234,88,12,0.22)',
        blurb: 'Critical items are open — work them down today.',
    },
    Critical: {
        color: '#C01744',
        accent: '#E11D48',
        gradient: 'linear-gradient(135deg, #420B1E 0%, #8A1233 52%, #C01744 100%)',
        track: 'rgba(225,29,72,0.24)',
        blurb: 'Active risk to money or trust — escalate now.',
    },
};

export const levelStyle = (level: RiskLevel): LevelStyle => LEVEL[level] ?? LEVEL.Low;

/** Humanise a backend enum label, e.g. "UnderReview" → "Under review", "Track" → "Track". */
export const humanizeLabel = (raw: string): string => {
    const spaced = raw
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
};
