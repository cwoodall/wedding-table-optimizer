import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Served from https://cwoodall.github.io/wedding-table-optimizer/, so the GitHub Pages
// build needs the repo name as the base path. Note: `vite preview` runs with the same
// command ('serve') as the dev server, not 'build', so base can't be keyed off `command`
// — it's keyed off GH_PAGES instead, set by the deploy workflow. Local build/preview stay
// at '/' so `npm run build && npm run preview` works without extra flags.
export default defineConfig({
  base: process.env.GH_PAGES ? '/wedding-table-optimizer/' : '/',
  plugins: [vue()],
});
