import type { RelationshipGroup } from '../types';

/**
 * Build an n×n symmetric weight matrix from a list of relationship groups.
 * Groups are applied in order; later groups override earlier ones for the same pair.
 */
export function buildMatrix(names: string[], groups: RelationshipGroup[]): number[][] {
  const n = names.length;
  const idx: Record<string, number> = Object.fromEntries(names.map((name, i) => [name, i]));
  const W: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (const { members, weight } of groups) {
    for (let a = 0; a < members.length; a++) {
      for (let b = a + 1; b < members.length; b++) {
        const i = idx[members[a]];
        const j = idx[members[b]];
        if (i !== undefined && j !== undefined) {
          W[i][j] = W[j][i] = weight;
        }
      }
    }
  }
  return W;
}

/**
 * Union-Find: merge every guest pair linked by weight >= threshold into blocks.
 * Returns an array of blocks, each block being an array of guest indices.
 */
export function hardBlocks(W: number[][], threshold = 1.0): number[][] {
  const n = W.length;
  const parent = Array.from({ length: n }, (_, i) => i);

  function find(x: number): number {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  }

  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (W[i][j] >= threshold) parent[find(i)] = find(j);

  const map: Record<number, number[]> = {};
  for (let i = 0; i < n; i++) {
    const r = find(i);
    if (!map[r]) map[r] = [];
    map[r].push(i);
  }
  return Object.values(map);
}

/**
 * Collapse the guest-level weight matrix onto a block-level model.
 */
export function blockModel(W: number[][], blocks: number[][]): {
  sizes: number[];
  B: number[][];
  internal: number;
} {
  const nb = blocks.length;
  const sizes = blocks.map(b => b.length);
  const B: number[][] = Array.from({ length: nb }, () => new Array(nb).fill(0));
  let internal = 0;

  for (let p = 0; p < nb; p++) {
    for (const a of blocks[p])
      for (const b of blocks[p])
        if (a !== b) internal += W[a][b];
    for (let q = p + 1; q < nb; q++) {
      let w = 0;
      for (const a of blocks[p])
        for (const b of blocks[q])
          w += W[a][b];
      B[p][q] = B[q][p] = w;
    }
  }
  return { sizes, B, internal: internal / 2 };
}
