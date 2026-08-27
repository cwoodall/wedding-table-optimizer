<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { usePlannerStore } from '../stores/planner';
import { downloadCSV, parseCSV, parseSeatingCsv, seatingToCsvRows } from '../utils/csv';
import type { OptimizationResult } from '../types';
import SeatingChartModal from './SeatingChartModal.vue';
import TableCardsModal from './TableCardsModal.vue';

const store = usePlannerStore();
const chartTarget = ref<number | 'accepted' | null>(null);
const cardsTarget = ref<number | 'accepted' | null>(null);
const acceptedOptionIdx = ref<number | null>(null);
const acceptedImportInput = ref<HTMLInputElement | null>(null);
const acceptedImportError = ref<string | null>(null);

function resolveOption(target: number | 'accepted' | null): OptimizationResult | null {
  if (target === 'accepted') {
    return store.acceptedSeating ? { score: 0, seating: store.acceptedSeating } : null;
  }
  if (typeof target === 'number') return store.results?.[target] ?? null;
  return null;
}

const chartOption = computed<OptimizationResult | null>(() => resolveOption(chartTarget.value));
const cardsOption = computed<OptimizationResult | null>(() => resolveOption(cardsTarget.value));

function totalSeated(optIdx: number): number {
  return store.results?.[optIdx].seating.tableList
    .reduce((s, t) => s + t.guests.length, 0) ?? 0;
}

function acceptedTotalSeated(): number {
  return store.acceptedSeating?.tableList.reduce((s, t) => s + t.guests.length, 0) ?? 0;
}

// A fresh run replaces `store.results` wholesale, so the "Accepted" badge on an
// option index from the previous run would otherwise mislabel the new one.
watch(() => store.results, () => { acceptedOptionIdx.value = null; });

function exportOption(optIdx: number) {
  const opt = store.results?.[optIdx];
  if (!opt) return;
  downloadCSV(`seating-option-${optIdx + 1}.csv`, seatingToCsvRows(opt.seating));
}

function acceptOption(optIdx: number) {
  store.acceptResult(optIdx);
  acceptedOptionIdx.value = optIdx;
}

function clearAccepted() {
  store.clearAcceptedSeating();
  acceptedOptionIdx.value = null;
}

function exportAccepted() {
  if (!store.acceptedSeating) return;
  downloadCSV('seating-accepted.csv', seatingToCsvRows(store.acceptedSeating));
}

function onImportAcceptedCsv(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const seating = parseSeatingCsv(parseCSV(String(reader.result ?? '')));
      store.setAcceptedSeating(seating);
      acceptedOptionIdx.value = null;
      acceptedImportError.value = null;
    } catch (err) {
      acceptedImportError.value = err instanceof Error ? err.message : String(err);
    } finally {
      if (acceptedImportInput.value) acceptedImportInput.value.value = '';
    }
  };
  reader.readAsText(file);
}
</script>

