import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { DEFAULT_GUESTS, DEFAULT_TABLES, DEFAULT_GROUPS } from '../data/defaults';
import { optimize } from '../algorithm/optimize';
import type { RelationshipGroup, TableSpec, OptimizationResult } from '../types';

const STORAGE_KEY = 'wedding-planner-v1';

interface PersistedState {
  guests: string[];
  tables: TableSpec[];
  groups: RelationshipGroup[];
  numOptions: number;
}

function cloneTables(tables: TableSpec[]): TableSpec[] {
  return tables.map(t => ({ ...t }));
}

function cloneGroups(groups: RelationshipGroup[]): RelationshipGroup[] {
  return groups.map(g => ({ ...g, members: [...g.members] }));
}

/** Accepts both the current TableSpec[] shape and the older plain number[] capacities
 *  (pre-existing localStorage saves), normalizing either into TableSpec[]. */
function normalizeTables(raw: unknown[]): TableSpec[] {
  return raw.map((t, i) => {
    if (typeof t === 'number') return { name: `Table ${i + 1}`, capacity: t };
    if (t && typeof t === 'object' && 'capacity' in t) {
      const obj = t as { name?: unknown; capacity?: unknown };
      return {
        name: typeof obj.name === 'string' ? obj.name : `Table ${i + 1}`,
        capacity: Number(obj.capacity) || 0,
      };
    }
    return { name: `Table ${i + 1}`, capacity: 0 };
  });
}

export const usePlannerStore = defineStore('planner', () => {
  const guests = ref<string[]>([...DEFAULT_GUESTS]);
  const tables = ref<TableSpec[]>(cloneTables(DEFAULT_TABLES));
  const groups = ref<RelationshipGroup[]>(cloneGroups(DEFAULT_GROUPS));
  const numOptions = ref(3);

  const results = ref<OptimizationResult[] | null>(null);
  const running = ref(false);
  const error = ref<string | null>(null);

  // Derived
  const guestCount = computed(() => guests.value.filter(g => g.trim()).length);
  const totalSeats = computed(() => tables.value.reduce((a, t) => a + t.capacity, 0));
  const validGuests = computed(() => guests.value.filter(g => g.trim()));
  const validTables = computed(() => tables.value.filter(t => t.capacity > 0));
  const validCaps = computed(() => validTables.value.map(t => t.capacity));

  // ── Persistence ──────────────────────────────────────────────────────────

  function applyPersistedState(data: Partial<PersistedState>): void {
    if (Array.isArray(data.guests)) guests.value = data.guests;
    if (Array.isArray(data.tables)) tables.value = normalizeTables(data.tables);
    if (Array.isArray(data.groups)) groups.value = data.groups;
    if (typeof data.numOptions === 'number') numOptions.value = data.numOptions;
  }

  function loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      applyPersistedState(JSON.parse(raw));
    } catch {
      // Corrupt storage — ignore and leave defaults in place.
    }
  }

  function exportState(): PersistedState {
    return {
      guests: guests.value,
      tables: tables.value,
      groups: groups.value,
      numOptions: numOptions.value,
    };
  }

  function importState(data: Partial<PersistedState>): void {
    applyPersistedState(data);
    results.value = null;
    error.value = null;
  }

  function applyImportedGuests(newGuests: string[], newGroups: RelationshipGroup[]): void {
    guests.value = newGuests;
    groups.value = newGroups;
    results.value = null;
    error.value = null;
  }

  function resetToDefaults(): void {
    guests.value = [...DEFAULT_GUESTS];
    tables.value = cloneTables(DEFAULT_TABLES);
    groups.value = cloneGroups(DEFAULT_GROUPS);
    numOptions.value = 3;
    results.value = null;
    error.value = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  watch(
    [guests, tables, groups, numOptions],
    () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exportState()));
    },
    { deep: true },
  );

  // ── Optimization ─────────────────────────────────────────────────────────

  async function runOptimization(): Promise<void> {
    if (running.value) return;
    running.value = true;
    error.value = null;
    results.value = null;

    // Yield to Vue so the UI updates (spinner appears) before the blocking loop.
    await new Promise(resolve => setTimeout(resolve, 30));

    try {
      if (validGuests.value.length === 0) throw new Error('No guests added.');
      if (validCaps.value.length === 0) throw new Error('No tables configured.');
      results.value = optimize(
        validGuests.value,
        groups.value,
        validCaps.value,
        numOptions.value,
        validTables.value.map(t => t.name),
      );
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      running.value = false;
    }
  }

  return {
    // State
    guests, tables, groups, numOptions,
    results, running, error,
    // Derived
    guestCount, totalSeats, validGuests, validTables, validCaps,
    // Actions
    loadFromStorage, resetToDefaults, applyImportedGuests, exportState, importState, runOptimization,
  };
});
