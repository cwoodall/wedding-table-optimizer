export interface FontOption {
  value: string;
  label: string;
  family: string;
  google: string | null;
}

export const FONT_OPTIONS: FontOption[] = [
  { value: 'georgia', label: 'Georgia (serif)', family: 'Georgia, "Times New Roman", serif', google: null },
  { value: 'playfair', label: 'Playfair Display', family: '"Playfair Display", Georgia, serif', google: 'Playfair+Display:wght@400;600;700' },
  { value: 'cormorant', label: 'Cormorant Garamond', family: '"Cormorant Garamond", Georgia, serif', google: 'Cormorant+Garamond:wght@400;600;700' },
  { value: 'ebgaramond', label: 'EB Garamond', family: '"EB Garamond", Georgia, serif', google: 'EB+Garamond:wght@400;600;700' },
  { value: 'montserrat', label: 'Montserrat (sans)', family: '"Montserrat", Helvetica, Arial, sans-serif', google: 'Montserrat:wght@400;600;700' },
  { value: 'lato', label: 'Lato (sans)', family: '"Lato", Helvetica, Arial, sans-serif', google: 'Lato:wght@400;700' },
  { value: 'parisienne', label: 'Parisienne', family: '"Parisienne", Helvetica, Arial, sans-serif', google: 'Parisienne:wght@400;700' },
  { value: 'great_vibes', label: 'Great Vibes', family: '"Great Vibes", Helvetica, Arial, sans-serif', google: 'Great+Vibes:wght@400;700' },
];

export function findFont(fontKey: string): FontOption {
  return FONT_OPTIONS.find(f => f.value === fontKey) ?? FONT_OPTIONS[0];
}

/** Injects a Google Fonts stylesheet <link> for the given query (e.g. "Lato:wght@400;700")
 *  if one isn't already present. No-op for locally available fonts (google === null). */
export function ensureGoogleFont(googleQuery: string | null): void {
  if (!googleQuery) return;
  const href = `https://fonts.googleapis.com/css2?family=${googleQuery}&display=swap`;
  if (document.querySelector(`link[data-google-font="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.googleFont = href;
  document.head.appendChild(link);
}
