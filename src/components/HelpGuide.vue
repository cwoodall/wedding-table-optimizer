<script setup lang="ts">
import { ref } from 'vue';
import CsvFormatHelp from './CsvFormatHelp.vue';

defineEmits<{ 'go-to-tab': [tab: 'setup' | 'relationships' | 'results'] }>();

type Section = 'overview' | 'guests-tables' | 'relationships' | 'results' | 'backup' | 'csv-format';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'guests-tables', label: 'Guests & Tables' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'results', label: 'Run & Results' },
  { id: 'backup', label: 'Back Up & Restore' },
  { id: 'csv-format', label: 'CSV Format' },
];

const activeSection = ref<Section>('overview');
</script>

<template>
  <div class="guide-layout">
    <nav class="guide-nav">
      <button
        v-for="s in SECTIONS"
        :key="s.id"
        class="guide-nav-btn"
        :class="{ active: activeSection === s.id }"
        @click="activeSection = s.id"
      >
        {{ s.label }}
      </button>
    </nav>

    <div class="guide-content">
      <div v-if="activeSection === 'overview'" class="card">
        <div class="card-title"><span>How This Works</span></div>
        <p class="hint intro">
          There are three steps to generating a seating plan: add your guests and tables, tell the
          planner who needs to sit together (or apart), then run the optimizer and review the
          results. You can jump back and forth between these steps as much as you like &mdash;
          everything is saved automatically in your browser as you go.
        </p>
      </div>

      <div v-else-if="activeSection === 'guests-tables'" class="card step">
        <div class="step-hdr">
          <span class="step-num">1</span>
          <h3>Add guests &amp; tables</h3>
          <button class="btn btn-ghost" @click="$emit('go-to-tab', 'setup')">Go to Guests &amp; Tables</button>
        </div>

        <p class="hint">On the <strong>Guests &amp; Tables</strong> tab:</p>
        <ul class="hint step-list">
          <li>
            Add guests one at a time with <strong>+ Add Guest</strong>, or bring in a whole list at
            once with <strong>Import from CSV</strong>. See the
            <button class="link-btn" @click="activeSection = 'csv-format'">CSV Format</button>
            section for exactly what the file should look like.
          </li>
          <li>Use <strong>Export CSV</strong> any time to save a backup of your current guest list.</li>
          <li>
            In the Tables panel, set how many tables you have, name each one (e.g. "Head Table" or
            "Table 1"), and set how many seats it holds, using <strong>+ Add Table</strong> and the
            name/seat-count fields on each table chip.
          </li>
          <li>
            Keep an eye on the seat count &mdash; you'll see a warning if you have more guests than
            seats.
          </li>
        </ul>
      </div>

      <div v-else-if="activeSection === 'relationships'" class="card step">
        <div class="step-hdr">
          <span class="step-num">2</span>
          <h3>Set up relationships</h3>
          <button class="btn btn-ghost" @click="$emit('go-to-tab', 'relationships')">Go to Relationships</button>
        </div>

        <p class="hint">
          On the <strong>Relationships</strong> tab, click <strong>+ Add Group</strong> to create a
          group, give it a name if you'd like (e.g. "Rivera Family"), then add guests to it and set
          a <strong>weight</strong> that controls how strongly they should be seated together:
        </p>
        <ul class="hint step-list">
          <li><strong>1.0 or higher &mdash; must sit together.</strong> A hard constraint, e.g. a couple, an immediate family, or a table that has to be exactly these people.</li>
          <li><strong>Between 0 and 1 &mdash; prefer together.</strong> A soft nudge, e.g. a friend group you'd like at the same table if possible, but it's fine if they end up split.</li>
          <li><strong>Negative &mdash; prefer apart.</strong> The optimizer will try to keep these guests at different tables.</li>
        </ul>
        <p class="hint">
          A group can have any number of members. If the same two guests appear in more than one
          group, the group lower on the list wins &mdash; so put broad soft preferences near the top
          and firm hard constraints near the bottom.
        </p>
        <p class="hint">
          This step is optional: guests with no group are seated wherever they fit best.
        </p>
      </div>

      <div v-else-if="activeSection === 'results'" class="card step">
        <div class="step-hdr">
          <span class="step-num">3</span>
          <h3>Run &amp; review results</h3>
          <button class="btn btn-ghost" @click="$emit('go-to-tab', 'results')">Go to Run &amp; Results</button>
        </div>

        <p class="hint">On the <strong>Run &amp; Results</strong> tab:</p>
        <ul class="hint step-list">
          <li>Pick how many different seating options to generate, then click <strong>Run Optimization</strong>.</li>
          <li>Each option shows a score (higher is better) &mdash; the optimizer sorts options best-first.</li>
          <li>
            Any hard "prefer apart" violations or split soft preferences are called out under each
            option, so you can see exactly what was traded off.
          </li>
          <li>Happy with an option? Use its <strong>Export CSV</strong> button to download the table assignments.</li>
          <li>
            Or click <strong>Seating Chart PDF</strong> for a printable chart &mdash; pick a title,
            font, and colors, then use your browser's print dialog to save it as a PDF. It prints an
            alphabetical guest list (with each guest's table) and a by-table guest list.
          </li>
        </ul>
        <p class="hint">
          Not the result you wanted? Go back and adjust groups, table sizes, or the guest list, then
          run again &mdash; nothing is final until you export it.
        </p>
      </div>

      <div v-else-if="activeSection === 'backup'" class="card step">
        <div class="step-hdr">
          <h3>Back up or restore everything</h3>
        </div>
        <p class="hint">
          Your guests, tables, and groups are saved automatically in this browser as you go, but
          that only covers this device. Use <strong>Export JSON</strong> in the header any time to
          download a single file with your entire setup, and <strong>Import JSON</strong> to load
          one back in &mdash; handy for switching computers or keeping a backup before making big
          changes.
        </p>
      </div>

      <CsvFormatHelp v-else-if="activeSection === 'csv-format'" />
    </div>
  </div>
</template>

<style scoped>
.guide-layout {
  display: flex;
  align-items: flex-start;
  gap: 1.75rem;
}

.guide-nav {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  width: 180px;
  flex-shrink: 0;
  position: sticky;
  top: 1rem;
}
.guide-nav-btn {
  text-align: left;
  padding: 0.5rem 0.7rem;
  border: none;
  background: none;
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.guide-nav-btn:hover:not(.active) { background: var(--bg); color: var(--text); }
.guide-nav-btn.active { background: var(--primary); color: white; font-weight: 500; }

.guide-content { flex: 1; min-width: 0; max-width: 720px; }

.intro { margin-top: 0.1rem; }

.step-hdr {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.75rem;
}
.step-hdr h3 { font-size: 0.95rem; font-weight: 600; color: var(--text); flex: 1; }
.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
}

.step-list { padding-left: 1.1rem; display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.4rem; }
.step-list li { list-style: disc; }
.step p + p { margin-top: 0.5rem; }
.step p + ul { margin-top: 0.4rem; }

.link-btn {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--primary);
  text-decoration: underline;
  cursor: pointer;
}

@media (max-width: 720px) {
  .guide-layout { flex-direction: column; }
  .guide-nav {
    flex-direction: row;
    width: 100%;
    overflow-x: auto;
    position: static;
    gap: 0.35rem;
    padding-bottom: 0.25rem;
  }
  .guide-nav-btn { white-space: nowrap; flex-shrink: 0; }
  .guide-content { max-width: 100%; }
}
</style>
