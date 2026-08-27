import type { RelationshipGroup, SeatingSolution, TableSeating } from '../types';
import { triggerDownload } from './download';

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
  triggerDownload(filename, toCSV(rows), 'text/csv;charset=utf-8;');
}

export interface CsvImportResult {
  guests: string[];
  groups: RelationshipGroup[];
  duplicateCount: number;
  blankNameCount: number;
}

/**
 * Pulls a weight out of a column header, e.g. "Family Group (weight 1.0)" or
 * "Friend Group (weight: 0.6)" -> 0.6. Matches the format produced by "Export
 * CSV". Returns null if the header has no recognizable weight.
 */
export function extractWeightFromHeader(header: string): number | null {
  const match = header.match(/weight\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i);
  if (!match) return null;
  const weight = Number(match[1]);
  return Number.isFinite(weight) ? weight : null;
}

export interface CsvGroupColumn {
  /** CSV header holding the grouping value (e.g. "Family Group"). */
  column: string;
  /** Weight applied to every group formed from this column: >=1.0 must sit
   *  together, 0-1 prefer together, negative prefer apart. */
  weight: number;
}

/**
 * Builds a guest list from parsed CSV rows, plus relationship groups from any
 * number of group columns. Within a single group column, guests that share
 * the same non-empty value become one group at that column's weight. Group
 * columns are independent of each other, so the same value in two different
 * columns (e.g. two "Smith" households) does not merge across columns.
 */
export function buildGuestsAndGroups(
  headers: string[],
  dataRows: string[][],
  nameCol: string,
  groupCols: CsvGroupColumn[],
): CsvImportResult {
  const norm = (s: string) => s.trim().toLowerCase();
  const nameIdx = headers.findIndex(h => norm(h) === norm(nameCol));
  if (nameIdx === -1) {
    throw new Error(`Column "${nameCol}" not found in the CSV headers.`);
  }

  const resolvedGroupCols = groupCols
    .filter(gc => gc.column.trim())
    .map(gc => ({ idx: headers.findIndex(h => norm(h) === norm(gc.column)), weight: gc.weight }))
    .filter(gc => gc.idx !== -1);

  const guests: string[] = [];
  const seen = new Set<string>();
  const relMaps = resolvedGroupCols.map(() => new Map<string, string[]>());
  let duplicateCount = 0;
  let blankNameCount = 0;

  for (const row of dataRows) {
    const rawName = (row[nameIdx] ?? '').trim();
    if (!rawName) { blankNameCount++; continue; }
    if (seen.has(rawName)) { duplicateCount++; continue; }
    seen.add(rawName);
    guests.push(rawName);

    resolvedGroupCols.forEach((gc, gi) => {
      const relVal = (row[gc.idx] ?? '').trim();
      if (relVal) {
        const bucket = relMaps[gi].get(relVal) ?? [];
        bucket.push(rawName);
        relMaps[gi].set(relVal, bucket);
      }
    });
  }

  const groups: RelationshipGroup[] = [];
  resolvedGroupCols.forEach((gc, gi) => {
    for (const [name, members] of relMaps[gi].entries()) {
      if (members.length > 1) groups.push({ name, members, weight: gc.weight });
    }
  });

  return { guests, groups, duplicateCount, blankNameCount };
}

/** Header row used by both `seatingToCsvRows` and `parseSeatingCsv`. */
export const SEATING_CSV_HEADER = ['Guest Name', 'Table Name', 'Table Number', 'Table Capacity'];

/** Flattens a seating solution into CSV rows (one row per seated guest) for export. */
export function seatingToCsvRows(seating: SeatingSolution): string[][] {
  const rows: string[][] = [SEATING_CSV_HEADER];
  for (const t of seating.tableList) {
    for (const name of t.guests) {
      rows.push([name, t.name, String(t.tableNum), String(t.capacity)]);
    }
  }
  return rows;
}

/**
 * Parses a "Guest Name, Table Name, Table Number, Table Capacity" CSV (the
 * format produced by "Export CSV") back into a seating solution, grouping
 * guest rows by table number. Violations aren't recomputed — they only apply
 * to a fresh optimization run — so both violation lists come back empty.
 */
export function parseSeatingCsv(rows: string[][]): SeatingSolution {
  if (rows.length === 0) throw new Error('CSV file is empty.');
  const norm = (s: string) => s.trim().toLowerCase();
  const header = rows[0].map(norm);
  const nameIdx = header.indexOf('guest name');
  const tableNameIdx = header.indexOf('table name');
  const tableNumIdx = header.indexOf('table number');
  const capIdx = header.indexOf('table capacity');
  if (nameIdx === -1 || tableNameIdx === -1 || tableNumIdx === -1) {
    throw new Error('CSV must have "Guest Name", "Table Name", and "Table Number" columns.');
  }

  const tables = new Map<number, TableSeating>();
  for (const row of rows.slice(1)) {
    const name = (row[nameIdx] ?? '').trim();
    if (!name) continue;
    const tableNum = Number(row[tableNumIdx]);
    if (!Number.isFinite(tableNum)) continue;
    let t = tables.get(tableNum);
    if (!t) {
      t = {
        tableNum,
        name: (row[tableNameIdx] ?? '').trim() || `Table ${tableNum}`,
        capacity: capIdx !== -1 ? Number(row[capIdx]) || 0 : 0,
        guests: [],
      };
      tables.set(tableNum, t);
    }
    t.guests.push(name);
  }

  if (tables.size === 0) throw new Error('No guest rows found in the CSV.');

  return {
    tableList: [...tables.values()].sort((a, b) => a.tableNum - b.tableNum),
    apartViolations: [],
    splitSoft: [],
  };
}
