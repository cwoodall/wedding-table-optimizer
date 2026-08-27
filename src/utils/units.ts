export type LengthUnit = 'in' | 'cm';

const CM_PER_IN = 2.54;

/** Converts a length in the given unit to inches, for layout math (page math is done in inches). */
export function toInches(value: number, unit: LengthUnit): number {
  return unit === 'cm' ? value / CM_PER_IN : value;
}

/** Formats a length as a CSS length string in the given unit (e.g. "3.5in", "8.9cm"). */
export function cssLength(value: number, unit: LengthUnit): string {
  return `${value}${unit}`;
}
