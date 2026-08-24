<script setup lang="ts">
defineEmits<{ 'go-to-tab': [tab: 'setup' | 'relationships' | 'results' | 'csv-help'] }>();
</script>

<template>
  <div class="guide">
    <div class="card">
      <div class="card-title"><span>How This Works</span></div>
      <p class="hint intro">
        There are three steps to generating a seating plan: add your guests and tables, tell the
        planner who needs to sit together (or apart), then run the optimizer and review the
        results. You can jump back and forth between these steps as much as you like &mdash;
        everything is saved automatically in your browser as you go.
      </p>
    </div>

    <div class="card step">
      <div class="step-hdr">
        <span class="step-num">1</span>
        <h3>Add guests &amp; tables</h3>
        <button class="btn btn-ghost" @click="$emit('go-to-tab', 'setup')">Go to Guests &amp; Tables</button>
      </div>

      <p class="hint">On the <strong>Guests &amp; Tables</strong> tab:</p>
      <ul class="hint step-list">
        <li>
          Add guests one at a time with <strong>+ Add Guest</strong>, or bring in a whole list at
          once with <strong>Import from CSV</strong>. See the <button class="link-btn" @click="$emit('go-to-tab', 'csv-help')">CSV Format</button>
          tab for exactly what the file should look like.
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

    <div class="card step">
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

    <div class="card step">
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
      </ul>
      <p class="hint">
        Not the result you wanted? Go back and adjust groups, table sizes, or the guest list, then
        run again &mdash; nothing is final until you export it.
      </p>
    </div>

    <div class="card step">
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
  </div>
</template>

<style scoped>
.guide { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }
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
</style>
