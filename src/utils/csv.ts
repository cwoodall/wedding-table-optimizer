import type { RelationshipGroup } from '../types';

/** Minimal RFC 4180 CSV parser: handles quoted fields, escaped quotes, and CRLF/LF. */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  const pushField = () => { row.push(field); field = ''; };
  const pushRow = () => { pushField(); rows.push(row); row = []; };

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ',') { pushField(); i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { pushRow(); i++; continue; }
    field += c; i++;
  }
  if (field.length > 0 || row.length > 0) pushRow();

  return rows.filter(r => !(r.length === 1 && r[0] === ''));
}

function toCSVField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

export function toCSV(rows: string[][]): string {
  return rows.map(row => row.map(toCSVField).join(',')).join('\r\n');
}

/** Triggers a browser download of the given rows as a CSV file. */
export function downloadCSV(filename: string, rows: string[][]): void {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface CsvImportResult {
  guests: string[];
  groups: RelationshipGroup[];
  duplicateCount: number;
  blankNameCount: number;
}

/**
 * Builds a guest list and "must sit together" groups from parsed CSV rows.
 * Guests that share the same non-empty value in the relationship column are
 * grouped as a hard constraint (weight 1.0).
 */
export function buildGuestsAndGroups(
  headers: string[],
  dataRows: string[][],
  nameCol: string,
  relCol: string,
): CsvImportResult {
  const norm = (s: string) => s.trim().toLowerCase();
  const nameIdx = headers.findIndex(h => norm(h) === norm(nameCol));
  if (nameIdx === -1) {
    throw new Error(`Column "${nameCol}" not found in the CSV headers.`);
  }
  const relIdx = relCol.trim() ? headers.findIndex(h => norm(h) === norm(relCol)) : -1;

  const guests: string[] = [];
  const seen = new Set<string>();
  const relMap = new Map<string, string[]>();
  let duplicateCount = 0;
  let blankNameCount = 0;

  for (const row of dataRows) {
    const rawName = (row[nameIdx] ?? '').trim();
    if (!rawName) { blankNameCount++; continue; }
    if (seen.has(rawName)) { duplicateCount++; continue; }
    seen.add(rawName);
    guests.push(rawName);

    if (relIdx !== -1) {
      const relVal = (row[relIdx] ?? '').trim();
      if (relVal) {
        const bucket = relMap.get(relVal) ?? [];
        bucket.push(rawName);
        relMap.set(relVal, bucket);
      }
    }
  }

  const groups: RelationshipGroup[] = [];
  for (const members of relMap.values()) {
    if (members.length > 1) groups.push({ members, weight: 1.0 });
  }

  return { guests, groups, duplicateCount, blankNameCount };
}
