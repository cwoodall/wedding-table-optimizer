<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePlannerStore } from './stores/planner';
import GuestList from './components/GuestList.vue';
import TableConfig from './components/TableConfig.vue';
import RelationshipGroups from './components/RelationshipGroups.vue';
import ResultsView from './components/ResultsView.vue';
import CsvFormatHelp from './components/CsvFormatHelp.vue';

type Tab = 'setup' | 'relationships' | 'results' | 'csv-help';

const store = usePlannerStore();
const activeTab = ref<Tab>('setup');

onMounted(() => store.loadFromStorage());

function goToResults() {
  activeTab.value = 'results';
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
    <button class="btn btn-ghost reset-btn" @click="store.resetToDefaults()">Reset to defaults</button>
  </header>

  <nav>
    <button class="tab-btn" :class="{ active: activeTab === 'setup' }" @click="activeTab = 'setup'">
      Guests &amp; Tables
    </button>
    <button class="tab-btn" :class="{ active: activeTab === 'relationships' }" @click="activeTab = 'relationships'">
      Relationships
    </button>
    <button class="tab-btn" :class="{ active: activeTab === 'results' }" @click="activeTab = 'results'">
      Run &amp; Results
    </button>
    <button class="tab-btn" :class="{ active: activeTab === 'csv-help' }" @click="activeTab = 'csv-help'">
      CSV Format
    </button>
  </nav>

  <main class="content">
    <div v-if="activeTab === 'setup'" class="grid-2">
      <GuestList />
      <TableConfig />
    </div>
    <RelationshipGroups v-else-if="activeTab === 'relationships'" />
    <ResultsView v-else-if="activeTab === 'results'" @go-to-results="goToResults" />
    <CsvFormatHelp v-else-if="activeTab === 'csv-help'" />
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
.reset-btn { margin-left: auto; font-size: 0.8rem; }

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
