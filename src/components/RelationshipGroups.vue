<script setup lang="ts">
import { usePlannerStore } from '../stores/planner';

const store = usePlannerStore();

function addGroup() {
  store.groups.push({ members: [], weight: 1.0 });
}

function removeGroup(i: number) {
  store.groups.splice(i, 1);
}

function removeMember(gi: number, mi: number) {
  store.groups[gi].members.splice(mi, 1);
}

function addMember(gi: number, event: Event) {
  const name = (event.target as HTMLSelectElement).value;
  if (name && !store.groups[gi].members.includes(name)) {
    store.groups[gi].members.push(name);
  }
  (event.target as HTMLSelectElement).value = '';
}

function availableFor(gi: number): string[] {
  const current = new Set(store.groups[gi].members);
  return store.validGuests.filter(g => !current.has(g));
}

function groupClass(weight: number): string {
  if (weight >= 1.0) return 'is-hard';
  if (weight > 0)    return 'is-soft';
  return 'is-apart';
}

function badgeClass(weight: number): string {
  if (weight >= 1.0) return 'badge-hard';
  if (weight > 0)    return 'badge-soft';
  return 'badge-apart';
}

function badgeLabel(weight: number): string {
  if (weight >= 1.0) return 'must together';
  if (weight > 0)    return 'prefer together';
  return 'prefer apart';
}
</script>

<template>
  <div>
    <div class="section-bar">
      <p class="hint">
        Weight &ge;1 = must sit together (hard constraint). 0&ndash;1 = prefer together.
        Negative = prefer apart. Later groups override earlier ones for the same pair.
      </p>
      <button class="btn btn-primary" @click="addGroup">+ Add Group</button>
    </div>

    <div class="group-list">
      <div
        v-for="(grp, gi) in store.groups"
        :key="gi"
        class="group-card"
        :class="groupClass(grp.weight)"
      >
        <div class="group-top">
          <span class="badge" :class="badgeClass(grp.weight)">{{ badgeLabel(grp.weight) }}</span>

          <div class="weight-row">
            <label>weight</label>
            <input
              type="number"
              v-model.number="grp.weight"
              step="0.1"
              min="-2"
              max="2"
            />
          </div>

          <button class="del-btn" @click="removeGroup(gi)" title="Remove group" style="margin-left: 0.5rem;">✕</button>
        </div>

        <div class="members-row">
          <span v-for="(m, mi) in grp.members" :key="mi" class="member-tag">
            {{ m }}
            <button @click="removeMember(gi, mi)" title="Remove">×</button>
          </span>

          <select class="add-member-select" @change="addMember(gi, $event)">
            <option value="">+ add member</option>
            <option v-for="g in availableFor(gi)" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.group-list { display: flex; flex-direction: column; gap: 0.65rem; }

.group-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--border);
  border-radius: var(--radius);
  padding: 0.7rem 0.9rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.group-card.is-hard  { border-left-color: var(--primary); }
.group-card.is-soft  { border-left-color: var(--success); }
.group-card.is-apart { border-left-color: var(--danger); }

.group-top {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}

.weight-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
}
.weight-row label { font-size: 0.78rem; color: var(--text-muted); }
.weight-row input[type='number'] {
  width: 62px;
  padding: 0.2rem 0.35rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.82rem;
  text-align: center;
}
.weight-row input:focus { outline: none; border-color: var(--primary-light); }

.members-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: center;
}

.add-member-select {
  padding: 0.2rem 0.45rem;
  border: 1px dashed var(--border);
  border-radius: 10px;
  font-size: 0.78rem;
  color: var(--text-muted);
  background: transparent;
  cursor: pointer;
  max-width: 140px;
}
</style>
