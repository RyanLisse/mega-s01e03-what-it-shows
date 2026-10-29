<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { causeOf, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  const rows = reports as Report[];
  const unique = uniqueById(rows);
  const orderingReportId = 'R-41236';
  const oneDayMove = new Set(notes.oneDayMove.filter((id) => id !== orderingReportId));
  const structural = unique.map((report) => ({ report, cause: causeOf(report, tenantOf(report)) }));
  const parser = structural.filter(({ cause }) => cause === 'parser');
  const buckets = [
    {
      problem: 'parser',
      reports: parser.length,
      status: 'desk cause; includes five footnoted anomalies',
    },
    {
      problem: 'booking-v3 gives a month-first hint to day-first tenants',
      reports: structural.filter(({ cause }) => cause === 'hint').length,
      status: 'mechanism supported',
    },
  ];
  const tagMismatches = structural.filter(({ report, cause }) => cause !== report.meta.intakeTag).length;
  const julyBatch = unique.filter((report) => report.mergedAt?.startsWith('2026-07-02')).length;
</script>

<p class="sum">
  <strong>{rows.length}</strong> exported rows · <strong>{unique.length}</strong> unique reports ·
  <strong>{rows.length - unique.length}</strong> repeated rows
</p>

<table data-problem-table>
  <thead><tr><th>problem</th><th>reports</th><th>evidence</th></tr></thead>
  <tbody>
    {#each buckets as bucket (bucket.problem)}
      <tr><td>{bucket.problem}</td><td>{bucket.reports}</td><td>{bucket.status}</td></tr>
    {/each}
  </tbody>
</table>

<p class="note">
  The desk's cause counts are {parser.length} parser plus {buckets[1].reports} hint, which equals
  {unique.length}. The desk notes flag five reports already counted in parser. These symptoms are
  evidence to investigate, not additional causes or problem tickets.
</p>

<ul class="note">
  <li>Four apparent one-day or time-zone symptoms: {[...oneDayMove].join(', ')}.</li>
  <li>One ordering symptom: {orderingReportId} says the invite arrived before the booking existed.</li>
</ul>

<p class="note">
  Intake tags disagree with the structural route for {tagMismatches} reports. The desk merged
  {julyBatch} reports on 2 July.
</p>

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85rem; }
</style>
