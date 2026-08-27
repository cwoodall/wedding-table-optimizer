<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { OptimizationResult, CardImage, CardImageKind } from '../types';
import { type CardPrefs, loadCardPrefs, saveCardPrefs } from '../utils/cardPrefs';
import { FONT_OPTIONS, findFont, ensureGoogleFont } from '../utils/fonts';
import { lastNameKey } from '../utils/names';
import { toInches } from '../utils/units';
import { usePlannerStore } from '../stores/planner';
import TableCardFace from './TableCardFace.vue';
import EmojiPicker from './EmojiPicker.vue';

const props = defineProps<{ option: OptimizationResult }>();
defineEmits<{ close: [] }>();

const store = usePlannerStore();

// Loaded up front (not just when a picker opens) so an emoji already chosen
// via JSON import renders in Noto's style as soon as the preview/print does.
ensureGoogleFont('Noto+Emoji');

const initial = loadCardPrefs();
const widthValue = ref(initial.widthValue);
const heightValue = ref(initial.heightValue);
const unit = ref(initial.unit);
const shape = ref(initial.shape);
const fontKey = ref(initial.fontKey);
const nameFontSizePt = ref(initial.nameFontSizePt);
const primaryColor = ref(initial.primaryColor);
const secondaryColor = ref(initial.secondaryColor);
const backgroundColor = ref(initial.backgroundColor);
const borderEnabled = ref(initial.borderEnabled);
const borderColor = ref(initial.borderColor);
const borderWidthPt = ref(initial.borderWidthPt);
const stampEnabled = ref(initial.stampEnabled);
const stampWidthValue = ref(initial.stampWidthValue);
const stampHeightValue = ref(initial.stampHeightValue);
const stampUnit = ref(initial.stampUnit);
const stampLabel = ref(initial.stampLabel);
const defaultImage = ref<CardImage>({ ...initial.defaultImage });

watch(
  [
    widthValue, heightValue, unit, shape, fontKey, nameFontSizePt, primaryColor, secondaryColor, backgroundColor,
    borderEnabled, borderColor, borderWidthPt, stampEnabled, stampWidthValue, stampHeightValue,
    stampUnit, stampLabel, defaultImage,
  ],
  () => {
    const prefs: CardPrefs = {
      widthValue: widthValue.value,
      heightValue: heightValue.value,
      unit: unit.value,
      shape: shape.value,
      fontKey: fontKey.value,
      nameFontSizePt: nameFontSizePt.value,
      primaryColor: primaryColor.value,
      secondaryColor: secondaryColor.value,
      backgroundColor: backgroundColor.value,
      borderEnabled: borderEnabled.value,
      borderColor: borderColor.value,
      borderWidthPt: borderWidthPt.value,
      stampEnabled: stampEnabled.value,
      stampWidthValue: stampWidthValue.value,
      stampHeightValue: stampHeightValue.value,
      stampUnit: stampUnit.value,
      stampLabel: stampLabel.value,
      defaultImage: defaultImage.value,
    };
    saveCardPrefs(prefs);
  },
  { deep: true },
);

const currentFont = computed(() => findFont(fontKey.value));
watch(currentFont, f => ensureGoogleFont(f.google), { immediate: true });

const cardStyleVars = computed(() => ({
  '--card-font': currentFont.value.family,
  '--card-name-size': `${nameFontSizePt.value}pt`,
  '--card-primary': primaryColor.value,
  '--card-secondary': secondaryColor.value,
  '--card-bg': backgroundColor.value,
}));

const defaultImageKind = computed<CardImageKind>({
  get: () => defaultImage.value.kind,
  set: kind => { defaultImage.value = { ...defaultImage.value, kind }; },
});
const defaultImageEmoji = computed({
  get: () => defaultImage.value.emoji ?? '',
  set: (v: string) => { defaultImage.value = { ...defaultImage.value, emoji: v }; },
});
const defaultImageMonogram = computed({
  get: () => defaultImage.value.monogramText ?? '',
  set: (v: string) => { defaultImage.value = { ...defaultImage.value, monogramText: v }; },
});

interface GuestCard {
  name: string;
  tableName: string;
}

const guestCards = computed<GuestCard[]>(() => {
  const list: GuestCard[] = [];
  for (const t of props.option.seating.tableList) {
    for (const name of t.guests) list.push({ name, tableName: t.name });
  }
  return list.sort((a, b) => lastNameKey(a.name).localeCompare(lastNameKey(b.name)));
});

const tablesInOrder = computed(() =>
  [...props.option.seating.tableList].sort((a, b) => a.tableNum - b.tableNum),
);

function tableImage(tableName: string): CardImage {
  return store.tableCardImages[tableName] ?? { kind: 'none' };
}

