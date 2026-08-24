<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { usePlannerStore } from '../stores/planner';
import CsvImport from './CsvImport.vue';
import { downloadCSV } from '../utils/csv';

const store = usePlannerStore();
const listEl = ref<HTMLElement | null>(null);
const showImport = ref(false);

async function addGuest() {
  store.guests.push('');
  await nextTick();
  const inputs = listEl.value?.querySelectorAll<HTMLInputElement>('input');
  inputs?.[inputs.length - 1]?.focus();
}

function removeGuest(i: number) {
  store.guests.splice(i, 1);
}

function groupLabel(g: { name?: string }, gi: number): string {
  return g.name?.trim() || `Group ${gi + 1}`;
}

function exportGuestList() {
  // One column per relationship group so every group (hard, soft, or apart) round-trips
  // through re-import, using its name as both the header and the cell value. The weight
  // isn't stored in the CSV data itself — it's shown in the header as a reminder, and gets
  // picked up automatically when the column is selected during re-import.
  const headerRow = [
    'Guest Name',
    ...store.groups.map((g, gi) => `${groupLabel(g, gi)} (weight ${g.weight.toFixed(1)})`),
  ];

  const rows: string[][] = [headerRow];
  for (const name of store.validGuests) {
    const row = [name];
    store.groups.forEach((g, gi) => {
      row.push(g.members.includes(name) ? groupLabel(g, gi) : '');
    });
    rows.push(row);
  }
  downloadCSV('guest-list.csv', rows);
}
</script>

<template>
  <div class="card">
    <div class="card-title">
      <span>Guests ({{ store.guestCount }})</span>
      <span class="title-actions">
        <button class="btn btn-ghost" @click="showImport = !showImport">
          {{ showImport ? 'Hide Import' : 'Import from CSV' }}
        </button>
        <button class="btn btn-ghost" @click="exportGuestList" :disabled="store.guestCount === 0">
          Export CSV
        </button>
        <button class="btn btn-ghost" @click="addGuest">+ Add Guest</button>
      </span>
    </div>

    <CsvImport v-if="showImport" />

    <div class="guest-list" ref="listEl">
      <div v-for="(_, i) in store.guests" :key="i" class="guest-row">
        <input
          v-model="store.guests[i]"
          :placeholder="`Guest ${i + 1}`"
          @keydown.enter="addGuest"
        />
        <button class="del-btn" @click="removeGuest(i)" title="Remove guest">✕</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title-actions { display: flex; gap: 0.5rem; }
.guest-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-height: 460px;
  overflow-y: auto;
}
.guest-row {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}
.guest-row input {
  flex: 1;
  padding: 0.32rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 5px;
  font-size: 0.875rem;
  color: var(--text);
  background: var(--bg);
}
.guest-row input:focus {
  outline: none;
  border-color: var(--primary-light);
  background: white;
}
</style>
