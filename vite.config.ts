import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Served from https://cwoodall.github.io/wedding-table-optimizer/, so production
// builds need the repo name as the base path. Dev server stays at '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/wedding-table-optimizer/' : '/',
  plugins: [vue()],
}));
