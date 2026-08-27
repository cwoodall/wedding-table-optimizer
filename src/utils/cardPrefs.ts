import type { CardImage } from '../types';
import type { LengthUnit } from './units';

export type CardShape = 'flat' | 'tent';

export interface CardPrefs {
  widthValue: number;
  heightValue: number;
  unit: LengthUnit;
  shape: CardShape;
  fontKey: string;
  nameFontSizePt: number;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  borderEnabled: boolean;
  borderColor: string;
  borderWidthPt: number;
  stampEnabled: boolean;
  stampWidthValue: number;
  stampHeightValue: number;
  stampUnit: LengthUnit;
  stampLabel: string;
  defaultImage: CardImage;
}

const CARD_PREFS_KEY = 'wedding-card-prefs-v1';

export function defaultCardPrefs(): CardPrefs {
  return {
    widthValue: 3.5,
    heightValue: 2,
    unit: 'in',
    shape: 'flat',
    fontKey: 'georgia',
    nameFontSizePt: 13,
    primaryColor: '#8b5e3c',
    secondaryColor: '#c4956a',
    backgroundColor: '#ffffff',
    borderEnabled: true,
    borderColor: '#c4956a',
    borderWidthPt: 1,
    stampEnabled: true,
    stampWidthValue: 0.6,
    stampHeightValue: 0.6,
    stampUnit: 'in',
    stampLabel: 'Meal',
    defaultImage: { kind: 'none' },
  };
}

export function loadCardPrefs(): CardPrefs {
  try {
    const raw = localStorage.getItem(CARD_PREFS_KEY);
    if (raw) return { ...defaultCardPrefs(), ...JSON.parse(raw) };
  } catch {
    // Corrupt prefs — fall back to defaults.
  }
  return defaultCardPrefs();
}

export function saveCardPrefs(prefs: CardPrefs): void {
  localStorage.setItem(CARD_PREFS_KEY, JSON.stringify(prefs));
}

/** Clears saved table-card print prefs so the next "Table Cards" open starts from defaults. */
export function resetCardPrefs(): void {
  localStorage.removeItem(CARD_PREFS_KEY);
}
