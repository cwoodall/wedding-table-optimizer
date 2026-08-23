export interface RelationshipGroup {
  members: string[];
  weight: number;
}

export interface TableSeating {
  tableNum: number;
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