/** The image actually printed on a guest's card: their table's override if set, else the default. */
function imageForGuestTable(tableName: string): CardImage {
  const override = store.tableCardImages[tableName];
  return override && override.kind !== 'none' ? override : defaultImage.value;
}

function setTableImageKind(tableName: string, kind: CardImageKind) {
  store.setTableCardImage(tableName, { ...tableImage(tableName), kind });
}
function setTableImageEmoji(tableName: string, emoji: string) {
  store.setTableCardImage(tableName, { ...tableImage(tableName), kind: 'emoji', emoji });
}
function setTableImageMonogram(tableName: string, monogramText: string) {
  store.setTableCardImage(tableName, { ...tableImage(tableName), kind: 'monogram', monogramText });
}
function clearTableImage(tableName: string) {
  store.clearTableCardImage(tableName);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function onDefaultImageUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  defaultImage.value = { kind: 'upload', uploadDataUrl: await readFileAsDataUrl(file) };
  input.value = '';
}

async function onTableImageUpload(tableName: string, e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  store.setTableCardImage(tableName, { kind: 'upload', uploadDataUrl: await readFileAsDataUrl(file) });
  input.value = '';
}

// ── Page layout: cards are chunked into fixed-size grids so every physical
// page gets identical margins (an auto-flowing grid can't do that reliably
// across a print page break). ──────────────────────────────────────────────
const PAGE_W_IN = 8.5;
const PAGE_H_IN = 11;
const PAGE_MARGIN_IN = 0.4;
const CARD_GAP_IN = 0.18;

const widthIn = computed(() => Math.max(0.5, toInches(widthValue.value, unit.value)));
const faceHeightIn = computed(() => Math.max(0.5, toInches(heightValue.value, unit.value)));
const cardHeightIn = computed(() => (shape.value === 'tent' ? faceHeightIn.value * 2 : faceHeightIn.value));
const stampWidthIn = computed(() => Math.max(0.1, toInches(stampWidthValue.value, stampUnit.value)));
const stampHeightIn = computed(() => Math.max(0.1, toInches(stampHeightValue.value, stampUnit.value)));

const cols = computed(() =>
  Math.max(1, Math.floor((PAGE_W_IN - 2 * PAGE_MARGIN_IN + CARD_GAP_IN) / (widthIn.value + CARD_GAP_IN))),
);
const rows = computed(() =>
  Math.max(1, Math.floor((PAGE_H_IN - 2 * PAGE_MARGIN_IN + CARD_GAP_IN) / (cardHeightIn.value + CARD_GAP_IN))),
);
const perPage = computed(() => cols.value * rows.value);

