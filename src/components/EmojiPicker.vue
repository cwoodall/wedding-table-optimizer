<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { EMOJI_CATEGORIES } from '../data/emoji';
import { ensureGoogleFont } from '../utils/fonts';

defineProps<{ modelValue: string }>();
const emit = defineEmits<{ 'update:modelValue': [string] }>();

// Renders with Google's Noto Emoji (monochrome outline glyphs) so the picker
// preview matches what prints, instead of whatever emoji font the OS ships —
// and unlike Noto Color Emoji, a plain outline font prints reliably across browsers.
ensureGoogleFont('Noto+Emoji');

const open = ref(false);
const query = ref('');
const rootEl = ref<HTMLElement | null>(null);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return EMOJI_CATEGORIES;
  return EMOJI_CATEGORIES
    .map(cat => ({
      name: cat.name,
      items: cat.items.filter(e => e.label.includes(q) || e.keywords.some(k => k.includes(q))),
    }))
    .filter(cat => cat.items.length > 0);
});

function pick(char: string) {
  emit('update:modelValue', char);
  open.value = false;
  query.value = '';
}

function onDocMouseDown(e: MouseEvent) {
  if (open.value && rootEl.value && !rootEl.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener('mousedown', onDocMouseDown));
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocMouseDown));
</script>

<template>
  <div class="emoji-picker" ref="rootEl">
    <button type="button" class="emoji-picker-trigger" @click="open = !open">
      <span class="emoji-glyph">{{ modelValue || '➕' }}</span>
      <span class="emoji-picker-caret">▾</span>
    </button>
    <div v-if="open" class="emoji-picker-panel">
      <input
        type="text"
        class="emoji-picker-search"
        v-model="query"
        placeholder="Search emoji…"
        autofocus
      />
      <div class="emoji-picker-scroll">
        <div v-for="cat in filtered" :key="cat.name" class="emoji-picker-cat">
          <div class="emoji-picker-cat-name">{{ cat.name }}</div>
          <div class="emoji-picker-grid">
            <button
              v-for="e in cat.items"
              :key="e.char"
              type="button"
              class="emoji-picker-item"
              :title="e.label"
              @click="pick(e.char)"
            >
              <span class="emoji-glyph">{{ e.char }}</span>
            </button>
          </div>
        </div>
        <p v-if="!filtered.length" class="emoji-picker-empty">No matches.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.emoji-glyph { font-family: 'Noto Emoji', sans-serif; }

.emoji-picker { position: relative; display: inline-block; }
.emoji-picker-trigger {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.5rem;
  border: 1px solid #e8e0d8;
  border-radius: 5px;
  background: white;
  cursor: pointer;
}
.emoji-picker-trigger .emoji-glyph { font-size: 1.1rem; line-height: 1; }
.emoji-picker-caret { font-size: 0.65rem; color: #8a7060; }

.emoji-picker-panel {
  position: absolute;
  z-index: 20;
  top: calc(100% + 4px);
  left: 0;
  width: 260px;
  background: white;
  border: 1px solid #e8e0d8;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  padding: 0.5rem;
}
.emoji-picker-search {
  width: 100%;
  padding: 0.32rem 0.5rem;
  border: 1px solid #e8e0d8;
  border-radius: 5px;
  font-size: 0.8rem;
  margin-bottom: 0.4rem;
  box-sizing: border-box;
}
.emoji-picker-scroll { max-height: 220px; overflow-y: auto; }
.emoji-picker-cat { margin-bottom: 0.5rem; }
.emoji-picker-cat-name {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8a7060;
  margin-bottom: 0.25rem;
}
.emoji-picker-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.15rem;
}
.emoji-picker-item {
  border: none;
  background: none;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 4px;
  line-height: 1;
}
.emoji-picker-item .emoji-glyph { font-size: 1.2rem; }
.emoji-picker-item:hover { background: #f4efe9; }
.emoji-picker-empty { font-size: 0.78rem; color: #8a7060; text-align: center; padding: 0.5rem 0; }
</style>
