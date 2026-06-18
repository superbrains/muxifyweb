/**
 * Lyrics format helpers shared by the upload form, the review screen, and the
 * edit-lyrics modal. Mirrors the backend contract: lyrics can be plain
 * line-by-line text OR synchronized LRC (with `[mm:ss]` timestamps). The player
 * decides how to render based on whether timestamps are present — no format flag
 * is stored — so detection here is purely for UI affordances.
 */

export type LyricsFormat = 'synced' | 'plain' | 'empty';

// At least one [mm:ss], [mm:ss.xx], or [mm:ss.xxx] timestamp. Matches the loose
// sniff the mobile player and (previously) the backend used.
const LRC_TIMESTAMP = /\[\d{1,2}:\d{2}([.:]\d{1,3})?\]/;

/**
 * Max lyrics length. Mirrors the backend `LyricsLimits.MaxLrcLengthBytes`, which
 * is compared against C# `string.Length` (UTF-16 code units) — the same unit as
 * JavaScript `string.length`, so the limits line up exactly.
 */
export const LYRICS_MAX_LENGTH = 100 * 1024; // 100K characters

/** Classifies lyrics text so the UI can show a "Synced · LRC" vs "Plain text" hint. */
export function detectLyricsFormat(text: string | null | undefined): LyricsFormat {
  if (!text || !text.trim()) return 'empty';
  return LRC_TIMESTAMP.test(text) ? 'synced' : 'plain';
}

/**
 * Validates lyrics before submit. Size-only, mirroring the backend — both plain
 * and synced are accepted, and empty is allowed (the field is optional).
 * Returns an error message, or null when valid.
 */
export function validateLyrics(text: string | null | undefined): string | null {
  if (!text || !text.trim()) return null;
  if (text.length > LYRICS_MAX_LENGTH) {
    return `Lyrics exceed the ${LYRICS_MAX_LENGTH / 1024} KB limit.`;
  }
  return null;
}
