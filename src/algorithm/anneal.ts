export function scoreAssignment(B: number[][], internal: number, blockTable: number[]): number {
  const nb = blockTable.length;
  let s = internal;
  for (let p = 0; p < nb; p++)
    for (let q = p + 1; q < nb; q++)
      if (blockTable[p] === blockTable[q]) s += B[p][q];
  return s;
}

function fisherYates(arr: number[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function randomInitial(
  sizes: number[],
  caps: number[],
  tries = 600,
): { blockTable: number[]; load: number[] } {
  const nb = sizes.length;
  const order = Array.from({ length: nb }, (_, i) => i);

  for (let attempt = 0; attempt < tries; attempt++) {
    fisherYates(order);
    const load = new Array<number>(caps.length).fill(0);
    const blockTable = new Array<number>(nb).fill(-1);
    let ok = true;

    for (const b of order) {
      // worst-fit: prefer table with most remaining space
      const sorted = Array.from({ length: caps.length }, (_, i) => i)
        .sort((x, y) => (caps[y] - load[y]) - (caps[x] - load[x]));
      let placed = false;
      for (const t of sorted) {
        if (load[t] + sizes[b] <= caps[t]) {
          blockTable[b] = t;
          load[t] += sizes[b];
          placed = true;
          break;
        }
      }
      if (!placed) { ok = false; break; }
    }
    if (ok) return { blockTable, load };
  }
  throw new Error(
    'Could not pack guests into tables. Verify total seats >= guests and no hard group exceeds the largest table.',
  );
}

export function anneal(
  B: number[][],
  internal: number,
  sizes: number[],
  caps: number[],
  iters: number,
  tStart = 1.0,
  tEnd = 0.01,
): { score: number; assign: number[] } {
  const nb = sizes.length;
  const { blockTable: bt, load: ld } = randomInitial(sizes, caps);
  const blockTable = [...bt];
  const load = [...ld];
  const tableBlocks: Set<number>[] = caps.map(() => new Set());
  blockTable.forEach((t, b) => tableBlocks[t].add(b));

  let cur = scoreAssignment(B, internal, blockTable);
  let best = cur;
  let bestAssign = [...blockTable];

  const alpha = Math.pow(tEnd / tStart, 1 / Math.max(1, iters));
  let T = tStart;

  for (let iter = 0; iter < iters; iter++) {
    if (nb >= 2 && Math.random() < 0.5) {
      // swap two blocks between different tables
      let p = Math.floor(Math.random() * nb);
      let q = Math.floor(Math.random() * nb);
      while (q === p) q = Math.floor(Math.random() * nb);

      const t1 = blockTable[p], t2 = blockTable[q];
      if (
        t1 === t2 ||
        load[t1] - sizes[p] + sizes[q] > caps[t1] ||
        load[t2] - sizes[q] + sizes[p] > caps[t2]
      ) { T *= alpha; continue; }

      const rest1 = [...tableBlocks[t1]].filter(x => x !== p);
      const rest2 = [...tableBlocks[t2]].filter(x => x !== q);
      let delta = 0;
      for (const r of rest2) delta += B[p][r];
      for (const r of rest1) delta += B[q][r];
      for (const r of rest1) delta -= B[p][r];
      for (const r of rest2) delta -= B[q][r];

      if (delta >= 0 || Math.random() < Math.exp(delta / Math.max(T, 1e-9))) {
        tableBlocks[t1].delete(p); tableBlocks[t1].add(q);
        tableBlocks[t2].delete(q); tableBlocks[t2].add(p);
        blockTable[p] = t2; blockTable[q] = t1;
        load[t1] += sizes[q] - sizes[p];
        load[t2] += sizes[p] - sizes[q];
        cur += delta;
      }
    } else {
      // relocate one block to another table
      const p = Math.floor(Math.random() * nb);
      const s = blockTable[p];
      const d = Math.floor(Math.random() * caps.length);
      if (d === s || load[d] + sizes[p] > caps[d]) { T *= alpha; continue; }

      const restS = [...tableBlocks[s]].filter(x => x !== p);
      const destBlocks = [...tableBlocks[d]];
      let delta = 0;
      for (const r of destBlocks) delta += B[p][r];
      for (const r of restS) delta -= B[p][r];

      if (delta >= 0 || Math.random() < Math.exp(delta / Math.max(T, 1e-9))) {
        tableBlocks[s].delete(p); tableBlocks[d].add(p);
        blockTable[p] = d;
        load[s] -= sizes[p]; load[d] += sizes[p];
        cur += delta;
      }
    }

    if (cur > best) { best = cur; bestAssign = [...blockTable]; }
    T *= alpha;
  }

  return { score: best, assign: bestAssign };
}
