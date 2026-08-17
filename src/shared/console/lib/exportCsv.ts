/**
 * Minimal client-side CSV export. No dependency — builds a CSV string from a
 * column map and triggers a browser download. Values are quoted/escaped so
 * commas, quotes and newlines in the data don't corrupt the file.
 */
export interface CsvColumn<T> {
    header: string;
    value: (row: T) => string | number | null | undefined;
}

const escapeCell = (raw: string | number | null | undefined): string => {
    const s = raw === null || raw === undefined ? '' : String(raw);
    if (/[",\n]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
};

export function exportCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]): void {
    const header = columns.map((c) => escapeCell(c.header)).join(',');
    const body = rows
        .map((row) => columns.map((c) => escapeCell(c.value(row))).join(','))
        .join('\n');
    const csv = `${header}\n${body}`;

    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
