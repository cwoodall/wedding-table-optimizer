<script setup lang="ts">
import { usePlannerStore } from '../stores/planner';

const store = usePlannerStore();

function addTable() {
  store.tables.push(8);
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
      <div v-for="(_, i) in store.tables" :key="i" class="table-chip">
        <label>T{{ i + 1 }}</label>
        <input
          type="number"
          v-model.number="store.tables[i]"
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
  flex-wrap: wrap;
  gap: 0.5rem;
}

.table-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.3rem 0.5rem;
  font-size: 0.82rem;
}
.table-chip label { color: var(--text-muted); white-space: nowrap; }
.table-chip input[type='number'] {
  width: 48px;
  padding: 0.18rem 0.3rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.875rem;
  text-align: center;
}
.table-chip input[type='number']:focus {
  outline: none;
  border-color: var(--primary-light);
}
</style>
