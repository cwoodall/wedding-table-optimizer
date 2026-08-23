import type { RelationshipGroup } from '../types';

export const DEFAULT_GUESTS: string[] = [
  'Danielle', 'Seamus', 'Abbey', 'Colby', 'Phil', 'Ava', 'Nicholas M', 'Olivia',
  'Marcelle', 'Michael', 'Jeff', 'Amy', 'Thomas', 'SJ', 'Luke', 'Dani', 'Tom',
  'Patricia', 'Timothy', 'Rob', 'Kimberly', 'Cedar', 'Frannie', 'Steve', 'Alexa',
  'Devon', 'Dan West', 'Joyelle', 'Dan Riti', 'Rosy', 'Alice', 'Nicholas T', 'Joy',
  'Steven', 'Abe', 'Leia', 'Ian', 'Kellin', 'Cailigh', 'Ariana', 'Dale', 'Simon',
  'Gavin', 'Juliana',
];

export const DEFAULT_TABLES: number[] = [10, 8, 8, 8, 8, 8];

// Groups are processed top-to-bottom; later entries win for the same pair.
// Soft preferences come first so that the hard groups at the bottom take precedence.
export const DEFAULT_GROUPS: RelationshipGroup[] = [
  { members: ['Danielle', 'Abbey'],                             weight: 0.5 },
  { members: ['Simon', 'Dale'],                                 weight: 0.7 },
  { members: ['Nicholas M', 'Nicholas T'],                      weight: 0.6 },
  { members: ['Phil', 'Nicholas M'],                            weight: 0.6 },
  { members: ['Jeff', 'Thomas'],                                weight: 0.8 },
  { members: ['Luke', 'Thomas'],                                weight: 0.8 },
  { members: ['Ian', 'Cailigh'],                                weight: 0.5 },
  { members: ['Gavin', 'Alice'],                                weight: 0.6 },
  { members: ['Ariana', 'Rosy'],                                weight: 0.8 },
  { members: ['Ian', 'Timothy'],                                weight: 0.8 },
  { members: ['Leia', 'Ariana'],                                weight: 0.6 },
  { members: ['Abe', 'Tom'],                                    weight: 0.2 },
  { members: ['Michael', 'Gavin'],                              weight: 0.8 },
  { members: ['Thomas', 'Gavin'],                               weight: 0.8 },
  // Hard constraints (weight >= 1.0 → must sit together)
  { members: ['Gavin', 'Juliana'],                              weight: 1.0 },
  { members: ['Alice', 'Nicholas T'],                           weight: 1.0 },
  { members: ['Joy', 'Steven'],                                 weight: 1.0 },
  { members: ['Marcelle', 'Michael'],                           weight: 1.0 },
  { members: ['Jeff', 'Amy'],                                   weight: 1.0 },
  { members: ['Ian', 'Kellin', 'Cailigh', 'Timothy'],          weight: 1.0 },
  { members: ['Ava', 'Nicholas M', 'Olivia', 'Phil'],          weight: 1.0 },
  { members: ['Dan West', 'Frannie', 'Joyelle', 'Steve'],      weight: 1.0 },
  { members: ['Dani', 'Luke', 'SJ', 'Thomas'],                 weight: 1.0 },
  { members: ['Abbey', 'Colby', 'Danielle', 'Seamus'],         weight: 1.0 },
  { members: ['Abe', 'Ariana', 'Dan Riti', 'Leia', 'Rosy'],   weight: 1.0 },
  { members: ['Cedar', 'Kimberly', 'Patricia', 'Rob', 'Tom'],  weight: 1.0 },
];
