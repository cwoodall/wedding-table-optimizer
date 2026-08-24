<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { OptimizationResult } from '../types';
import { type ChartPrefs, loadChartPrefs, saveChartPrefs } from '../utils/chartPrefs';

const props = defineProps<{ option: OptimizationResult }>();
defineEmits<{ close: [] }>();

interface FontOption {
  value: string;
  label: string;
  family: string;
  google: string | null;
}

const FONT_OPTIONS: FontOption[] = [
  { value: 'georgia', label: 'Georgia (serif)', family: 'Georgia, "Times New Roman", serif', google: null },
  { value: 'playfair', label: 'Playfair Display', family: '"Playfair Display", Georgia, serif', google: 'Playfair+Display:wght@400;600;700' },
  { value: 'cormorant', label: 'Cormorant Garamond', family: '"Cormorant Garamond", Georgia, serif', google: 'Cormorant+Garamond:wght@400;600;700' },
  { value: 'ebgaramond', label: 'EB Garamond', family: '"EB Garamond", Georgia, serif', google: 'EB+Garamond:wght@400;600;700' },
  { value: 'montserrat', label: 'Montserrat (sans)', family: '"Montserrat", Helvetica, Arial, sans-serif', google: 'Montserrat:wght@400;600;700' },
  { value: 'lato', label: 'Lato (sans)', family: '"Lato", Helvetica, Arial, sans-serif', google: 'Lato:wght@400;700' },
  { value: 'parisienne', label: 'Parisienne', family: '"Parisienne", Helvetica, Arial, sans-serif', google: 'Parisienne:wght@400;700' },
  { value: 'great_vibes', label: 'Great Vibes', family: '"Great Vibes", Helvetica, Arial, sans-serif', google: 'Great+Vibes:wght@400;700' },
];

const initial = loadChartPrefs();
const title = ref(initial.title);
const fontKey = ref(initial.fontKey);
const primaryColor = ref(initial.primaryColor);
const secondaryColor = ref(initial.secondaryColor);
const backgroundColor = ref(initial.backgroundColor);

watch([title, fontKey, primaryColor, secondaryColor, backgroundColor], () => {
  const prefs: ChartPrefs = {
    title: title.value,
    fontKey: fontKey.value,
    primaryColor: primaryColor.value,
    secondaryColor: secondaryColor.value,
    backgroundColor: backgroundColor.value,
  };
  saveChartPrefs(prefs);
});

const currentFont = computed(() => FONT_OPTIONS.find(f => f.value === fontKey.value) ?? FONT_OPTIONS[0]);

