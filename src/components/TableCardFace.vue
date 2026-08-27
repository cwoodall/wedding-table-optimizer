<script setup lang="ts">
import { computed } from 'vue';
import type { CardImage } from '../types';

const props = defineProps<{
  guestName: string;
  tableLabel: string;
  image: CardImage;
  widthIn: number;
  heightIn: number;
  borderEnabled: boolean;
  borderColor: string;
  borderWidthPt: number;
  stampEnabled: boolean;
  stampWidthIn: number;
  stampHeightIn: number;
  stampLabel: string;
  rotated?: boolean;
}>();

const hasImage = computed(() => props.image.kind !== 'none');

const faceStyle = computed(() => ({
  width: `${props.widthIn}in`,
  height: `${props.heightIn}in`,
  border: props.borderEnabled ? `${props.borderWidthPt}pt solid ${props.borderColor}` : 'none',
  transform: props.rotated ? 'rotate(180deg)' : undefined,
}));

const stampStyle = computed(() => ({
  width: `${props.stampWidthIn}in`,
  height: `${props.stampHeightIn}in`,
}));
</script>

<template>
  <div class="card-face" :style="faceStyle">
    <div v-if="hasImage" class="card-image-col">
      <span v-if="image.kind === 'emoji'" class="card-emoji">{{ image.emoji }}</span>
      <span v-else-if="image.kind === 'monogram'" class="card-monogram">{{ image.monogramText }}</span>
      <img v-else-if="image.kind === 'upload' && image.uploadDataUrl" class="card-upload" :src="image.uploadDataUrl" alt="" />
    </div>
    <div class="card-text-col">
      <div class="card-guest-name">{{ guestName }}</div>
      <div class="card-table-label">{{ tableLabel }}</div>
    </div>
    <div v-if="stampEnabled" class="card-stamp-box" :style="stampStyle">
      <span class="card-stamp-label">{{ stampLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.card-face {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.12in;
  box-sizing: border-box;
  padding: 0.12in;
  background: var(--card-bg, white);
  font-family: var(--card-font, Georgia, serif);
  overflow: hidden;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.card-image-col {
  flex: 0 0 30%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.card-emoji { font-size: 2rem; line-height: 1; font-family: 'Noto Emoji', sans-serif; }
.card-monogram {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--card-primary, #8b5e3c);
  letter-spacing: 0.03em;
}
.card-upload {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-text-col {
  flex: 1;
  min-width: 0;
}
.card-guest-name {
  font-size: var(--card-name-size, 13pt);
  font-weight: 600;
  color: var(--card-primary, #8b5e3c);
  line-height: 1.25;
  overflow-wrap: break-word;
}
.card-table-label {
  margin-top: 0.06in;
  font-size: calc(var(--card-name-size, 13pt) * 0.78);
  letter-spacing: 0.06em;
  color: var(--card-secondary, #c4956a);
}

.card-stamp-box {
  position: absolute;
  right: 0.1in;
  bottom: 0.1in;
  border: 1pt dashed var(--card-secondary, #c4956a);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-stamp-label {
  font-size: 0.55rem;
  letter-spacing: 0.05em;
  color: var(--card-secondary, #c4956a);
  opacity: 0.7;
  text-transform: uppercase;
}
</style>
