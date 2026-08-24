<script setup lang="ts">
import { ref } from 'vue';
import { usePlannerStore } from '../stores/planner';
import { parseCSV, buildGuestsAndGroups } from '../utils/csv';

const store = usePlannerStore();

const fileInput = ref<HTMLInputElement | null>(null);
const fileName = ref('');
const headers = ref<string[]>([]);
const dataRows = ref<string[][]>([]);
const nameCol = ref('');
const relCol = ref('');
const errorMsg = ref('');
const successMsg = ref('');

function resetParsed() {
  headers.value = [];
  dataRows.value = [];
  fileName.value = '';
  nameCol.value = '';
  relCol.value = '';
  if (fileInput.value) fileInput.value.value = '';
}

function findHeader(candidates: string[]): string {
  for (const candidate of candidates) {
    const match = headers.value.find(h => h.toLowerCase() === candidate);
    if (match) return match;
  }
  return '';
}

function onFileChange(e: Event) {
  errorMsg.value = '';
  successMsg.value = '';
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  fileName.value = file.name;

  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result ?? '').replace(/^\uFEFF/, '');
    const rows = parseCSV(text);
    if (rows.length === 0) {
      errorMsg.value = 'That CSV file appears to be empty.';
      headers.value = [];
      dataRows.value = [];
      return;
    }
    headers.value = rows[0].map(h => h.trim());
    dataRows.value = rows.slice(1).filter(r => r.some(cell => cell.trim() !== ''));

    nameCol.value = findHeader(['guest name']) || headers.value[0] || '';
    relCol.value = findHeader(['group', 'relationship', 'relationship group', 'household']);
  };
  reader.onerror = () => {
    errorMsg.value = 'Could not read that file.';
  };
  reader.readAsText(file);
}

function doImport() {
  errorMsg.value = '';
  successMsg.value = '';
  if (dataRows.value.length === 0) {
    errorMsg.value = 'Choose a CSV file first.';
    return;
  }
  try {
    const result = buildGuestsAndGroups(headers.value, dataRows.value, nameCol.value, relCol.value);
    if (result.guests.length === 0) {
      errorMsg.value = 'No guest names found in that column.';
      return;
    }

    if (store.guestCount > 0 || store.groups.length > 0) {
      const ok = window.confirm(
        `This will replace the current ${store.guestCount} guest(s) and ${store.groups.length} group(s) with ` +
        `${result.guests.length} guest(s) and ${result.groups.length} group(s) from the CSV. Continue?`,
      );
      if (!ok) return;
    }

    store.applyImportedGuests(result.guests, result.groups);

    const notes = [`Imported ${result.guests.length} guest(s) and ${result.groups.length} group(s).`];
    if (result.duplicateCount) notes.push(`${result.duplicateCount} duplicate name(s) skipped.`);
    if (result.blankNameCount) notes.push(`${result.blankNameCount} row(s) with a blank name skipped.`);
    successMsg.value = notes.join(' ');
    resetParsed();
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : String(e);
  }
}
</script>

<template>
  <div class="csv-panel">
    <p class="hint">
      Not sure how to format your file? See the "CSV Format" tab above for column names and an
      example.
    </p>

    <label class="btn btn-ghost file-btn">
      Choose CSV file&hellip;
      <input ref="fileInput" type="file" accept=".csv,text/csv" hidden @change="onFileChange" />
    </label>
    <span v-if="fileName" class="file-name">{{ fileName }}</span>

    <template v-if="headers.length">
      <div class="csv-cols">
        <label>
          Guest name column
          <select v-model="nameCol">
            <option v-for="h in headers" :key="h" :value="h">{{ h }}</option>
          </select>
        </label>
        <label>
          Relationship column <span class="optional">(optional)</span>
          <select v-model="relCol">
            <option value="">(none)</option>
            <option v-for="h in headers" :key="h" :value="h">{{ h }}</option>
          </select>
        </label>
      </div>

      <p class="hint">
        {{ dataRows.length }} row(s) detected. Guests sharing the same value in the relationship
        column are imported as a "must sit together" group.
      </p>

      <button class="btn btn-primary" @click="doImport">Import {{ dataRows.length }} row(s)</button>
    </template>

    <p v-if="errorMsg" class="csv-msg csv-error">{{ errorMsg }}</p>
    <p v-if="successMsg" class="csv-msg csv-success">{{ successMsg }}</p>
  </div>
</template>

<style scoped>
.csv-panel {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.file-name { font-size: 0.8rem; color: var(--text-muted); margin-left: 0.5rem; }

.csv-cols {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.csv-cols label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.78rem;
  color: var(--text-muted);
}
.csv-cols select {
  padding: 0.32rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 5px;
  font-size: 0.875rem;
  color: var(--text);
  background: white;
}
.csv-cols select:focus { outline: none; border-color: var(--primary-light); }
.optional { font-weight: 400; }

.csv-msg { font-size: 0.8rem; }
.csv-error { color: var(--danger); }
.csv-success { color: var(--success); }
</style>
