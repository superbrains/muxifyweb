/**
 * Combines a schedule date (ISO string or Date) with a "HH:MM" clock time into a
 * full ISO-8601 timestamp the backend can bind to a `DateTime`.
 *
 * The ad wizard captures a single date plus a start/end time. Previously the raw
 * time string (e.g. "18:50") was sent as `endDate`, which the backend's
 * `DateTime? EndDate` could not deserialize — producing a 400 with an empty body
 * before the handler ran. This builds a proper timestamp instead.
 *
 * Returns `undefined` when the date or time is missing/invalid so the caller can
 * omit the field (EndDate is nullable; StartDate falls back to the bare date).
 */
export function combineDateAndTime(
    date: string | Date | null | undefined,
    time?: string,
): string | undefined {
    if (!date) return undefined;
    const base = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
    if (Number.isNaN(base.getTime())) return undefined;

    const match = /^(\d{1,2}):(\d{2})$/.exec((time ?? '').trim());
    if (!match) return undefined;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return undefined;

    base.setHours(hours, minutes, 0, 0);
    return base.toISOString();
}
