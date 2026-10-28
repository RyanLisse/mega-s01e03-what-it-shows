<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { causeOf, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  const rows = reports as Report[];
  const unique = uniqueById(rows);
  const temporal = new Set(notes.oneDayMove);
  const structural = unique.map((report) => ({ report, cause: causeOf(report, tenantOf(report)) }));
  const buckets = [
    {
      problem: 'shared parser reads day-first dates as month-first',
      reports: structural.filter(({ report, cause }) => cause === 'parser' && !temporal.has(report.id)).length,
      status: 'mechanism supported',
    },
    {
      problem: 'booking-v3 gives a month-first hint to day-first tenants',
      reports: structural.filter(({ cause }) => cause === 'hint').length,
      status: 'mechanism supported',
    },
    {
      problem: 'temporal anomalies hidden under parser',
      reports: unique.filter((report) => temporal.has(report.id)).length,
      status: 'cause unknown',
    },
  ];
  const tagMismatches = structural.filter(({ report, cause }) => cause !== report.meta.intakeTag).length;
  const julyBatch = unique.filter((report) => report.mergedAt?.startsWith('2026-07-02')).length;
</script>

<p class="sum">
  <strong>{rows.length}</strong> exported rows · <strong>{unique.length}</strong> unique reports ·
  <strong>{rows.length - unique.length}</strong> repeated rows
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>evidence</th></tr></thead>
  <tbody>
    {#each buckets as bucket (bucket.problem)}
      <tr><td>{bucket.problem}</td><td>{bucket.reports}</td><td>{bucket.status}</td></tr>
    {/each}
  </tbody>
</table>

<p class="note">
  Intake tags disagree with the structural route for {tagMismatches} reports. The desk merged
  {julyBatch} reports on 2 July. The five temporal reports are {notes.oneDayMove.join(', ')}.
</p>

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85rem; }
</style>
