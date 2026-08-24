<script setup lang="ts">
import { downloadCSV } from '../utils/csv';

const exampleRows: string[][] = [
  ['Guest Name', 'Family Group', 'Friend Group'],
  ['Alex Rivera', 'Rivera Family', ''],
  ['Jordan Rivera', 'Rivera Family', ''],
  ['Casey Kim', 'Kim Family', 'College Crew'],
  ['Morgan Kim', 'Kim Family', ''],
  ['Taylor Chen', '', 'College Crew'],
  ['Sam Patel', '', 'College Crew'],
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
        header row. After you choose a file, you pick which column holds guest names and, from a
        dropdown of your file's actual columns, which column(s) group guests together &mdash;
        the column names in your file can be anything, you just select them from the list.
      </p>

      <h3>1. Guest name column</h3>
      <p class="hint">
        One row per guest. The importer defaults to a column named
        <code>Guest Name</code> if it finds one, otherwise the first column &mdash; you can pick
        a different one from the dropdown. Rows with a blank name are skipped, and duplicate
        names (after the first) are skipped too.
      </p>

      <h3>2. Group columns (optional, any number)</h3>
      <p class="hint">
        A group column is any column in your file where guests who share the exact same,
        non-blank value should be grouped together &mdash; e.g. a "Family Group" or
        "Household" column. Leave a cell blank for a guest with no tie in that column;
        blanks are never grouped.
      </p>
      <p class="hint">
        You're not limited to one. Click <strong>+ Add group column</strong> in the import panel
        once for each grouping your file contains, so you can capture more than one kind of
        relationship at the same time &mdash; e.g. a "Family Group" column for hard seating
        requirements and a separate "Friend Group" column for softer preferences.
      </p>

      <h3>3. Setting each group column's weight</h3>
      <p class="hint">
        The weight is <strong>not</strong> a value you put in a cell &mdash; it's a setting that
        applies to the whole group column, once per group column. After you pick a file:
      </p>
      <ol class="hint gotchas gotchas-ol">
        <li>Click <strong>+ Add group column</strong> (one row appears per group column).</li>
        <li>In that row's <strong>Column</strong> dropdown, pick the CSV column to group by.</li>
        <li>
          The <strong>Weight</strong> field right next to it fills in automatically if the
          column's header carries a weight (see below) &mdash; otherwise it defaults to
          <code>1.0</code>. You can always type a different value.
        </li>
      </ol>
      <p class="hint">
        <strong>Header shortcut:</strong> if a column's header includes the word "weight"
        followed by a number, e.g. <code>Friend Group (weight 0.6)</code> or
        <code>Family Group (weight: 1.0)</code>, that number is used as the weight the moment
        you pick that column &mdash; no need to type it in. This is exactly the format
        "Export CSV" produces, so a file you export and later re-import will have its weights
        filled in for you automatically.
      </p>
      <p class="hint">
        The weight number controls how strongly guests in the same group are seated together:
        <strong>1.0 or higher</strong> means <strong>must sit together</strong> (a hard
        constraint), <strong>0 to 1</strong> means <strong>prefer together</strong> (a soft
        nudge), and <strong>negative</strong> means <strong>prefer apart</strong>. Repeat steps
        1&ndash;3 for each additional group column, giving each its own weight.
      </p>

      <h3>4. Example</h3>
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
        To import this file: add one group column set to "Family Group" with weight
        <code>1.0</code> (seats the two Riveras together and the two Kims together), and a second
        group column set to "Friend Group" with weight <code>0.6</code> (nudges Casey, Taylor,
        and Sam toward the same table without forcing it).
      </p>

      <h3>5. A few gotchas</h3>
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
.gotchas-ol li { list-style: decimal; }
</style>
