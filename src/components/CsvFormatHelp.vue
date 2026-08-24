<script setup lang="ts">
import { downloadCSV } from '../utils/csv';

const exampleRows: string[][] = [
  ['Guest Name', 'Group'],
  ['Alex Rivera', 'Rivera Family'],
  ['Jordan Rivera', 'Rivera Family'],
  ['Casey Kim', 'Kim Family'],
  ['Morgan Kim', 'Kim Family'],
  ['Taylor Chen', ''],
  ['Sam Patel', ''],
];

const exampleCSV = exampleRows.map(r => r.join(',')).join('\n');

function downloadExample() {
  downloadCSV('example-guest-list.csv', exampleRows);
}
</script>

<template>
  <div class="help-page">
    <div class="card">
      <div class="card-title">
        <span>CSV Format Guide</span>
        <button class="btn btn-ghost" @click="downloadExample">Download example CSV</button>
      </div>

      <p class="hint intro">
        The importer (Guests &amp; Tables &rarr; Import from CSV) reads a plain CSV file with a
        header row. You tell it which column holds guest names and, optionally, which column
        groups guests together &mdash; the column names don't have to match exactly what's shown
        here, you type in whatever your file uses.
      </p>

      <h3>1. Guest name column</h3>
      <p class="hint">
        One row per guest. The default column name the importer looks for is
        <code>Guest Name</code>, but you can change it in the import panel to match your file
        (matching ignores case and surrounding spaces). Rows with a blank name are skipped, and
        duplicate names (after the first) are skipped too.
      </p>

      <h3>2. Relationship / group column (optional)</h3>
      <p class="hint">
        The default column name is <code>Group</code>. Guests who share the exact same, non-blank
        value in this column are imported as a <strong>must sit together</strong> group (a hard
        constraint, same as setting weight&nbsp;1.0 on the Relationships tab). Leave the cell
        blank for a guest with no group tie &mdash; blank values are never grouped together.
      </p>
      <p class="hint">
        This column can only express "must sit together" groups. "Prefer together" and
        "prefer apart" relationships aren't representable in the CSV &mdash; add those afterward
        on the Relationships tab.
      </p>

      <h3>3. Example</h3>
      <div class="table-wrap">
        <table class="example-table">
          <thead>
            <tr>
              <th v-for="h in exampleRows[0]" :key="h">{{ h }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in exampleRows.slice(1)" :key="i">
              <td v-for="(cell, ci) in row" :key="ci">{{ cell || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <pre class="csv-raw">{{ exampleCSV }}</pre>
      <p class="hint">
        Here, the two Riveras are seated together, the two Kims are seated together, and Taylor
        and Sam have no group tie.
      </p>

      <h3>4. A few gotchas</h3>
      <ul class="hint gotchas">
        <li>The first row must be a header row with column names.</li>
        <li>Blank rows are ignored.</li>
        <li>
          If a name or group value contains a comma, quote, or line break, wrap it in double
          quotes, e.g. <code>"Smith, Jr."</code> (standard CSV quoting).
        </li>
        <li>
          Importing replaces the current guest list and relationship groups &mdash; you'll be
          asked to confirm first if you already have guests or groups set up.
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.help-page { max-width: 720px; margin: 0 auto; }
h3 { font-size: 0.9rem; font-weight: 600; margin: 1.25rem 0 0.4rem; color: var(--text); }
h3:first-of-type { margin-top: 1rem; }
.intro { margin-bottom: 0.25rem; }
code {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.05rem 0.35rem;
  font-size: 0.85em;
}

.table-wrap { overflow-x: auto; margin-top: 0.5rem; }
.example-table {
  border-collapse: collapse;
  font-size: 0.85rem;
  width: 100%;
}
.example-table th,
.example-table td {
  border: 1px solid var(--border);
  padding: 0.35rem 0.6rem;
  text-align: left;
  white-space: nowrap;
}
.example-table th { background: var(--bg); font-weight: 600; }

.csv-raw {
  margin-top: 0.6rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
  font-size: 0.8rem;
  overflow-x: auto;
}

.gotchas { padding-left: 1.1rem; display: flex; flex-direction: column; gap: 0.3rem; }
.gotchas li { list-style: disc; }
</style>
