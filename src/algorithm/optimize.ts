/**
 * Top-level optimization entry point.
 *
 * This module is pure TypeScript with no framework imports, making it easy to:
 *   - Unit-test independently
 *   - Move into a Web Worker (recommended for large guest counts)
 */

import { buildMatrix, hardBlocks, blockModel } from './matrix';
import { anneal } from './anneal';
import { canonical, describeSeating } from './describe';
import type { RelationshipGroup, OptimizationResult } from '../types';

export const HARD_THRESHOLD = 1.0;

export function optimize(
  names: string[],
  groups: RelationshipGroup[],
  caps: number[],
  numOptions: number,
): OptimizationResult[] {
  const W = buildMatrix(names, groups);
  const blocks = hardBlocks(W, HARD_THRESHOLD);
  const { sizes, B, internal } = blockModel(W, blocks);

  // Feasibility checks
  const totalGuests = sizes.reduce((a, b) => a + b, 0);
  const totalSeats = caps.reduce((a, b) => a + b, 0);
  if (totalGuests > totalSeats)
    throw new Error(`Not enough seats: ${totalGuests} guests but only ${totalSeats} seats.`);

  const maxCap = Math.max(...caps);
  for (const block of blocks) {
    if (block.length > maxCap) {
      const who = block.map(i => names[i]).join(', ');
      throw new Error(
        `Hard group has ${block.length} people (${who}) but the largest table only seats ${maxCap}.`,
      );
    }
  }

  const nb = blocks.length;
  const iters = Math.max(4000, 400 * nb);
  const restarts = Math.max(30, 12 * numOptions);

  const found = new Map<string, { score: number; assign: number[] }>();
  for (let r = 0; r < restarts; r++) {
    const { score, assign } = anneal(B, internal, sizes, caps, iters);
    const sig = canonical(names, blocks, assign);
    if (!found.has(sig) || score > found.get(sig)!.score)
      found.set(sig, { score, assign });
  }

  return [...found.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, numOptions)
    .map(({ score, assign }) => ({
      score,
      seating: describeSeating(names, W, caps, blocks, assign),
    }));
}
