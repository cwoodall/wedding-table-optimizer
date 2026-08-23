import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { DEFAULT_GUESTS, DEFAULT_TABLES, DEFAULT_GROUPS } from '../data/defaults';
import { optimize } from '../algorithm/optimize';
import type { RelationshipGroup, OptimizationResult } from '../types';

const STORAGE_KEY = 'wedding-planner-v1';

export const usePlannerStore = defineStore('planner', () => {
  const guests = ref<string[]>([...DEFAULT_GUESTS]);
  const tables = ref<number[]>([...DEFAULT_TABLES]);
  const groups = ref<RelationshipGroup[]>(
    DEFAULT_GROUPS.map(g => ({ ...g, members: [...g.members] })),
  );
  const numOptions = ref(3);

  const results = ref<OptimizationResult[] | null>(null);
  const running = ref(false);
  const error = ref<string | null>(null);

  // Derived
  const guestCount = computed(() => guests.value.filter(g => g.trim()).length);
  const totalSeats = computed(() => tables.value.reduce((a, b) => a + b, 0));
  const validGuests = computed(() => guests.value.filter(g => g.trim()));
  const validCaps = computed(() => tables.value.filter(c => c > 0));

  // ── Persistence ──────────────────────────────────────────────────────────

  function loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as Partial<{
        guests: string[];
        tables: number[];
        groups: RelationshipGroup[];
        numOptions: number;
      }>;
      if (Array.isArray(data.guests)) guests.value = data.guests;
      if (Array.isArray(data.tables)) tables.value = data.tables;
      if (Array.isArray(data.groups)) groups.value = data.groups;
      if (typeof data.numOptions === 'number') numOptions.value = data.numOptions;
    } catch {
      // Corrupt storage — ignore and leave defaults in place.
    }
  }

  function resetToDefaults(): void {
    guests.value = [...DEFAULT_GUESTS];
    tables.value = [...DEFAULT_TABLES];
    groups.value = DEFAULT_GROUPS.map(g => ({ ...g, members: [...g.members] }));
    numOptions.value = 3;
    results.value = null;
    error.value = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  watch(
    [guests, tables, groups, numOptions],
    () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          guests: guests.value,
          tables: tables.value,
          groups: groups.value,
          numOptions: numOptions.value,
        }),
      );
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
      results.value = optimize(validGuests.value, groups.value, validCaps.value, numOptions.value);
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
    guestCount, totalSeats, validGuests, validCaps,
    // Actions
    loadFromStorage, resetToDefaults, runOptimization,
  };
});
