# Wedding Table Planner

A browser-based tool for assigning wedding guests to tables. You enter your
guest list, table capacities, and relationship preferences (who must sit
together, who'd like to sit together, who should be kept apart), and the app
searches for seatings that maximize everyone's happiness while respecting
table capacity and any hard constraints.

The optimizer runs entirely client-side: it builds a weighted "who wants to
sit with whom" matrix, collapses hard-linked guests into blocks, and uses
simulated annealing to search for high-scoring table assignments
(`src/algorithm/matrix.ts`, `anneal.ts`, `optimize.ts`). Guest/table/
relationship state lives in a Pinia store (`src/stores/planner.ts`) and is
persisted to local storage so your setup survives a page reload.

## Tech stack

- [Vue 3](https://vuejs.org/) (`<script setup>` SFCs) + [Pinia](https://pinia.vuejs.org/) for state
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for dev server and bundling

## Project structure

```
src/
  algorithm/    Pure TypeScript seating optimizer (no framework deps)
  components/   Guest list, table config, relationship groups, results view
  stores/       Pinia store holding planner state
  data/         Default sample data
  App.vue       Top-level layout / tab navigation
```

## Getting started

Requires [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm run dev
```

This starts the Vite dev server (prints a local URL, typically
`http://localhost:5173`) with hot module reloading.

## Building

```bash
npm run build
```

Type-checks the project with `vue-tsc` and produces a static production
build in `dist/`. Preview the built output locally with:

```bash
npm run preview
```

## Deploying

The build output in `dist/` is a fully static site (HTML/CSS/JS, no server
required), so it can be deployed to any static host. A few common options:

- **Netlify / Vercel**: connect the repo and set the build command to
  `npm run build` with publish directory `dist`.
- **GitHub Pages**: run `npm run build`, then push the contents of `dist/`
  to a `gh-pages` branch (e.g. via the [`gh-pages`](https://www.npmjs.com/package/gh-pages) package or a GitHub Actions workflow).
- **Any static file host / CDN** (S3, Cloudflare Pages, etc.): run
  `npm run build` and upload the contents of `dist/`.

No environment variables or backend services are required.