const pages = computed<GuestCard[][]>(() => {
  const n = perPage.value;
  const chunks: GuestCard[][] = [];
  for (let i = 0; i < guestCards.value.length; i += n) chunks.push(guestCards.value.slice(i, i + n));
  return chunks.length ? chunks : [[]];
});

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${cols.value}, ${widthIn.value}in)`,
  gap: `${CARD_GAP_IN}in`,
}));

async function printCards() {
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
    <div class="cards-overlay-backdrop">
      <div class="cards-modal">
        <div class="cards-controls">
          <div class="cards-controls-row">
            <h2>Table Cards (Place Cards)</h2>
            <button class="cards-close-btn" @click="$emit('close')" title="Close">✕</button>
          </div>

          <div class="cards-controls-grid">
            <label>
              Card shape
              <select v-model="shape">
                <option value="flat">Flat</option>
                <option value="tent">Tent (folds — 2&times; height)</option>
              </select>
            </label>
            <label>
              Unit
              <select v-model="unit">
                <option value="in">inches</option>
                <option value="cm">centimeters</option>
              </select>
            </label>
            <label>
              Card width ({{ unit }})
              <input type="number" min="0.5" step="0.1" v-model.number="widthValue" />
            </label>
            <label>
              Card height ({{ unit }}){{ shape === 'tent' ? ' — per face' : '' }}
              <input type="number" min="0.5" step="0.1" v-model.number="heightValue" />
            </label>
            <label>
              Font
              <select v-model="fontKey">
                <option v-for="f in FONT_OPTIONS" :key="f.value" :value="f.value">{{ f.label }}</option>
              </select>
            </label>
            <label>
              Name font size (pt)
              <input type="number" min="6" max="36" step="0.5" v-model.number="nameFontSizePt" />
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

          <div class="cards-controls-grid">
            <label class="checkbox-label">
              <input type="checkbox" v-model="borderEnabled" /> Border
            </label>
            <label v-if="borderEnabled">
              Border color
              <input type="color" v-model="borderColor" />
            </label>
            <label v-if="borderEnabled">
              Border width (pt)
              <input type="number" min="0.25" step="0.25" v-model.number="borderWidthPt" />
            </label>
          </div>

          <div class="cards-controls-grid">
            <label class="checkbox-label">
              <input type="checkbox" v-model="stampEnabled" /> Reserve food-type stamp box
            </label>
            <template v-if="stampEnabled">
              <label>
                Stamp unit
                <select v-model="stampUnit">
                  <option value="in">inches</option>
                  <option value="cm">centimeters</option>
                </select>
              </label>
              <label>
                Stamp width ({{ stampUnit }})
                <input type="number" min="0.2" step="0.1" v-model.number="stampWidthValue" />
              </label>
              <label>
                Stamp height ({{ stampUnit }})
                <input type="number" min="0.2" step="0.1" v-model.number="stampHeightValue" />
              </label>
              <label>
                Stamp label
                <input type="text" v-model="stampLabel" placeholder="Meal" />
              </label>
            </template>
          </div>

          <div class="cards-controls-grid">
            <label>
              Default left-side image
              <select v-model="defaultImageKind">
                <option value="none">None</option>
                <option value="emoji">Emoji</option>
                <option value="monogram">Monogram</option>
                <option value="upload">Uploaded image</option>
              </select>
            </label>
            <label v-if="defaultImageKind === 'emoji'">
              Emoji
              <EmojiPicker v-model="defaultImageEmoji" />
            </label>
            <label v-if="defaultImageKind === 'monogram'">
              Monogram text
              <input type="text" v-model="defaultImageMonogram" maxlength="4" placeholder="A&amp;J" />
            </label>
            <label v-if="defaultImageKind === 'upload'">
              Upload image
              <input type="file" accept="image/*" @change="onDefaultImageUpload" />
            </label>
          </div>

          <div class="per-table-images">
            <h3>Per-table image overrides</h3>
            <p class="cards-hint">
              Optional — override the left-side image for specific tables (e.g. a different
              monogram per table). Leave "Use default" for the rest.
            </p>
            <div class="per-table-row" v-for="t in tablesInOrder" :key="t.tableNum">
              <span class="per-table-name">{{ t.name }}</span>
              <select
                :value="tableImage(t.name).kind"
                @change="setTableImageKind(t.name, ($event.target as HTMLSelectElement).value as CardImageKind)"
              >
                <option value="none">Use default</option>
                <option value="emoji">Emoji</option>
                <option value="monogram">Monogram</option>
                <option value="upload">Uploaded image</option>
              </select>
              <EmojiPicker
                v-if="tableImage(t.name).kind === 'emoji'"
                :model-value="tableImage(t.name).emoji ?? ''"
                @update:model-value="(v: string) => setTableImageEmoji(t.name, v)"
              />
              <input
                v-else-if="tableImage(t.name).kind === 'monogram'"
                type="text"
                class="per-table-input"
                :value="tableImage(t.name).monogramText ?? ''"
                maxlength="4"
                placeholder="A&amp;J"
                @input="setTableImageMonogram(t.name, ($event.target as HTMLInputElement).value)"
              />
              <input
                v-else-if="tableImage(t.name).kind === 'upload'"
                type="file"
                accept="image/*"
                class="per-table-input"
                @change="onTableImageUpload(t.name, $event)"
              />
              <button
                v-if="tableImage(t.name).kind !== 'none'"
                class="per-table-clear"
                @click="clearTableImage(t.name)"
              >
                Reset
              </button>
            </div>
          </div>

          <p class="cards-hint">
            Cards are laid out {{ cols }} across &times; {{ rows }} down per sheet ({{ perPage }} per
            page, {{ pages.length }} page{{ pages.length === 1 ? '' : 's' }} total). Use your browser's
            print dialog and choose "Save as PDF" as the destination. If a background color doesn't
            show up, enable "Background graphics" under "More settings".
          </p>
          <button class="cards-print-btn" @click="printCards">Print / Save as PDF</button>
        </div>

        <div class="cards-preview" :style="cardStyleVars">
          <section v-for="(page, pi) in pages" :key="pi" class="cards-page" :style="gridStyle">
            <div
              v-for="g in page"
              :key="g.name"
              class="card-slot"
              :class="{ 'card-slot-tent': shape === 'tent' }"
            >
              <TableCardFace
                v-if="shape === 'tent'"
                :guest-name="g.name"
                :table-label="g.tableName"
                :image="imageForGuestTable(g.tableName)"
                :width-in="widthIn"
                :height-in="faceHeightIn"
                :border-enabled="borderEnabled"
                :border-color="borderColor"
                :border-width-pt="borderWidthPt"
                :stamp-enabled="stampEnabled"
                :stamp-width-in="stampWidthIn"
                :stamp-height-in="stampHeightIn"
                :stamp-label="stampLabel"
                rotated
              />
              <TableCardFace
                :guest-name="g.name"
                :table-label="g.tableName"
                :image="imageForGuestTable(g.tableName)"
                :width-in="widthIn"
                :height-in="faceHeightIn"
                :border-enabled="borderEnabled"
                :border-color="borderColor"
                :border-width-pt="borderWidthPt"
                :stamp-enabled="stampEnabled"
                :stamp-width-in="stampWidthIn"
                :stamp-height-in="stampHeightIn"
                :stamp-label="stampLabel"
              />
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

.cards-overlay-backdrop {
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

.cards-modal {
  background: white;
  border-radius: 10px;
  width: 100%;
  max-width: 960px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.cards-controls {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e8e0d8;
  background: #fdf8f4;
}
.cards-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.cards-controls-row h2 { font-size: 1rem; font-weight: 600; color: #3d2b1f; }
.cards-close-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #8a7060;
  line-height: 1;
}
.cards-close-btn:hover { color: #3d2b1f; }

.cards-controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.6rem;
  margin-bottom: 0.75rem;
}
.cards-controls-grid label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.78rem;
  color: #8a7060;
}
.cards-controls-grid label.checkbox-label {
  flex-direction: row;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #3d2b1f;
}
.cards-controls-grid input[type='text'],
.cards-controls-grid input[type='number'],
.cards-controls-grid input[type='file'],
.cards-controls-grid select {
  padding: 0.32rem 0.55rem;
  border: 1px solid #e8e0d8;
  border-radius: 5px;
  font-size: 0.85rem;
  background: white;
  color: #3d2b1f;
}
.cards-controls-grid input[type='color'] {
  width: 100%;
  height: 32px;
  border: 1px solid #e8e0d8;
  border-radius: 5px;
  padding: 2px;
  background: white;
  cursor: pointer;
}
.cards-controls-grid input[type='checkbox'] { width: 16px; height: 16px; }

.per-table-images {
  border: 1px solid #e8e0d8;
  border-radius: 7px;
  padding: 0.75rem 0.9rem;
  margin-bottom: 0.75rem;
  background: white;
}
.per-table-images h3 { font-size: 0.88rem; font-weight: 600; color: #3d2b1f; margin-bottom: 0.2rem; }
.per-table-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0;
  border-top: 1px solid #f0e9e2;
}
.per-table-row:first-of-type { border-top: none; }
.per-table-name { flex: 0 0 110px; font-size: 0.82rem; color: #3d2b1f; font-weight: 600; }
.per-table-row select {
  padding: 0.28rem 0.5rem;
  border: 1px solid #e8e0d8;
  border-radius: 5px;
  font-size: 0.8rem;
  background: white;
  color: #3d2b1f;
}
.per-table-input {
  flex: 1;
  min-width: 0;
  padding: 0.28rem 0.5rem;
  border: 1px solid #e8e0d8;
  border-radius: 5px;
  font-size: 0.8rem;
}
.per-table-clear {
  border: none;
  background: none;
  color: #8a7060;
  font-size: 0.78rem;
  cursor: pointer;
  text-decoration: underline;
  white-space: nowrap;
}
.per-table-clear:hover { color: #3d2b1f; }

.cards-hint { font-size: 0.78rem; color: #8a7060; margin-bottom: 0.6rem; }

.cards-print-btn {
  padding: 0.55rem 1.4rem;
  font-size: 0.88rem;
  font-weight: 600;
  background: #8b5e3c;
  color: white;
  border: none;
  border-radius: 7px;
  cursor: pointer;
}
.cards-print-btn:hover { opacity: 0.9; }

.cards-preview {
  max-height: 65vh;
  overflow-y: auto;
  padding: 1.5rem;
  background: #f4efe9;
}

.cards-page {
  display: grid;
  justify-content: center;
  align-content: start;
  background: white;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.12);
  padding: 0.4in;
  margin: 0 auto 1.5rem;
  width: 8.5in;
  min-height: 11in;
  box-sizing: border-box;
}
.cards-page:last-child { margin-bottom: 0; }

.card-slot {
  display: flex;
  flex-direction: column;
  break-inside: avoid;
}
.card-slot-tent {
  position: relative;
}
.card-slot-tent::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  border-top: 1pt dashed #999;
  pointer-events: none;
}

@media print {
  #app { display: none !important; }
  .cards-overlay-backdrop {
    position: static !important;
    background: none !important;
    padding: 0 !important;
    display: block !important;
    overflow: visible !important;
  }
  .cards-modal {
    box-shadow: none !important;
    border-radius: 0 !important;
    max-width: none !important;
  }
  .cards-controls { display: none !important; }
  .cards-preview {
    max-height: none !important;
    overflow: visible !important;
    padding: 0 !important;
    background: none !important;
  }
  .cards-page {
    box-shadow: none !important;
    margin: 0 !important;
    width: 8.5in !important;
    min-height: 11in !important;
    box-sizing: border-box;
    page-break-after: always;
  }
  .cards-page:last-child { page-break-after: auto; }
}
</style>
