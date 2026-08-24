<script setup lang="ts">
import { usePlannerStore } from '../stores/planner';

const store = usePlannerStore();

function addTable() {
  store.tables.push({ name: `Table ${store.tables.length + 1}`, capacity: 8 });
}

function removeTable(i: number) {
  store.tables.splice(i, 1);
}
</script>

<template>
  <div class="card">
    <div class="card-title">
      <span>Tables ({{ store.tables.length }})</span>
      <button class="btn btn-ghost" @click="addTable">+ Add Table</button>
    </div>

    <p class="hint" style="margin-bottom: 0.75rem;">
      Total seats: <strong>{{ store.totalSeats }}</strong>
      &nbsp;&middot;&nbsp;
      Guests: <strong>{{ store.guestCount }}</strong>
      <span v-if="store.totalSeats < store.guestCount" class="over-capacity">
        &nbsp;— not enough seats!
      </span>
    </p>

    <div class="tables-list">
      <div v-for="(t, i) in store.tables" :key="i" class="table-chip">
        <input
          type="text"
          class="table-name"
          v-model="t.name"
          :placeholder="`Table ${i + 1}`"
        />
        <input
          type="number"
          class="table-cap"
          v-model.number="t.capacity"
          min="1"
          max="100"
        />
        <button class="del-btn" @click="removeTable(i)" title="Remove table">✕</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.over-capacity { color: var(--danger); font-weight: 500; }

.tables-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.table-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.3rem 0.5rem;
  font-size: 0.82rem;
}
.table-chip input {
  padding: 0.28rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--text);
  background: white;
}
.table-chip input:focus {
  outline: none;
  border-color: var(--primary-light);
}
.table-name { flex: 1; min-width: 0; }
.table-cap { width: 56px; text-align: center; flex-shrink: 0; }
</style>