function ensureGoogleFont(googleQuery: string | null) {
  if (!googleQuery) return;
  const href = `https://fonts.googleapis.com/css2?family=${googleQuery}&display=swap`;
  if (document.querySelector(`link[data-chart-font="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.chartFont = href;
  document.head.appendChild(link);
}

watch(currentFont, f => ensureGoogleFont(f.google), { immediate: true });

function lastNameKey(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName.trim().toLowerCase();
  return `${parts[parts.length - 1]} ${parts.slice(0, -1).join(' ')}`.toLowerCase();
}

const tableByGuest = computed(() => {
  const map = new Map<string, string>();
  for (const t of props.option.seating.tableList) {
    for (const g of t.guests) map.set(g, t.name);
  }
  return map;
});

const alphabeticalGuests = computed(() =>
  [...tableByGuest.value.entries()]
    .map(([name, tableName]) => ({ name, tableName }))
    .sort((a, b) => lastNameKey(a.name).localeCompare(lastNameKey(b.name))),
);

const tablesInOrder = computed(() =>
  [...props.option.seating.tableList]
    .map(t => ({
      ...t,
      sortedGuests: [...t.guests].sort((a, b) => lastNameKey(a).localeCompare(lastNameKey(b))),
    }))
    .sort((a, b) => a.tableNum - b.tableNum),
);

const chartStyleVars = computed(() => ({
  '--chart-font': currentFont.value.family,
  '--chart-primary': primaryColor.value,
  '--chart-secondary': secondaryColor.value,
  '--chart-bg': backgroundColor.value,
}));

async function printChart() {
  try {
    await document.fonts?.ready;
  } catch {
    // Font-loading introspection isn't available/finished — print anyway.
  }
  window.print();
}
</script>

<template>
  <Teleport to="body">
    <div class="chart-overlay-backdrop">
      <div class="chart-modal">
        <div class="chart-controls">
          <div class="chart-controls-row">
            <h2>Seating Chart PDF</h2>
            <button class="chart-close-btn" @click="$emit('close')" title="Close">✕</button>
          </div>

          <div class="chart-controls-grid">
            <label>
              Chart title
              <input type="text" v-model="title" placeholder="Seating Chart" />
            </label>
            <label>
              Font
              <select v-model="fontKey">
                <option v-for="f in FONT_OPTIONS" :key="f.value" :value="f.value">{{ f.label }}</option>
              </select>
            </label>
            <label>
              Primary color
              <input type="color" v-model="primaryColor" />
            </label>
            <label>
              Secondary color
              <input type="color" v-model="secondaryColor" />
            </label>
            <label>
              Background color
              <input type="color" v-model="backgroundColor" />
            </label>
          </div>

          <p class="chart-hint">
            Two pages will print: an alphabetical guest list, then guests grouped by table. Use
            your browser's print dialog and choose "Save as PDF" as the destination. If a
            background color doesn't show up, look for a "Background graphics" checkbox under
            "More settings" in the print dialog and enable it.
          </p>
          <button class="chart-print-btn" @click="printChart">Print / Save as PDF</button>
        </div>

        <div class="chart-preview" :style="chartStyleVars">
          <section class="chart-page">
            <header class="chart-page-hdr">
              <h1>{{ title || 'Seating Chart' }}</h1>
              <p class="chart-page-sub">Alphabetical Guest List</p>
            </header>
            <div class="alpha-columns">
              <div v-for="g in alphabeticalGuests" :key="g.name" class="alpha-row">
                <span class="alpha-name">{{ g.name }}</span>
                <span class="alpha-leader"></span>
                <span class="alpha-table">{{ g.tableName }}</span>
              </div>
            </div>
          </section>

          <section class="chart-page">
            <header class="chart-page-hdr">
              <h1>{{ title || 'Seating Chart' }}</h1>
              <p class="chart-page-sub">Guests by Table</p>
            </header>
            <div class="table-cards">
              <div v-for="t in tablesInOrder" :key="t.tableNum" class="table-card">
                <h2 class="table-card-hdr">{{ t.name }}</h2>
                <ul class="table-card-list">
                  <li v-for="name in t.sortedGuests" :key="name">{{ name }}</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
@page {
  size: letter;
  margin: 0;
}

.chart-overlay-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(20, 14, 8, 0.55);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem;
  overflow-y: auto;
}

.chart-modal {
  background: white;
  border-radius: 10px;
  width: 100%;
  max-width: 900px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.chart-controls {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e8e0d8;
  background: #fdf8f4;
}
.chart-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.chart-controls-row h2 { font-size: 1rem; font-weight: 600; color: #3d2b1f; }
.chart-close-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #8a7060;
  line-height: 1;
}
.chart-close-btn:hover { color: #3d2b1f; }

.chart-controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.6rem;
  margin-bottom: 0.75rem;
}
.chart-controls-grid label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.78rem;
  color: #8a7060;
}
.chart-controls-grid input[type='text'],
.chart-controls-grid select {
  padding: 0.32rem 0.55rem;
  border: 1px solid #e8e0d8;
  border-radius: 5px;
  font-size: 0.85rem;
  background: white;
  color: #3d2b1f;
}
.chart-controls-grid input[type='color'] {
  width: 100%;
  height: 32px;
  border: 1px solid #e8e0d8;
  border-radius: 5px;
  padding: 2px;
  background: white;
  cursor: pointer;
}

.chart-hint { font-size: 0.78rem; color: #8a7060; margin-bottom: 0.6rem; }

.chart-print-btn {
  padding: 0.55rem 1.4rem;
  font-size: 0.88rem;
  font-weight: 600;
  background: #8b5e3c;
  color: white;
  border: none;
  border-radius: 7px;
  cursor: pointer;
}
.chart-print-btn:hover { opacity: 0.9; }

.chart-preview {
  max-height: 65vh;
  overflow-y: auto;
  padding: 1.5rem;
  background: #f4efe9;
  font-family: var(--chart-font, Georgia, serif);
}

.chart-page {
  background: var(--chart-bg, white);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.12);
  padding: 0.9in 0.7in;
  margin: 0 auto 1.5rem;
  max-width: 8.5in;
  min-height: 11in;
  box-sizing: border-box;
  /* Browsers strip background colors when printing by default (to save ink) —
     this tells them to keep it as shown instead. */
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.chart-page:last-child { margin-bottom: 0; }

.chart-page-hdr {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--chart-secondary, #c4956a);
}
.chart-page-hdr h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--chart-primary, #8b5e3c);
  margin-bottom: 0.25rem;
  letter-spacing: 0.02em;
}
.chart-page-sub {
  font-size: 0.95rem;
  color: var(--chart-secondary, #c4956a);
  letter-spacing: 0.12em;
}

.alpha-columns {
  column-count: 2;
  column-gap: 2rem;
}
.alpha-row {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  break-inside: avoid;
  padding: 0.22rem 0;
  font-size: 0.92rem;
}
.alpha-name { color: var(--chart-primary, #8b5e3c); white-space: nowrap; }
.alpha-leader {
  flex: 1;
  border-bottom: 1px dotted #c9bcae;
  margin-bottom: 0.28em;
}
.alpha-table {
  color: var(--chart-secondary, #c4956a);
  font-weight: 600;
  white-space: nowrap;
  font-size: 0.85rem;
}

.table-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}
.table-card {
  border: 1px solid var(--chart-secondary, #c4956a);
  border-radius: 8px;
  padding: 0.75rem 0.9rem;
  break-inside: avoid;
}
.table-card-hdr {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--chart-primary, #8b5e3c);
  margin-bottom: 0.5rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--chart-secondary, #c4956a);
}
.table-card-list { list-style: none; }
.table-card-list li {
  font-size: 0.88rem;
  color: var(--chart-primary, #8b5e3c);
  padding: 0.12rem 0;
}

@media print {
  #app { display: none !important; }
  .chart-overlay-backdrop {
    position: static !important;
    background: none !important;
    padding: 0 !important;
    display: block !important;
    overflow: visible !important;
  }
  .chart-modal {
    box-shadow: none !important;
    border-radius: 0 !important;
    max-width: none !important;
  }
  .chart-controls { display: none !important; }
  .chart-preview {
    max-height: none !important;
    overflow: visible !important;
    padding: 0 !important;
    background: none !important;
  }
  .chart-page {
    box-shadow: none !important;
    margin: 0 !important;
    /* @page margin is 0 (a browser page margin can't be painted into), so this
       padding is what insets the text from the physical page edge instead —
       the background itself still covers the full page, edge to edge. */
    padding: 0.9in 0.7in !important;
    width: 8.5in !important;
    min-height: 11in !important;
    max-width: none !important;
    box-sizing: border-box;
    page-break-after: always;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .chart-page:last-child { page-break-after: auto; }
}
</style>
