import type { RelationshipGroup } from '../types';

export const DEFAULT_GUESTS: string[] = [
  'Priya', 'Marcus', 'Elena', 'Theo', 'Naomi', 'Felix', 'Grace', 'Oscar',
  'Ruby', 'Diego', 'Willa', 'Hugo', 'Sasha', 'MIke',
];

export const DEFAULT_TABLES: number[] = [6, 4, 4];

// Groups are processed top-to-bottom; later entries win for the same pair.
// Soft preferences come first so that the hard groups at the bottom take precedence.
export const DEFAULT_GROUPS: RelationshipGroup[] = [
  { members: ['Ruby', 'Diego'],                    weight: 0.5 },
  { members: ['Willa', 'Hugo'],                     weight: 0.0 },
  { members: ['Priya', 'Naomi'],                    weight: 0.7 },
 ];
