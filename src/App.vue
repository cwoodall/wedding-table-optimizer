<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePlannerStore } from './stores/planner';
import GuestList from './components/GuestList.vue';
import TableConfig from './components/TableConfig.vue';
import RelationshipGroups from './components/RelationshipGroups.vue';
import ResultsView from './components/ResultsView.vue';
import HelpGuide from './components/HelpGuide.vue';
import { downloadJSON } from './utils/download';
import { resetChartPrefs } from './utils/chartPrefs';

type Tab = 'guide' | 'setup' | 'relationships' | 'results';

const store = usePlannerStore();
const activeTab = ref<Tab>('guide');
const jsonFileInput = ref<HTMLInputElement | null>(null);

onMounted(() => store.loadFromStorage());

function goToResults() {
  activeTab.value = 'results';
}

function resetToDefaults() {
  store.resetToDefaults();
  resetChartPrefs();
}

function exportJson() {
  downloadJSON('wedding-table-planner.json', store.exportState());
}

function onImportJson(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result ?? ''));
      const ok = window.confirm(
        'This will replace all current guests, tables, and groups with the contents of this file. Continue?',
      );
      if (ok) store.importState(data);
    } catch {
      window.alert('That file is not valid JSON.');
    } finally {
      if (jsonFileInput.value) jsonFileInput.value.value = '';
    }
  };
  reader.readAsText(file);
}
</script>

<template>
  <header>
    <h1>Wedding Table Planner</h1>
    <span class="subtitle">
      {{ store.guestCount }} guests &middot;
      {{ store.tables.length }} tables &middot;
      {{ store.totalSeats }} seats
    </span>
    <span class="header-actions">
      <label class="btn btn-ghost">
        Import JSON
        <input ref="jsonFileInput" type="file" accept=".json,application/json" hidden @change="onImportJson" />
      </label>
      <button class="btn btn-ghost" @click="exportJson">Export JSON</button>
      <button class="btn btn-ghost" @click="resetToDefaults">Reset to defaults</button>
    </span>
  </header>

  <nav>
    <button class="tab-btn" :class="{ active: activeTab === 'guide' }" @click="activeTab = 'guide'">
      Guide
    </button>
    <button class="tab-btn" :class="{ active: activeTab === 'setup' }" @click="activeTab = 'setup'">
      Guests &amp; Tables
    </button>
    <button class="tab-btn" :class="{ active: activeTab === 'relationships' }" @click="activeTab = 'relationships'">
      Relationships
    </button>
    <button class="tab-btn" :class="{ active: activeTab === 'results' }" @click="activeTab = 'results'">
      Run &amp; Results
    </button>
  </nav>

  <main class="content">
    <HelpGuide v-if="activeTab === 'guide'" @go-to-tab="t => activeTab = t" />
    <div v-else-if="activeTab === 'setup'" class="grid-2">
      <GuestList />
      <TableConfig />
    </div>
    <RelationshipGroups v-else-if="activeTab === 'relationships'" />
    <ResultsView v-else-if="activeTab === 'results'" @go-to-results="goToResults" />
  </main>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.9rem 2rem;
  background: white;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}
h1 { font-size: 1.25rem; font-weight: 600; color: var(--primary); }
.subtitle { font-size: 0.82rem; color: var(--text-muted); }
.header-actions { display: flex; gap: 0.5rem; margin-left: auto; }
.header-actions .btn { font-size: 0.8rem; }

nav {
  display: flex;
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 0 2rem;
}
.tab-btn {
  padding: 0.7rem 1.1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
}
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); font-weight: 500; }
.tab-btn:hover:not(.active) { color: var(--text); }

.content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.75rem 2rem;
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 720px) { .grid-2 { grid-template-columns: 1fr; } }
</style>