<template>
  <div>
    <!-- Run panel -->
    <div class="run-card card">
      <h2>Generate Seatings</h2>

      <div class="settings-row">
        <label for="num-options">Options to generate:</label>
        <input
          id="num-options"
          type="number"
          v-model.number="store.numOptions"
          min="1"
          max="10"
        />
      </div>

      <button class="btn-run" @click="store.runOptimization()" :disabled="store.running">
        <span v-if="store.running"><span class="spinner"></span>Optimizing&hellip;</span>
        <span v-else>Run Optimization</span>
      </button>

      <div v-if="store.error" class="error-box">{{ store.error }}</div>
    </div>

    <!-- Accepted seating: persists across sessions/JSON export, independent of the in-memory run results -->
    <div class="result-option accepted-option" v-if="store.acceptedSeating">
      <div class="result-header">
        <h3>✓ Accepted Seating</h3>
        <span class="result-header-actions">
          <button class="btn btn-ghost export-btn" @click="chartTarget = 'accepted'">Seating Chart PDF</button>
          <button class="btn btn-ghost export-btn" @click="cardsTarget = 'accepted'">Table Cards</button>
          <button class="btn btn-ghost export-btn" @click="exportAccepted">Export CSV</button>
          <label class="btn btn-ghost export-btn">
            Import CSV
            <input ref="acceptedImportInput" type="file" accept=".csv,text/csv" hidden @change="onImportAcceptedCsv" />
          </label>
          <button class="btn btn-ghost export-btn" @click="clearAccepted">Clear</button>
        </span>
      </div>
      <div class="result-summary">
        <span>{{ acceptedTotalSeated() }} guests seated</span>
      </div>
      <div v-if="acceptedImportError" class="error-box">{{ acceptedImportError }}</div>
      <div class="tables-grid">
        <div v-for="t in store.acceptedSeating.tableList" :key="t.tableNum" class="table-result">
          <div class="table-result-hdr">
            {{ t.name }} &nbsp;({{ t.guests.length }}/{{ t.capacity }})
          </div>
          <ul>
            <li v-for="name in t.guests" :key="name">{{ name }}</li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="result-option accepted-option accepted-empty">
      <div class="result-header">
        <h3>Accepted Seating</h3>
        <span class="result-header-actions">
          <label class="btn btn-ghost export-btn">
            Import CSV
            <input ref="acceptedImportInput" type="file" accept=".csv,text/csv" hidden @change="onImportAcceptedCsv" />
          </label>
        </span>
      </div>
      <div class="result-summary">
        <span>Mark an option below as accepted, or import a seating CSV, to prepare it for printing.</span>
      </div>
      <div v-if="acceptedImportError" class="error-box">{{ acceptedImportError }}</div>
    </div>

    <!-- Results -->
    <div v-if="store.results && store.results.length">
      <div v-for="(opt, ri) in store.results" :key="ri" class="result-option">
        <div class="result-header">
          <h3>Option {{ ri + 1 }}</h3>
          <span class="result-header-actions">
            <span class="score-chip">score {{ opt.score.toFixed(2) }}</span>
            <span v-if="acceptedOptionIdx === ri" class="accepted-chip">✓ Accepted</span>
            <button v-else class="btn btn-ghost export-btn" @click="acceptOption(ri)">Mark as Accepted</button>
            <button class="btn btn-ghost export-btn" @click="chartTarget = ri">Seating Chart PDF</button>
            <button class="btn btn-ghost export-btn" @click="cardsTarget = ri">Table Cards</button>
            <button class="btn btn-ghost export-btn" @click="exportOption(ri)">Export CSV</button>
          </span>
        </div>

        <div class="result-summary">
          <span>{{ totalSeated(ri) }} guests seated</span>
          <span v-if="opt.seating.apartViolations.length" class="warn">
            ⚠ {{ opt.seating.apartViolations.length }} apart violation(s)
          </span>
          <span v-if="opt.seating.splitSoft.length">
            {{ opt.seating.splitSoft.length }} soft preference(s) split
          </span>
          <span
            v-if="!opt.seating.apartViolations.length && !opt.seating.splitSoft.length"
            class="ok"
          >
            ✓ All preferences satisfied
          </span>
        </div>

        <div class="tables-grid">
          <div v-for="t in opt.seating.tableList" :key="t.tableNum" class="table-result">
            <div class="table-result-hdr">
              {{ t.name }} &nbsp;({{ t.guests.length }}/{{ t.capacity }})
            </div>
            <ul>
              <li v-for="name in t.guests" :key="name">{{ name }}</li>
            </ul>
          </div>
        </div>

        <div
          v-if="opt.seating.apartViolations.length || opt.seating.splitSoft.length"
          class="violations"
        >
          <p v-for="v in opt.seating.apartViolations" :key="v.a + v.b" class="v-apart">
            ⚠ {{ v.a }} &amp; {{ v.b }} seated together despite preferring apart
          </p>
          <p v-for="v in opt.seating.splitSoft" :key="v.a + v.b" class="v-split">
            · {{ v.a }} &amp; {{ v.b }} preferred together but split (w={{ v.w.toFixed(2) }})
          </p>
        </div>
      </div>
    </div>

    <div v-else-if="!store.running && !store.results" class="no-results">
      Press "Run Optimization" to generate seating arrangements.
    </div>

    <SeatingChartModal
      v-if="chartOption"
      :option="chartOption"
      @close="chartTarget = null"
    />
    <TableCardsModal
      v-if="cardsOption"
      :option="cardsOption"
      @close="cardsTarget = null"
    />
  </div>
</template>

<style scoped>
.run-card {
  max-width: 480px;
  margin: 0 auto 1.5rem;
  text-align: center;
}
.run-card h2 { font-size: 1rem; font-weight: 600; margin-bottom: 1rem; }

.settings-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.settings-row label { font-size: 0.875rem; color: var(--text-muted); }
.settings-row input[type='number'] {
  width: 64px;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 5px;
  font-size: 0.9rem;
  text-align: center;
}

.btn-run {
  padding: 0.65rem 2.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
}
.btn-run:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-run:disabled { opacity: 0.5; cursor: not-allowed; }

.error-box {
  background: #fee2e2;
  color: var(--danger);
  border-radius: 6px;
  padding: 0.65rem 0.9rem;
  font-size: 0.85rem;
  margin-top: 1rem;
  text-align: left;
}

/* Result cards */
.result-option {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.result-header {
  background: var(--bg);
  padding: 0.65rem 1.1rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.result-header h3 { font-size: 0.95rem; font-weight: 600; color: var(--primary); }
.result-header-actions { display: flex; align-items: center; gap: 0.6rem; }
.score-chip {
  font-size: 0.78rem;
  color: var(--text-muted);
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.15rem 0.5rem;
}
.export-btn { font-size: 0.78rem; padding: 0.25rem 0.65rem; }
.accepted-chip {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--success);
  background: white;
  border: 1px solid var(--success);
  border-radius: 10px;
  padding: 0.15rem 0.5rem;
}

.accepted-option { border-color: var(--success); }
.accepted-option .result-header { background: #f0faf3; }
.accepted-option .result-header h3 { color: var(--success); }
.accepted-empty .result-summary { color: var(--text-muted); font-style: italic; }

.result-summary {
  padding: 0.5rem 1.1rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.result-summary .warn { color: var(--danger); }
.result-summary .ok   { color: var(--success); }

.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.9rem;
  padding: 1.1rem;
}
.table-result {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.65rem 0.75rem;
}
.table-result-hdr {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}
.table-result ul { list-style: none; }
.table-result li { font-size: 0.85rem; padding: 0.1rem 0; }

.violations {
  padding: 0.65rem 1.1rem;
  border-top: 1px solid var(--border);
  font-size: 0.82rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.v-apart { color: var(--danger); }
.v-split  { color: var(--text-muted); }

.no-results {
  text-align: center;
  color: var(--text-muted);
  padding: 3rem 1rem;
  font-size: 0.9rem;
}
</style>
