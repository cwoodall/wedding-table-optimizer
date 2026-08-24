const CHART_PREFS_KEY = 'wedding-chart-prefs-v1';

export interface ChartPrefs {
  title: string;
  fontKey: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
}

export function defaultChartPrefs(): ChartPrefs {
  return {
    title: 'Seating Chart',
    fontKey: 'georgia',
    primaryColor: '#8b5e3c',
    secondaryColor: '#c4956a',
    backgroundColor: '#ffffff',
  };
}

export function loadChartPrefs(): ChartPrefs {
  try {
    const raw = localStorage.getItem(CHART_PREFS_KEY);
    if (raw) return { ...defaultChartPrefs(), ...JSON.parse(raw) };
  } catch {
    // Corrupt prefs — fall back to defaults.
  }
  return defaultChartPrefs();
}

export function saveChartPrefs(prefs: ChartPrefs): void {
  localStorage.setItem(CHART_PREFS_KEY, JSON.stringify(prefs));
}

/** Clears saved chart print prefs so the next "Seating Chart PDF" open starts from defaults. */
export function resetChartPrefs(): void {
  localStorage.removeItem(CHART_PREFS_KEY);
}
