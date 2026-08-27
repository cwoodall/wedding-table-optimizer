export interface RelationshipGroup {
  name?: string;
  members: string[];
  weight: number;
}

export interface TableSpec {
  name: string;
  capacity: number;
}

export interface TableSeating {
  tableNum: number;
  name: string;
  capacity: number;
  guests: string[];
}

export interface Violation {
  a: string;
  b: string;
  w: number;
}

export interface SeatingSolution {
  tableList: TableSeating[];
  apartViolations: Violation[];
  splitSoft: Violation[];
}

export interface OptimizationResult {
  score: number;
  seating: SeatingSolution;
}

export type CardImageKind = 'none' | 'emoji' | 'monogram' | 'upload';

/** A left-side card decoration. At most one of emoji/monogramText/uploadDataUrl
 *  is meaningful, selected by `kind`; the others are left over from switching
 *  kinds in the UI so the user's input isn't lost if they switch back. */
export interface CardImage {
  kind: CardImageKind;
  emoji?: string;
  monogramText?: string;
  uploadDataUrl?: string;
}
