<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { usePlannerStore } from '../stores/planner';

const store = usePlannerStore();
const listEl = ref<HTMLElement | null>(null);

async function addGuest() {
  store.guests.push('');
  await nextTick();
  const inputs = listEl.value?.querySelectorAll<HTMLInputElement>('input');
  inputs?.[inputs.length - 1]?.focus();
}

function removeGuest(i: number) {
  store.guests.splice(i, 1);
}
</script>

<template>
  <div class="card">
    <div class="card-title">
      <span>Guests ({{ store.guestCount }})</span>
      <button class="btn btn-ghost" @click="addGuest">+ Add Guest</button>
    </div>

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
