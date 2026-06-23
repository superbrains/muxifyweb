/**
 * Canonical genre options used across the app.
 *
 * IMPORTANT: the `value` here is exactly what gets persisted to a track/video's
 * `GenreName` on upload. There is no seeded Genres table on the backend, so the
 * submitted slug is stored verbatim (see `TrackPersistenceFlow` /
 * `VideoPersistenceFlow`). Anything that later filters media by genre — ad
 * audience targeting and the sponsorable-media search — MUST use these same
 * values, otherwise the filter can never match what upload stored.
 *
 * Single source of truth: both the upload form and the Ad Manager wizard import
 * this list so they can never drift apart again.
 */
export interface GenreOption {
  label: string;
  value: string;
}

export const GENRE_OPTIONS: GenreOption[] = [
  { label: 'Afrobeat', value: 'afrobeat' },
  { label: 'Hip Hop', value: 'hip-hop' },
  { label: 'Pop', value: 'pop' },
  { label: 'R&B', value: 'rnb' },
];

/** Genre options with a leading "Select Genre" placeholder, for required dropdowns. */
export const GENRE_OPTIONS_WITH_PLACEHOLDER: GenreOption[] = [
  { label: 'Select Genre', value: '' },
  ...GENRE_OPTIONS,
];
