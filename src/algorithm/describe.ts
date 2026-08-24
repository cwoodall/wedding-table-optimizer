import type { SeatingSolution } from '../types';

export function canonical(names: string[], blocks: number[][], blockTable: number[]): string {
  const tables: Record<number, number[]> = {};
  blockTable.forEach((t, b) => {
    if (!tables[t]) tables[t] = [];
    tables[t].push(...blocks[b]);
  });
  return JSON.stringify(
    Object.values(tables)
      .map(g => g.map(i => names[i]).sort())
      .sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1)),
  );
}

export function describeSeating(
  names: string[],
  W: number[][],
  caps: number[],
  blocks: number[][],
  blockTable: number[],
  tableNames: string[],
  threshold = 1.0,
): SeatingSolution {
  const tables: Record<number, number[]> = {};
  blockTable.forEach((t, b) => {
    if (!tables[t]) tables[t] = [];
    tables[t].push(...blocks[b]);
  });

  const tableList = Object.entries(tables)
    .map(([t, guests]) => {
      const idx = parseInt(t);
      return {
        tableNum: idx + 1,
        name: tableNames[idx] ?? `Table ${idx + 1}`,
        capacity: caps[idx],
        guests: guests.map(i => names[i]).sort(),
      };
    })
    .sort((a, b) => a.tableNum - b.tableNum);

  const sameTable: Record<number, number> = {};
  Object.entries(tables).forEach(([t, guests]) =>
    guests.forEach(i => (sameTable[i] = parseInt(t))),
  );

  const n = names.length;
  const apartViolations: SeatingSolution['apartViolations'] = [];
  const splitSoft: SeatingSolution['splitSoft'] = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const w = W[i][j];
      const same = sameTable[i] === sameTable[j];
      if (w < 0 && same)
        apartViolations.push({ a: names[i], b: names[j], w });
      else if (w > 0 && w < threshold && !same)
        splitSoft.push({ a: names[i], b: names[j], w });
    }
  }

  return { tableList, apartViolations, splitSoft };
}
